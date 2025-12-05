import type { Profile, ProfileRow } from "../types/profile.types";
import type { BonusData, BonusRow } from "../types/bonus.types";

export function normalizeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username ?? null,
    balance: Number(row.balance ?? 0),
    total_wagered: Number(row.total_wagered ?? 0),
    total_won: Number(row.total_won ?? 0),
    games_played: Number(row.games_played ?? 0),
  };
}

export function normalizeBonus(row: BonusRow): BonusData {
  return {
    user_id: row.user_id,
    streak: Number(row.streak ?? 0),
    next_bonus_at: row.next_bonus_at ?? null,
    amount: Number(row.amount ?? 10),
  };
}
