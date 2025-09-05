import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { and, eq, or, sql } from 'drizzle-orm';
import { DbService } from '../common/db.service';
import { hashSeed } from '@tonogotchi/ton';

@Controller('breed')
export class BreedController {
  constructor(private readonly dbs: DbService) {}

  @Post('start')
  async start(@Body() body: { A: string; B: string; commitHash: string }) {
    if (!body.A || !body.B || !body.commitHash) throw new HttpException('bad_request', HttpStatus.BAD_REQUEST);
    if (body.A === body.B) throw new HttpException('same_parent', HttpStatus.BAD_REQUEST);
    const now = new Date();
    const lockEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const cooldownSince = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const active = await this.dbs.db
      .select()
      .from(this.dbs.tables.breedingSessions)
      .where(
        or(
          and(eq(this.dbs.tables.breedingSessions.parentAAddr, body.A), eq(this.dbs.tables.breedingSessions.state, 'locked')),
          and(eq(this.dbs.tables.breedingSessions.parentBAddr, body.A), eq(this.dbs.tables.breedingSessions.state, 'locked')),
          and(eq(this.dbs.tables.breedingSessions.parentAAddr, body.B), eq(this.dbs.tables.breedingSessions.state, 'locked')),
          and(eq(this.dbs.tables.breedingSessions.parentBAddr, body.B), eq(this.dbs.tables.breedingSessions.state, 'locked')),
        ),
      );
    if (active.length) throw new HttpException('parent_locked', HttpStatus.CONFLICT);
    const recent = await this.dbs.db.execute(sql`SELECT * FROM breeding_sessions WHERE (parentA_addr = ${body.A} OR parentB_addr = ${body.A} OR parentA_addr = ${body.B} OR parentB_addr = ${body.B}) AND end_at IS NOT NULL AND end_at > ${cooldownSince} LIMIT 1`);
    if ((recent as any).rows ? (recent as any).rows.length : (recent as any).length) throw new HttpException('cooldown', HttpStatus.CONFLICT);
    await this.dbs.db.insert(this.dbs.tables.breedingSessions).values({ parentAAddr: body.A, parentBAddr: body.B, commitHash: body.commitHash, state: 'locked', endAt: lockEnd });
    return { ok: true, lockEndsAt: lockEnd.toISOString() };
  }

  @Post('reveal')
  async reveal(@Body() body: { sessionId: number; seed: string }) {
    if (!body.sessionId || !body.seed) throw new HttpException('bad_request', HttpStatus.BAD_REQUEST);
    const rows = await this.dbs.db.select().from(this.dbs.tables.breedingSessions).where(eq(this.dbs.tables.breedingSessions.id, body.sessionId)).limit(1);
    const s = rows[0];
    if (!s) throw new HttpException('not_found', HttpStatus.NOT_FOUND);
    if (s.state !== 'locked') throw new HttpException('bad_state', HttpStatus.CONFLICT);
    const now = new Date();
    if (!s.endAt || now < new Date(s.endAt)) throw new HttpException('lock_active', HttpStatus.CONFLICT);
    const digest = hashSeed(body.seed);
    if (digest !== s.commitHash) throw new HttpException('commit_mismatch', HttpStatus.FORBIDDEN);
    await this.dbs.db.update(this.dbs.tables.breedingSessions).set({ revealSeed: body.seed, state: 'revealed' }).where(eq(this.dbs.tables.breedingSessions.id, body.sessionId));
    // Renderer is removed in MVP; no external render job is enqueued.
    return { ok: true };
  }
}
