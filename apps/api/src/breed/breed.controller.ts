import { Body, Controller, Post } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService } from '../common/db.service';

@Controller('breed')
export class BreedController {
  constructor(private readonly dbs: DbService) {}

  @Post('start')
  async start(@Body() body: { A: string; B: string; commitHash: string }) {
    // TODO: TonConnect flow to lock parents for 6h
    await this.dbs.db.insert(this.dbs.tables.breedingSessions).values({
      parentAAddr: body.A,
      parentBAddr: body.B,
      commitHash: body.commitHash,
      state: 'locked',
    });
    return { ok: true };
  }

  @Post('reveal')
  async reveal(@Body() body: { sessionId: number; seed: string }) {
    // TODO: verify hash(seed), mint child via contract, call renderer, store CID
    // For stub: mark revealed
    await this.dbs.db
      .update(this.dbs.tables.breedingSessions)
      .set({ revealSeed: body.seed, state: 'revealed' })
      .where(eq(this.dbs.tables.breedingSessions.id, body.sessionId));
    return { ok: true };
  }
}
