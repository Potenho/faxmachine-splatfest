import { Languages } from "./languages";
import { AnyNewsCommands } from "./news-commands";
import { NewsSections } from "./news-sectios";

export interface SplatfestEtcParams {
	FestivalId: number;
	BattleResultRate: number;
	SeparateMatchingJP: boolean;
	LowPopulationNotJP: boolean;
	HideTeamNamesOnBoard: boolean;
	Version: number;
}

export interface SplatfestTime {
	Time: {
		Announce: string,
		Start: string,
		End: string,
		Result: string,
	}
}

export enum SplatfestRules {
  TurfWars = 'cPnt',
  SplatZones = 'cVar',
  TowerControl = 'cVlf',
  Rainmaker = 'cVgl',
}

export interface SplatfestRotation {
	Rule: SplatfestRules,
	Stages: StageConfig[];
}

export interface StageConfig {
	MapID: number;
}

export interface SplatfestTeams {
	Teams: [TeamConfig, TeamConfig, TeamColor]
}

export interface TeamColor {
	Color: string,
}

export interface TeamConfig extends TeamColor {
	Name: Record<Languages, string>,
	ShortName: Record<Languages, string>,
}

export interface SplatfestNewsScript {
	News: [
		NewsScript<NewsSections.Announce>,
		NewsScript<NewsSections.Start>,
		NewsScript<NewsSections.ResultA>,
		NewsScript<NewsSections.ResultB>
	];
}

export type NewsScript<T> = Record<Languages, AnyNewsCommands[]> & {
	NewsType: T;
};

// WHOLE SPLATFEST MODEL

export interface SplatfestModel extends SplatfestEtcParams, SplatfestTime, SplatfestRotation, SplatfestTeams, SplatfestNewsScript { }