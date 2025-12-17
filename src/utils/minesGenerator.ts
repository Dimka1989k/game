import { GRID_SIZE } from "./minesMath";

export function generateMineIndexes(minesCount: number): Set<number> {
  const mines = new Set<number>();

  while (mines.size < minesCount) {
    mines.add(Math.floor(Math.random() * GRID_SIZE));
  }

  return mines;
}
