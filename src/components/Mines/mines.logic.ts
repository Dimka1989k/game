export function generateMines(minesCount: number): Set<number> {
  const mines = new Set<number>();

  while (mines.size < minesCount) {
    mines.add(Math.floor(Math.random() * 25));
  }

  return mines;
}
