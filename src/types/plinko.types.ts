export type RiskLevel = "Low" | "Medium" | "High";

export interface BallsOption {
  balls: number;
  price: number;
}

export interface MultiplierItem {
  value: number;
  className: string;
}

export interface PlinkoSettings {
  risk: RiskLevel;
  balls: number;
  lines: number;
  soundEnabled: boolean;
}

export interface PlinkoBallResult {
  multiplier: number;
  payout: number;
  slotIndex: number;
}

export interface PlinkoDropHistoryItem {
  id: string;
  timestamp: string;
  bet: number; 
  balls: number;
  risk: RiskLevel;
  lines: number;
  results: PlinkoBallResult[];
  netProfit: number;
}


export interface PlinkoFinishPayload {
  netProfit: number; 
  totalBet: number; 
  totalPayout: number;
  results: PlinkoBallResult[];
  risk: RiskLevel;
  lines: number;
  balls: number;
}
