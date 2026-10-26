export type StakeType = 'aura' | 'debt';
export type StakeFilter = 'all' | StakeType;
export type DuelStatus = 'waiting' | 'fighting' | 'win' | 'lose' | 'cancelled';

export interface FightChallenge {
    id: string;
    creatorId: string;
    creator: string;
    title: string;
    stakeType: StakeType;
    stakeAmount: number;
}

export interface FightUpdatePayload {
    matchId: string;
    hp: Record<string, number>;
    combo: Record<string, number>;
    prompt: FightPrompt;
}

export interface FightPrompt {
    promptId: string;
    key: string;
}

export interface FightState {
    matchId: string;
    title: string;
    status: 'lobby' | 'fighting' | 'fight_over';
    role: 'creator' | 'challenger';
    you: { id: string; username: string };
    opponent: { id: string; username: string } | null;
    stakeType: StakeType;
    stakeAmount: number;
}

export interface FightStartPayload {
    matchId: string;
    prompt: FightPrompt;
}

export interface FightGameOverPayload {
    winnerId: string;
    loserId: string;
    stakeType: StakeType;
    stakeAmount: number;
}
