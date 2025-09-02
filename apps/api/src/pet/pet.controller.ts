import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { DbService } from '../common/db.service';
import { eq } from 'drizzle-orm';

@Controller('pet')
export class PetController {
  constructor(private readonly dbs: DbService) {}

  @Get(':addr')
  async getPet(@Param('addr') addr: string) {
    const { pets, careEvents } = this.dbs.tables;
    const pet = await this.dbs.db.select().from(pets).where(eq(pets.nftAddr, addr)).limit(1);
    if (!pet[0]) return { error: 'not_found' };
    const p = pet[0];
    const cares = await this.dbs.db
      .select()
      .from(careEvents)
      .where(eq(careEvents.petId, p.id))
      .orderBy(careEvents.at);
    return { pet: p, careEvents: cares };
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
}

