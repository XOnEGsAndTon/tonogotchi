"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameSessions = exports.farmEvents = exports.clanMembers = exports.clans = exports.users = exports.breedingSessions = exports.careEvents = exports.pets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.pets = (0, pg_core_1.pgTable)('pets', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    nftAddr: (0, pg_core_1.varchar)('nft_addr', { length: 128 }).notNull().unique(),
    ownerTon: (0, pg_core_1.varchar)('owner_ton', { length: 128 }).notNull(),
    rarity: (0, pg_core_1.varchar)('rarity', { length: 32 }).notNull(),
    species: (0, pg_core_1.varchar)('species', { length: 32 }).notNull(),
    birthTime: (0, pg_core_1.timestamp)('birth_time', { withTimezone: false }).notNull(),
    lifespanDays: (0, pg_core_1.integer)('lifespan_days').notNull(),
    deathTime: (0, pg_core_1.timestamp)('death_time', { withTimezone: false }),
    isDead: (0, pg_core_1.boolean)('is_dead').notNull().default(false),
    dnaHash: (0, pg_core_1.varchar)('dna_hash', { length: 128 }).notNull(),
    baseStatsJson: (0, pg_core_1.jsonb)('base_stats_json').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow().notNull(),
}, (t) => ({
    ownerIdx: (0, pg_core_1.index)('pets_owner_idx').on(t.ownerTon),
}));
exports.careEvents = (0, pg_core_1.pgTable)('care_events', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    petId: (0, pg_core_1.integer)('pet_id').notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 16 }).notNull(),
    at: (0, pg_core_1.timestamp)('at', { withTimezone: false }).defaultNow().notNull(),
    meta: (0, pg_core_1.jsonb)('meta'),
}, (t) => ({
    petIdx: (0, pg_core_1.index)('care_pet_idx').on(t.petId),
    atIdx: (0, pg_core_1.index)('care_at_idx').on(t.at),
}));
exports.breedingSessions = (0, pg_core_1.pgTable)('breeding_sessions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    parentAAddr: (0, pg_core_1.varchar)('parentA_addr', { length: 128 }).notNull(),
    parentBAddr: (0, pg_core_1.varchar)('parentB_addr', { length: 128 }).notNull(),
    startAt: (0, pg_core_1.timestamp)('start_at', { withTimezone: false }).defaultNow().notNull(),
    endAt: (0, pg_core_1.timestamp)('end_at', { withTimezone: false }),
    commitHash: (0, pg_core_1.varchar)('commit_hash', { length: 128 }).notNull(),
    revealSeed: (0, pg_core_1.varchar)('reveal_seed', { length: 256 }),
    state: (0, pg_core_1.varchar)('state', { length: 32 }).notNull(), // pending | locked | revealed | minted | canceled
});
exports.users = (0, pg_core_1.pgTable)('users', {
    tgId: (0, pg_core_1.varchar)('tg_id', { length: 64 }).primaryKey(),
    tonAddr: (0, pg_core_1.varchar)('ton_addr', { length: 128 }),
    joinedAt: (0, pg_core_1.timestamp)('joined_at', { withTimezone: false }).defaultNow().notNull(),
    flags: (0, pg_core_1.jsonb)('flags'),
});
exports.clans = (0, pg_core_1.pgTable)('clans', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 64 }).notNull(),
    emblemUri: (0, pg_core_1.varchar)('emblem_uri', { length: 256 }),
    createdBy: (0, pg_core_1.varchar)('created_by', { length: 64 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow().notNull(),
});
exports.clanMembers = (0, pg_core_1.pgTable)('clan_members', {
    clanId: (0, pg_core_1.integer)('clan_id').notNull(),
    userId: (0, pg_core_1.varchar)('user_id', { length: 64 }).notNull(),
    role: (0, pg_core_1.varchar)('role', { length: 16 }).notNull(),
    joinedAt: (0, pg_core_1.timestamp)('joined_at', { withTimezone: false }).defaultNow().notNull(),
}, (t) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [t.clanId, t.userId], name: 'clan_members_pk' }),
}));
exports.farmEvents = (0, pg_core_1.pgTable)('farm_events', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    petId: (0, pg_core_1.integer)('pet_id').notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 16 }).notNull(), // active | passive | care
    points: (0, pg_core_1.integer)('points').notNull(),
    at: (0, pg_core_1.timestamp)('at', { withTimezone: false }).defaultNow().notNull(),
    meta: (0, pg_core_1.jsonb)('meta'),
}, (t) => ({
    petIdx: (0, pg_core_1.index)('farm_pet_idx').on(t.petId),
    atIdx: (0, pg_core_1.index)('farm_at_idx').on(t.at),
}));
exports.gameSessions = (0, pg_core_1.pgTable)('game_sessions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id', { length: 64 }).notNull(),
    petId: (0, pg_core_1.integer)('pet_id'),
    kind: (0, pg_core_1.varchar)('kind', { length: 16 }).notNull(), // rhythm | forage | coop
    pattern: (0, pg_core_1.jsonb)('pattern').notNull(),
    startedAt: (0, pg_core_1.timestamp)('started_at', { withTimezone: false }).defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: false }).notNull(),
    submittedAt: (0, pg_core_1.timestamp)('submitted_at', { withTimezone: false }),
    score: (0, pg_core_1.integer)('score').default(0).notNull(),
    state: (0, pg_core_1.varchar)('state', { length: 16 }).notNull(), // active | submitted | expired
    meta: (0, pg_core_1.jsonb)('meta'),
}, (t) => ({
    userIdx: (0, pg_core_1.index)('game_user_idx').on(t.userId),
    kindIdx: (0, pg_core_1.index)('game_kind_idx').on(t.kind),
}));
//# sourceMappingURL=schema.js.map