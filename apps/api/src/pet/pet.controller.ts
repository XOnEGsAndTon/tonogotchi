import { Controller, Get, Param, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { DbService } from '../common/db.service';
import { eq } from 'drizzle-orm';
import { computeAgingMultiplier, DAILY_FARM_CAP, NEGLECT_DAYS_TO_DEATH, Rarity, RARITY_LIFESPAN_DAYS } from '@tonogotchi/shared';
import { sql } from 'drizzle-orm';

function startOfUtcDay(d: Date): Date { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0)); }

@Controller('pet')
export class PetController {
  constructor(private readonly dbs: DbService) {}

  @Get('test')
  async getOrCreateTestPet(@Query('tgId') tgId?: string) {
    if (!tgId) throw new HttpException('bad_request', HttpStatus.BAD_REQUEST);
    const testAddr = `test:${tgId}`;
    const { pets } = this.dbs.tables as any;
    let petRows = await this.dbs.db.select().from(pets).where(eq(pets.nftAddr, testAddr)).limit(1);
    if (!petRows[0]) {
      const rarity: Rarity = 'common';
      const lifespanDays = RARITY_LIFESPAN_DAYS[rarity];
      const now = new Date();
      const baseStats = { friendliness: 60, forage: 50, careBoost: 40, nightOwl: 30, resilience: 55 };
      await this.dbs.db.insert(pets).values({
        nftAddr: testAddr,
        ownerTon: tgId,
        rarity,
        species: 'capybara',
        birthTime: now,
        lifespanDays,
        deathTime: null,
        isDead: false,
        dnaHash: 'TEST_' + tgId,
        baseStatsJson: baseStats as any,
      });
      petRows = await this.dbs.db.select().from(pets).where(eq(pets.nftAddr, testAddr)).limit(1);
    }
    const p = petRows[0];
    const { careEvents, farmEvents } = this.dbs.tables as any;
    const cares = await this.dbs.db.select().from(careEvents).where(eq(careEvents.petId, p.id)).orderBy(careEvents.at);
    const now = new Date();
    const ageDays = Math.floor((now.getTime() - new Date(p.birthTime).getTime()) / (24 * 60 * 60 * 1000));
    const multiplier = computeAgingMultiplier(ageDays, p.lifespanDays);
    const lastCare = cares.length ? new Date(cares[cares.length - 1].at) : undefined;
    const neglectDeadlineAt = lastCare ? new Date(lastCare.getTime() + NEGLECT_DAYS_TO_DEATH * 86400000) : new Date(new Date(p.birthTime).getTime() + NEGLECT_DAYS_TO_DEATH * 86400000);
    const er = await this.dbs.db.execute(sql`SELECT COALESCE(SUM(points),0) as sum FROM farm_events WHERE pet_id = ${p.id} AND at >= ${startOfUtcDay(now)}`);
    const earnedToday = Number(((er as any).rows || er)[0]?.sum || 0);
    const capLeft = Math.max(0, DAILY_FARM_CAP - earnedToday);
    return { pet: p, careEvents: cares, status: { ageDays, multiplier, earnedToday, capLeft, neglectDeadlineAt } };
  }

  @Get(':addr')
  async getPet(@Param('addr') addr: string) {
    const { pets, careEvents, farmEvents } = this.dbs.tables as any;
    const pet = await this.dbs.db.select().from(pets).where(eq(pets.nftAddr, addr)).limit(1);
    if (!pet[0]) return { error: 'not_found' };
    const p = pet[0];
    const cares = await this.dbs.db
      .select()
      .from(careEvents)
      .where(eq(careEvents.petId, p.id))
      .orderBy(careEvents.at);
    const now = new Date();
    const ageDays = Math.floor((now.getTime() - new Date(p.birthTime).getTime()) / (24 * 60 * 60 * 1000));
    const multiplier = computeAgingMultiplier(ageDays, p.lifespanDays);
    const lastCare = cares.length ? new Date(cares[cares.length - 1].at) : undefined;
    const neglectDeadlineAt = lastCare ? new Date(lastCare.getTime() + NEGLECT_DAYS_TO_DEATH * 86400000) : new Date(new Date(p.birthTime).getTime() + NEGLECT_DAYS_TO_DEATH * 86400000);
    const er = await this.dbs.db.execute(sql`SELECT COALESCE(SUM(points),0) as sum FROM farm_events WHERE pet_id = ${p.id} AND at >= ${startOfUtcDay(now)}`);
    const earnedToday = Number(((er as any).rows || er)[0]?.sum || 0);
    const capLeft = Math.max(0, DAILY_FARM_CAP - earnedToday);
    return { pet: p, careEvents: cares, status: { ageDays, multiplier, earnedToday, capLeft, neglectDeadlineAt } };
  }

  @Post(':addr/care')
  async postCare(@Param('addr') addr: string, @Body() body: { type: string }) {
    const { pets, careEvents } = this.dbs.tables;
    const pet = await this.dbs.db.select().from(pets).where(eq(pets.nftAddr, addr)).limit(1);
    if (!pet[0]) return { error: 'not_found' };
    const p = pet[0];
    // TODO: validate daily limits/energy per design
    await this.dbs.db.insert(careEvents).values({ petId: p.id, type: body.type, meta: null });
    return { ok: true };
  }

  @Post('test/care')
  async postTestCare(@Query('tgId') tgId: string, @Body() body: { type: string }) {
    if (!tgId || !body?.type) throw new HttpException('bad_request', HttpStatus.BAD_REQUEST);
    const testAddr = `test:${tgId}`;
    const { pets, careEvents } = this.dbs.tables as any;
    const petRows = await this.dbs.db.select().from(pets).where(eq(pets.nftAddr, testAddr)).limit(1);
    if (!petRows[0]) throw new HttpException('not_found', HttpStatus.NOT_FOUND);
    const p = petRows[0];
    await this.dbs.db.insert(careEvents).values({ petId: p.id, type: body.type, meta: { test: true } });
    return { ok: true };
  }
}
