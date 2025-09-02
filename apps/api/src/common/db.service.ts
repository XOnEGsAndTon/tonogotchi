import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { makeDb, tables, DB } from '@tonogotchi/db';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  public db!: DB;
  private client!: any;

  async onModuleInit() {
    const url = process.env.POSTGRES_URL;
    if (!url) throw new Error('POSTGRES_URL is required');
    const { db, client } = await makeDb(url);
    this.db = db;
    this.client = client;
  }

  async onModuleDestroy() {
    if (this.client) await this.client.end();
  }

  get tables() {
    return tables;
  }
}

