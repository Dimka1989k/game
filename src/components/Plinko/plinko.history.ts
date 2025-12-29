import type { PlinkoDropHistoryItem } from "../../types/plinko.types";
import { HISTORY_LIMIT, STORAGE_KEYS } from "./plinko.constants";

export function generateHistoryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `drop_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function loadPlinkoHistory(): PlinkoDropHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(-HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function savePlinkoHistory(history: PlinkoDropHistoryItem[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.history,
      JSON.stringify(history.slice(-HISTORY_LIMIT))
    );
  } catch {
    void 0;
  }
}
