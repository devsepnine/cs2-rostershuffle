export interface IPlayer {
  name: string;
  premierScore: number;
  kd: number;
  hltvRating: number;
  winRate: number;
  headshotPercentage: number;
  adr: number;
}

export interface IPlayerCheck extends IPlayer {
  check: boolean;
  customElo: number;
}

export interface IMap {
  name: string;
  weight: number;
}