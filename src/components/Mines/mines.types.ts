export type TileState = "hidden" | "safe" | "mine";

export interface Tile {
  id: number;
  state: TileState;
  revealed: boolean;
}

export type MinesGameState = "idle" | "running" | "finished";
