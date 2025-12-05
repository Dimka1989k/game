export const GameState = {
  Idle: "idle",
  Running: "running",
  Cashable: "cashable",
  Finished: "finished",
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];