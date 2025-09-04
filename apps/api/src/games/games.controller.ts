import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { DbService } from '../common/db.service';
import { and, desc, eq, gt, lte, or, sql } from 'drizzle-orm';
import { DAILY_FARM_CAP, computeAgingMultiplier } from '@tonogotchi/shared';

function nowUtc(): Date { return new Date(); }

function startOfUtcDay(d: Date): Date { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0)); }

function generateRhythmPattern(len = 16, bpm = 120) {
  // Beats every 500ms at 120 bpm
  const intervalMs = Math.round(60000 / bpm);
  // generate a sparse hit pattern with ~50% density
  const beats: number[] = Array.from({ length: len }, () => (Math.random() < 0.5 ? 1 : 0));
  // Ensure non-empty
  if (beats.reduce((a, b) => a + b, 0) === 0) beats[0] = 1;
  return { bpm, intervalMs, len, beats };
}

@Controller('games')
export class GamesController {
  constructor(private readonly dbs: DbService) {}

  @Post('rhythm/start')
  async rhythmStart(@Body() body: { tgId: string; petAddr: string }) {
    if (!body.tgId || !body.petAddr) throw new HttpException('bad_request', HttpStatus.BAD_REQUEST);
    const { pets, breedingSessions, gameSessions } = this.dbs.tables as any;
    const petRows = await this.dbs.db.select().from(pets).where(eq(pets.nftAddr, body.petAddr)).limit(1);
    if (!petRows[0]) throw new HttpException('pet_not_found', HttpStatus.NOT_FOUND);
    const pet = petRows[0];
    if (pet.isDead) throw new HttpException('pet_dead', HttpStatus.CONFLICT);
    // Disallow if currently in locked breeding
    const activeBreed = await this.dbs.db.execute(sql`SELECT 1 FROM breeding_sessions WHERE (parentA_addr=${body.petAddr} OR parentB_addr=${body.petAddr}) AND state='locked' AND end_at IS NOT NULL AND end_at > NOW() LIMIT 1`);
    const abRows = (activeBreed as any).rows || activeBreed;
    if (abRows.length) throw new HttpException('breeding_lock', HttpStatus.CONFLICT);

    const pattern = generateRhythmPattern(16, 120);
    const start = nowUtc();
    const expires = new Date(start.getTime() + pattern.intervalMs * pattern.len + 5000);
    const res = await this.dbs.db.insert((this.dbs.tables as any).gameSessions).values({
      userId: body.tgId,
      petId: pet.id,
      kind: 'rhythm',
      pattern,
      startedAt: start,
      expiresAt: expires,
      state: 'active',
    }).returning({ id: (this.dbs.tables as any).gameSessions.id });
    return { sessionId: res[0].id, pattern };
  }

  @Post('rhythm/submit')
  async rhythmSubmit(@Body() body: { sessionId: number; hits: number[] }) {
    if (!body.sessionId || !Array.isArray(body.hits)) throw new HttpException('bad_request', HttpStatus.BAD_REQUEST);
    const { gameSessions, pets, farmEvents } = this.dbs.tables as any;
    const rows = await this.dbs.db.select().from(gameSessions).where(eq(gameSessions.id, body.sessionId)).limit(1);
    const s = rows[0];
    if (!s) throw new HttpException('not_found', HttpStatus.NOT_FOUND);
    if (s.state !== 'active') throw new HttpException('bad_state', HttpStatus.CONFLICT);
    const now = nowUtc();
    if (now > new Date(s.expiresAt)) throw new HttpException('expired', HttpStatus.GONE);
    const pattern = s.pattern as any as { bpm: number; intervalMs: number; len: number; beats: number[] };
    // Simple anti-bot: hits length must be <= len and sorted and not too dense
    const hits = [...body.hits].sort((a, b) => a - b).filter((x) => Number.isFinite(x) && x >= 0 && x <= pattern.intervalMs * pattern.len + 250);
    for (let i = 1; i < hits.length; i++) if (hits[i] - hits[i - 1] < 50) throw new HttpException('too_dense', HttpStatus.FORBIDDEN);

    // Score: for each expected beat=1, accept closest hit in window ±120ms
    const WINDOW = 120;
    const PERFECT = 40, GOOD = 80, OK = 120;
    let used: boolean[] = hits.map(() => false);
    let base = 0;
    for (let i = 0; i < pattern.len; i++) {
      if (!pattern.beats[i]) continue;
      const center = i * pattern.intervalMs;
      let bestIdx = -1, bestAbs = Number.MAX_SAFE_INTEGER;
      for (let h = 0; h < hits.length; h++) {
        if (used[h]) continue;
        const d = hits[h] - center;
        const ad = Math.abs(d);
        if (ad <= WINDOW && ad < bestAbs) { bestAbs = ad; bestIdx = h; }
      }
      if (bestIdx >= 0) {
        used[bestIdx] = true;
        if (bestAbs <= PERFECT) base += 10; else if (bestAbs <= GOOD) base += 7; else if (bestAbs <= OK) base += 5;
      }
    }

    // Compute multiplier and cap
    const petRows = await this.dbs.db.select().from(pets).where(eq(pets.id, s.petId as number)).limit(1);
    const pet = petRows[0];
    const ageDays = Math.floor((now.getTime() - new Date(pet.birthTime).getTime()) / (24 * 60 * 60 * 1000));
    const mult = computeAgingMultiplier(ageDays, pet.lifespanDays);
    const pointsRaw = Math.round(base * mult);
    const dayStart = startOfUtcDay(now);
    const earnedRows = await this.dbs.db.execute(sql`SELECT COALESCE(SUM(points),0) as sum FROM farm_events WHERE pet_id = ${pet.id} AND at >= ${dayStart}`);
    const erows = (earnedRows as any).rows || earnedRows;
    const already = Number(erows[0]?.sum || 0);
    const left = Math.max(0, DAILY_FARM_CAP - already);
    const award = Math.min(left, pointsRaw);
    await this.dbs.db.update(gameSessions).set({ submittedAt: now, state: 'submitted', score: base }).where(eq(gameSessions.id, body.sessionId));
    if (award > 0) {
      await this.dbs.db.insert(farmEvents).values({ petId: pet.id, type: 'active', points: award, meta: { base, mult } });
    }
    return { base, multiplier: mult, pointsAwarded: award, capLeft: Math.max(0, left - award) };
  }
}
