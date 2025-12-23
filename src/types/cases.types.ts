import { CASE_PRICES } from "../components/Cases/cases.config";
import { PAYOUTS } from "../components/Cases/cases.config";

export type CaseType = keyof typeof CASE_PRICES;
export type Rarity = keyof typeof PAYOUTS;

export type CaseItem = {
  icon: string;
  label: string;
};
