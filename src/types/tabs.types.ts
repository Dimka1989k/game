export const GameTab = {
  Car: "car",
  Cases: "cases",
} as const;

export type GameTab = (typeof GameTab)[keyof typeof GameTab];
