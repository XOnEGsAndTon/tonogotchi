// Minimal SQL migration runner (idempotent) for initial schema
const { Client } = require('pg');

const sql = `
CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  nft_addr VARCHAR(128) UNIQUE NOT NULL,
  owner_ton VARCHAR(128) NOT NULL,
  rarity VARCHAR(32) NOT NULL,
  species VARCHAR(32) NOT NULL,
  birth_time TIMESTAMP NOT NULL,
  lifespan_days INTEGER NOT NULL,
  death_time TIMESTAMP NULL,
  is_dead BOOLEAN NOT NULL DEFAULT FALSE,
  dna_hash VARCHAR(128) NOT NULL,
  base_stats_json JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pets_owner_idx ON pets(owner_ton);

CREATE TABLE IF NOT EXISTS care_events (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL,
  type VARCHAR(16) NOT NULL,
  at TIMESTAMP NOT NULL DEFAULT NOW(),
  meta JSONB NULL
);
CREATE INDEX IF NOT EXISTS care_pet_idx ON care_events(pet_id);
CREATE INDEX IF NOT EXISTS care_at_idx ON care_events(at);

CREATE TABLE IF NOT EXISTS breeding_sessions (
  id SERIAL PRIMARY KEY,
  parentA_addr VARCHAR(128) NOT NULL,
  parentB_addr VARCHAR(128) NOT NULL,
  start_at TIMESTAMP NOT NULL DEFAULT NOW(),
  end_at TIMESTAMP NULL,
  commit_hash VARCHAR(128) NOT NULL,
  reveal_seed VARCHAR(256) NULL,
  state VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  tg_id VARCHAR(64) PRIMARY KEY,
  ton_addr VARCHAR(128) NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  flags JSONB NULL
);

CREATE TABLE IF NOT EXISTS clans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  emblem_uri VARCHAR(256) NULL,
  created_by VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clan_members (
  clan_id INTEGER NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  role VARCHAR(16) NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT clan_members_pk PRIMARY KEY (clan_id, user_id)
);
`;

async function main() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('POSTGRES_URL is required');
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Migrations applied');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

