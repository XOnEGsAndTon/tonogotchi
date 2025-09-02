import { pgTable, serial, varchar, integer, boolean, timestamp, jsonb, index, primaryKey } from 'drizzle-orm/pg-core';

export const pets = pgTable('pets', {
  id: serial('id').primaryKey(),
  nftAddr: varchar('nft_addr', { length: 128 }).notNull().unique(),
  ownerTon: varchar('owner_ton', { length: 128 }).notNull(),
  rarity: varchar('rarity', { length: 32 }).notNull(),
  species: varchar('species', { length: 32 }).notNull(),
  birthTime: timestamp('birth_time', { withTimezone: false }).notNull(),
  lifespanDays: integer('lifespan_days').notNull(),
  deathTime: timestamp('death_time', { withTimezone: false }),
  isDead: boolean('is_dead').notNull().default(false),
  dnaHash: varchar('dna_hash', { length: 128 }).notNull(),
  baseStatsJson: jsonb('base_stats_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow().notNull(),
}, (t) => ({
  ownerIdx: index('pets_owner_idx').on(t.ownerTon),
}));

export const careEvents = pgTable('care_events', {
  id: serial('id').primaryKey(),
  petId: integer('pet_id').notNull(),
  type: varchar('type', { length: 16 }).notNull(),
  at: timestamp('at', { withTimezone: false }).defaultNow().notNull(),
  meta: jsonb('meta'),
}, (t) => ({
  petIdx: index('care_pet_idx').on(t.petId),
  atIdx: index('care_at_idx').on(t.at),
}));

export const breedingSessions = pgTable('breeding_sessions', {
  id: serial('id').primaryKey(),
  parentAAddr: varchar('parentA_addr', { length: 128 }).notNull(),
  parentBAddr: varchar('parentB_addr', { length: 128 }).notNull(),
  startAt: timestamp('start_at', { withTimezone: false }).defaultNow().notNull(),
  endAt: timestamp('end_at', { withTimezone: false }),
  commitHash: varchar('commit_hash', { length: 128 }).notNull(),
  revealSeed: varchar('reveal_seed', { length: 256 }),
  state: varchar('state', { length: 32 }).notNull(), // pending | locked | revealed | minted | canceled
});

export const users = pgTable('users', {
  tgId: varchar('tg_id', { length: 64 }).primaryKey(),
  tonAddr: varchar('ton_addr', { length: 128 }),
  joinedAt: timestamp('joined_at', { withTimezone: false }).defaultNow().notNull(),
  flags: jsonb('flags'),
});

export const clans = pgTable('clans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  emblemUri: varchar('emblem_uri', { length: 256 }),
  createdBy: varchar('created_by', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow().notNull(),
});

export const clanMembers = pgTable('clan_members', {
  clanId: integer('clan_id').notNull(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  role: varchar('role', { length: 16 }).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: false }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.clanId, t.userId], name: 'clan_members_pk' }),
}));

