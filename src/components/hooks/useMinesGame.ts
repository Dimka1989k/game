import { useState } from "react";
import type { TileState, GameOutcome, GameStatus } from "../../types/mines.types.ts";
import { calculateMultiplier } from "../../utils/minesMath";
import { generateMineIndexes } from "../../utils/minesGenerator";

const INITIAL_TILES = Array(25).fill("hidden") as TileState[];

export function useMinesGame(minesCount: number) {
  const [tiles, setTiles] = useState<TileState[]>(INITIAL_TILES);
  const [mineIndexes, setMineIndexes] = useState<Set<number>>(new Set());

  const [status, setStatus] = useState<GameStatus>("idle");
  const [outcome, setOutcome] = useState<GameOutcome>(null);

  const [revealedCount, setRevealedCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  function start() {
    setMineIndexes(generateMineIndexes(minesCount));
    setTiles(INITIAL_TILES);
    setRevealedCount(0);
    setMultiplier(1);
    setOutcome(null);
    setStatus("running");
  }

  function revealTile(index: number): GameOutcome | null {
    if (status !== "running") return null;
    if (tiles[index] !== "hidden") return null;

    if (mineIndexes.has(index)) {
      setTiles((prev) =>
        prev.map((_, i) => (mineIndexes.has(i) ? "mine" : prev[i]))
      );
      setOutcome("lose");
      setStatus("finished");
      return "lose";
    }

    setTiles((prev) => {
      const next = [...prev];
      next[index] = "safe";
      return next;
    });

    setRevealedCount((prev) => {
      const next = prev + 1;
      setMultiplier(calculateMultiplier(minesCount, next));
      return next;
    });

    return null;
  }

  function cashOut() {
    if (status !== "running") return;

    setTiles((prev) =>
      prev.map((_, i) => (mineIndexes.has(i) ? "mine" : "safe"))
    );

    setOutcome("win");
    setStatus("finished");
  }

  function reset() {
    setStatus("idle");
    setOutcome(null);
    setTiles(INITIAL_TILES);
    setRevealedCount(0);
    setMultiplier(1);
  }

  return {
    tiles,
    status,
    outcome,
    revealedCount,
    multiplier,
    start,
    revealTile,
    cashOut,
    reset,
  };
}
