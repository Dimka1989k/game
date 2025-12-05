export interface Profile {
  id: string;
  username: string | null;
  balance: number;
  total_wagered: number;
  total_won: number;
  games_played: number;
}

export interface ProfileRow {
  id: string;
  username: string | null;
  balance: number | string | null;
  total_wagered: number | string | null;
  total_won: number | string | null;
  games_played: number | string | null;
}
