"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEGLECT_DAYS_TO_DEATH = exports.BREED_COOLDOWN_HOURS = exports.BREED_DURATION_HOURS = exports.BREED_COST = exports.DAILY_FARM_CAP = exports.RARITY_LIFESPAN_DAYS = void 0;
exports.computeAgingMultiplier = computeAgingMultiplier;
exports.requireEnv = requireEnv;
exports.RARITY_LIFESPAN_DAYS = {
    common: 90,
    rare: 120,
    epic: 150,
    legendary: 180,
};
function computeAgingMultiplier(ageDays, lifespanDays) {
    if (ageDays <= 0)
        return 1.0;
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
function requireEnv() {
    const cfg = {
        TON_RPC_URL: process.env.TON_RPC_URL || '',
        TON_MNEMONIC: process.env.TON_MNEMONIC || '',
        COLLECTION_ADDR: process.env.COLLECTION_ADDR || '',
        GRAVE_CID: process.env.GRAVE_CID || '',
        POSTGRES_URL: process.env.POSTGRES_URL || '',
    };
    const missing = Object.entries(cfg)
        .filter(([k, v]) => typeof v === 'string' && v.length === 0)
        .map(([k]) => k);
    if (missing.length) {
        throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
    return cfg;
}
exports.DAILY_FARM_CAP = 200; // points/day per pet
exports.BREED_COST = { food: 50, dnaCatalyst: 30 };
exports.BREED_DURATION_HOURS = 6;
exports.BREED_COOLDOWN_HOURS = 24;
exports.NEGLECT_DAYS_TO_DEATH = 7;
//# sourceMappingURL=index.js.map