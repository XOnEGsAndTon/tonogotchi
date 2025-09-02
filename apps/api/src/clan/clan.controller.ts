import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DbService } from '../common/db.service';
import { eq } from 'drizzle-orm';

@Controller('clan')
export class ClanController {
  constructor(private readonly dbs: DbService) {}

  @Post('create')
  async create(@Body() body: { name: string; emblemUri?: string; createdBy: string }) {
    const { clans } = this.dbs.tables;
    const res = await this.dbs.db
      .insert(clans)
      .values({ name: body.name, emblemUri: body.emblemUri, createdBy: body.createdBy })
      .returning({ id: clans.id });
    return { id: res[0].id };
  }

  @Post('join')
  async join(@Body() body: { clanId: number; userId: string; role?: string }) {
    const { clanMembers } = this.dbs.tables;
    await this.dbs.db.insert(clanMembers).values({ clanId: body.clanId, userId: body.userId, role: body.role || 'member' });
    return { ok: true };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const { clans } = this.dbs.tables;
    const rows = await this.dbs.db.select().from(clans).where(eq(clans.id, Number(id))).limit(1);
    if (!rows[0]) return { error: 'not_found' };
    return rows[0];
  }
}

