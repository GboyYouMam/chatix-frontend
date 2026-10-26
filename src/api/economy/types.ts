export interface StimulusResponse {
    granted: boolean;
    amount: number;
    streak: number;
    nextAt: string | null;
    streakReset?: boolean;
}

export type LeaderboardWeek = 'current' | 'previous';

export interface LeaderboardEntry {
    username: string;
    avatar?: string | null;
    pfp_url?: string | null;
    value: number;
}

export interface LeaderboardResponse {
    week: string;
    mostAura: LeaderboardEntry[];
    mostDebt: LeaderboardEntry[];
    mostMogged: LeaderboardEntry[];
}
