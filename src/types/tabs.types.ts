export const GameTab = {
  Car: "car",
  Cases: "cases",
  Mines: "mines",
  Plinko: "plinko",
} as const;

export type GameTab = (typeof GameTab)[keyof typeof GameTab];
