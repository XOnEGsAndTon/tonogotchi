import { makeDb } from '@tonogotchi/db';
import { tables } from '@tonogotchi/db';
import { NEGLECT_DAYS_TO_DEATH } from '@tonogotchi/shared';
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';

async function neglectCheck(db: any) {
  const { pets, careEvents } = tables;
  const now = new Date();
  const threshold = new Date(now.getTime() - NEGLECT_DAYS_TO_DEATH * 24 * 60 * 60 * 1000);

  // Find pets not dead, whose last care event is older than threshold
  const rows = await db.execute(sql`
    SELECT p.*,
           (SELECT MAX(at) FROM care_events ce WHERE ce.pet_id = p.id) AS last_care
    FROM pets p
    WHERE p.is_dead = FALSE
  `);
  for (const r of rows) {
    const lastCare = r.last_care ? new Date(r.last_care) : null;
    if (!lastCare || lastCare < threshold) {
      // Mark as dead due to neglect
      await db.update(pets).set({ isDead: true, deathTime: now }).where(eq(pets.id, r.id));
      // TODO: call declareDeath() via TON to update on-chain content_uri
      // eslint-disable-next-line no-console
      console.log(`Declared death (neglect) for pet ${r.nft_addr}`);
    }
  }
}

async function lifespanCheck(db: any) {
  const { pets } = tables;
  const now = new Date();
  // natural death when birth_time + lifespan_days reached
  const rows = await db.select().from(pets).where(eq(pets.isDead, false));
  for (const p of rows) {
    const end = new Date(new Date(p.birthTime).getTime() + p.lifespanDays * 24 * 60 * 60 * 1000);
    if (now >= end) {
      await db.update(pets).set({ isDead: true, deathTime: now }).where(eq(pets.id, p.id));
      // TODO: call declareDeath() via TON
      // eslint-disable-next-line no-console
      console.log(`Declared natural death for pet ${p.nftAddr}`);
    }
  }
}

async function main() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('POSTGRES_URL is required');
  const { db, client } = await makeDb(url);

  // Run every 30 minutes
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await neglectCheck(db);
      await lifespanCheck(db);
    } catch (e) {
      console.error(e);
    }
    await new Promise((res) => setTimeout(res, 30 * 60 * 1000));
  }
  // eslint-disable-next-line no-unreachable
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

