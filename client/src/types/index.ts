export interface Team {
    id: number;
    name: string;
    league?: number;
    leagueNum?: number;
    logoUrl?: string | null;
    url: string;
    isInCup?: boolean;
    isInCupElim?: boolean;
    isInSuperCup?: boolean;
}