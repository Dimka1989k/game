import lionIcon from "../../assets/cases/lionIcon.png";
import rocketIcon from "../../assets/cases/rocketIcon.png";
import pizzaIcon from "../../assets/cases/pizzaIcon.png";
import ballIcon from "../../assets/cases/ballIcon.png";

export const CASE_PRICES = {
  animal: 50,
  space: 75,
  food: 40,
  sport: 60,
} as const;

export const PAYOUTS = {
  common: 10,
  uncommon: 20,
  rare: 50,
  epic: 100,
  legendary: 200,
  gold: 500,
} as const;

export type CaseType = keyof typeof CASE_PRICES;


export const CASE_ICONS: Record<CaseType, string> = {
  animal: lionIcon,
  space: rocketIcon,
  food: pizzaIcon,
  sport: ballIcon,
};


export const CASE_LABELS: Record<CaseType, string> = {
  animal: "Animal Case",
  space: "Space Case",
  food: "Food Case",
  sport: "Sports Case",
};
