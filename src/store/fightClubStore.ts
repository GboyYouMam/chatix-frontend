import { create } from 'zustand';
import type { DuelStatus, FightChallenge, StakeFilter } from '../api/fight-club/types.ts';

export interface DuelState {
    p1Hp: number;
    p2Hp: number;
    p1Combo: number;
    p2Combo: number;
    currentKey: string;
    status: DuelStatus;
    isStunned: boolean;
    error: string | null;
    lastHit: string;
}

interface FightClubState {
    challenges: FightChallenge[];
    stakeFilter: StakeFilter;
    maxStake: number;
    minStake: number; // Замінили minWinRate на minStake
    duel: DuelState;
    setStakeFilter: (stakeFilter: StakeFilter) => void;
    setMaxStake: (maxStake: number) => void;
    setMinStake: (minStake: number) => void; // Новий сеттер
    addChallenge: (challenge: FightChallenge) => void;
    setChallenges: (challenges: FightChallenge[]) => void;
    removeChallenge: (matchId: string) => void;
    setDuel: (duel: Partial<DuelState>) => void;
    resetDuel: () => void;
}

const initialDuel: DuelState = {
    p1Hp: 30,
    p2Hp: 30,
    p1Combo: 0,
    p2Combo: 0,
    currentKey: '',
    status: 'waiting',
    isStunned: false,
    error: null,
    lastHit: 'Waiting for Project Mayhem to ring the bell.',
};

// Зачистили мокові дані від старого сміття
export const useFightClubStore = create<FightClubState>((set) => ({
    challenges: [],
    stakeFilter: 'all',
    maxStake: 5000, // Підігнали під UI повзунок
    minStake: 1, // Дефолтний мінімум
    duel: initialDuel,
    setStakeFilter: (stakeFilter) => set({ stakeFilter }),
    setMaxStake: (maxStake) => set({ maxStake: Math.max(1, maxStake) }),
    setMinStake: (minStake) => set({ minStake: Math.max(1, minStake) }),
    addChallenge: (challenge) =>
        set((state) => ({
            challenges: state.challenges.some(({ id }) => id === challenge.id)
                ? state.challenges
                : [challenge, ...state.challenges],
        })),
    setChallenges: (challenges) => set({ challenges }),
    removeChallenge: (matchId) =>
        set((state) => ({ challenges: state.challenges.filter(({ id }) => id !== matchId) })),
    setDuel: (duel) => set((state) => ({ duel: { ...state.duel, ...duel } })),
    resetDuel: () => set({ duel: initialDuel }),
}));
