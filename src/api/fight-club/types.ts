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
    p1Hp: number;
    p2Hp: number;
    p1Combo: number;
    p2Combo: number;
    nextKey: string;
    isCrit?: boolean;
    damage?: number;
    attackerId?: string;
}

export interface FightGameOverPayload {
    winnerId: string;
    loserId: string;
    stakeType: StakeType;
    stakeAmount: number;
}
