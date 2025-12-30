import type { BallsOption } from "../../types/plinko.types";

export const RISK_LEVELS = ["Low", "Medium", "High"] as const;

export const BALLS_OPTIONS: BallsOption[] = [
  { balls: 1, price: 2 },
  { balls: 2, price: 4 },
  { balls: 5, price: 10 },
  { balls: 10, price: 20 },
];

export const LINES: number[][] = [
  [8, 9, 10],
  [11, 12, 13],
  [14, 15, 16],
];

export const STORAGE_KEYS = {
  history: "plinko_history",
  settings: "plinko_settings",
} as const;

export const HISTORY_LIMIT = 100;
