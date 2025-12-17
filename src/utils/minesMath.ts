export const GRID_SIZE = 25;
export const HOUSE_EDGE = 0.97;

export function calculateMultiplier(
  minesCount: number,
  revealedCount: number
): number {
  const safeTiles = GRID_SIZE - minesCount;
  let multiplier = 1;

  for (let i = 0; i < revealedCount; i++) {
    multiplier *= (GRID_SIZE - i) / (safeTiles - i);
  }

  return Number((multiplier * HOUSE_EDGE).toFixed(2));
}

export function calculateCashOut(
  betAmount: number,
  multiplier: number
): number {
  return Number((betAmount * multiplier).toFixed(2));
}
