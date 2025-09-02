export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export const RARITY_LIFESPAN_DAYS: Record<Rarity, number> = {
  common: 90,
  rare: 120,
  epic: 150,
  legendary: 180,
};

export type Species = 'capybara' | 'fox' | 'raccoon' | 'owl' | 'turtle';

export type CareType = 'feed' | 'bath' | 'sleep' | 'play';

export interface BaseStats {
  friendliness: number; // 0-100
  forage: number; // 0-100
  careBoost: number; // 0-100
  nightOwl: number; // 0-100
  resilience: number; // 0-100
}

export interface AgingMultiplier {
  ageDays: number;
  lifespanDays: number;
  multiplier: number; // smooth 1.0 -> 1.75
}

export function computeAgingMultiplier(ageDays: number, lifespanDays: number): number {
  if (ageDays <= 0) return 1.0;
  const ratio = Math.min(1, Math.max(0, ageDays / lifespanDays));
  // Smooth interpolation: 1.0 at 0%, 1.5 at 80%, 1.75 at 100%
  const m80 = 1.5;
  const m100 = 1.75;
  if (ratio <= 0.8) {
    return 1.0 + (m80 - 1.0) * (ratio / 0.8);
  }
  const tail = (ratio - 0.8) / 0.2; // 0..1
  return m80 + (m100 - m80) * tail;
}

export interface EnvConfig {
  TON_RPC_URL: string;
  TON_MNEMONIC: string;
  COLLECTION_ADDR: string;
  GRAVE_CID: string;
  RENDER_WEBHOOK_SECRET: string;
  POSTGRES_URL: string;
  REDIS_URL?: string;
}

export function requireEnv(): EnvConfig {
  const cfg: EnvConfig = {
    TON_RPC_URL: process.env.TON_RPC_URL || '',
    TON_MNEMONIC: process.env.TON_MNEMONIC || '',
    COLLECTION_ADDR: process.env.COLLECTION_ADDR || '',
    GRAVE_CID: process.env.GRAVE_CID || '',
    RENDER_WEBHOOK_SECRET: process.env.RENDER_WEBHOOK_SECRET || '',
    POSTGRES_URL: process.env.POSTGRES_URL || '',
    REDIS_URL: process.env.REDIS_URL,
  };
  const missing = Object.entries(cfg)
    .filter(([k, v]) => typeof v === 'string' && v.length === 0)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
  return cfg;
}

export const DAILY_FARM_CAP = 200; // points/day per pet
export const BREED_COST = { food: 50, dnaCatalyst: 30 } as const;
export const BREED_DURATION_HOURS = 6;
export const BREED_COOLDOWN_HOURS = 24;
export const NEGLECT_DAYS_TO_DEATH = 7;

