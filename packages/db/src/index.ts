import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export type DB = ReturnType<typeof drizzle<typeof schema>>;

export async function makeDb(connString: string) {
  const client = new Client({ connectionString: connString });
  await client.connect();
  const db = drizzle(client, { schema });
  return { db, client };
}

export * as tables from './schema';

