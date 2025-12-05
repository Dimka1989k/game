export interface BonusData {
  user_id: string;
  streak: number;
  next_bonus_at: string | null;
  amount: number;
}

export interface BonusRow {
  user_id: string;
  streak: number | string | null;
  next_bonus_at: string | null;
  amount: number | string | null;
}