/**
 * @file pinnacle.ts
 * @description Strict TypeScript interfaces for Pinnacle API responses,
 * enforcing C++ style type safety for sports data feeds.
 */

export enum SportId {
  SOCCER = 29,
  BASKETBALL = 48,
  ESPORTS = 12,
}

export enum MatchStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED",
}

export interface ITeam {
  readonly id: number;
  readonly name: string;
  readonly isHome: boolean;
}

export interface IMoneylineDetails {
  readonly homeOdds: number;
  readonly awayOdds: number;
  readonly drawOdds: number | null;
}

export interface IAsianHandicapDetails {
  readonly points: number;
  readonly homeOdds: number;
  readonly awayOdds: number;
}

export interface IOverUnderDetails {
  readonly points: number;
  readonly overOdds: number;
  readonly underOdds: number;
}

export interface IFixtureOdds {
  readonly id: number;
  readonly sportId: SportId;
  readonly leagueId: number;
  readonly leagueName: string;
  readonly matchStatus: MatchStatus;
  readonly startTime: string; // ISO 8601 string
  readonly homeTeam: ITeam;
  readonly awayTeam: ITeam;
  readonly lineId: number;
  
  readonly moneyline?: IMoneylineDetails;
  readonly asianHandicap?: IAsianHandicapDetails;
  readonly overUnder?: IOverUnderDetails;
  
  readonly timestamp: number;
}

export interface IPinnacleApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly errorMsg?: string;
  readonly currentCursor: string;
}

export type IFeedResponse = IPinnacleApiResponse<IFixtureOdds[]>;
