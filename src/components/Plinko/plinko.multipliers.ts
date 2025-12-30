import type { RiskLevel, MultiplierItem } from "../../types/plinko.types";

const MULTIPLIERS_16: Record<RiskLevel, number[]> = {
  Medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  Low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  High: [
    1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000,
  ],
};

const UI_CLASSES: MultiplierItem["className"][] = [
  "container-red",
  "container-orange",
  "container-orange",
  "container-orange",
  "container-brown",
  "container-yellow",
  "container-yellow",
  "container-light-green",
  "container-green",
  "container-light-green",
  "container-yellow",
  "container-yellow",
  "container-brown",
  "container-orange",
  "container-orange",
  "container-orange",
  "container-red",
];

function sliceCentered<T>(arr: T[], size: number): T[] {
  if (size >= arr.length) return arr;
  const start = Math.floor((arr.length - size) / 2);
  return arr.slice(start, start + size);
}

export function getUIMultipliers(
  risk: RiskLevel,
  lines: number
): MultiplierItem[] {
  const slots = lines + 1;

  const values = sliceCentered(MULTIPLIERS_16[risk], slots);
  const classes = sliceCentered(UI_CLASSES, slots);

  return values.map((value, i) => ({
    value,
    className: classes[i],
  }));
}
