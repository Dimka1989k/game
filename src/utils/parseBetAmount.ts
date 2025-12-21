export function parseBetAmount(
  value: string,
  options?: {
    min?: number;
    max?: number;
  }
): number | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed === "") return null;

  const amount = Number(trimmed);

  if (!Number.isFinite(amount)) return null;
  if (Number.isNaN(amount)) return null;
  if (amount <= 0) return null;

  if (options?.min !== undefined && amount < options.min) return null;
  if (options?.max !== undefined && amount > options.max) return null;

  return amount;
}
