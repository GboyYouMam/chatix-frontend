import { useCallback, useEffect, useRef } from 'react';
import { type Socket } from 'socket.io-client';
import { createSocket } from '../../lib/socket.ts';
import type {
    FightGameOverPayload,
    FightChallenge,
    FightStartPayload,
    FightState,
    FightUpdatePayload,
    StakeType,
} from '../../api/fight-club/types.ts';
import type { DuelState } from '../../store/fightClubStore.ts';

type LobbySocketOptions = {
    token: string | null;
    userId?: string;
    addChallenge: (challenge: FightChallenge) => void;
    setChallenges: (challenges: FightChallenge[]) => void;
    removeChallenge: (matchId: string) => void;
    startDuel: (challenge: FightChallenge) => void;
};

export const useFightLobbySocket = ({
    token,
    userId,
    addChallenge,
    setChallenges,
    removeChallenge,
    startDuel,
}: LobbySocketOptions) => {
    const socketRef = useRef<Socket | null>(null);
    const pendingCreateRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setChallenges([]);
            return;
        }

        const socket = createSocket('/fight-club');
        socketRef.current = socket;
        socket.on('fight:challenges', setChallenges);
        socket.on('fight:challenge_created', (challenge: FightChallenge) => {
            addChallenge(challenge);
            if (pendingCreateRef.current && challenge.creatorId === userId) {
                pendingCreateRef.current = false;
                startDuel(challenge);
            }
        });
        socket.on('fight:challenge_removed', ({ matchId }: { matchId: string }) =>
            removeChallenge(matchId),
        );

        return () => {
            socket.disconnect();
            if (socketRef.current === socket) socketRef.current = null;
        };
    }, [addChallenge, removeChallenge, setChallenges, startDuel, token, userId]);

    const createChallenge = useCallback(
        (draft: { stakeType: StakeType; stakeAmount: number; title: string }) => {
            pendingCreateRef.current = true;
            socketRef.current?.emit('fight:create', draft);
        },
        [],
    );

    return { createChallenge };
};

type DuelSocketOptions = {
    token: string | null;
    matchId: string;
    userId?: string;
    resetDuel: () => void;
    setDuel: (duel: Partial<DuelState>) => void;
};

const getMessage = (payload: unknown) =>
    typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: string }).message)
        : 'Fight socket error.';

export const useFightDuelSocket = ({
    token,
    matchId,
    userId,
    resetDuel,
    setDuel,
}: DuelSocketOptions) => {
    const socketRef = useRef<Socket | null>(null);
    const stunTimerRef = useRef<number | null>(null);

    useEffect(() => {
        resetDuel();
        if (!matchId || !token) {
            setDuel({ error: 'Login and open a real fight link first.' });
            return;
        }

        const socket = createSocket('/fight-club');
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('fight:join', { matchId });
        });
        socket.on('fight:state', (matchState: FightState) =>
            setDuel({
                matchState,
                status: matchState.status === 'fighting' ? 'fighting' : 'waiting',
            }),
        );
        socket.on('fight:start', ({ prompt }: FightStartPayload) => {
            setDuel({
                currentKey: prompt.key,
                promptId: prompt.promptId,
                status: 'fighting',
                error: null,
                lastHit: 'The bell rang. Press the key before your aura files a complaint.',
            });
        });
        socket.on('fight:update', (payload: FightUpdatePayload) => {
            const opponentId = Object.keys(payload.hp).find((id) => id !== userId);
            setDuel({
                p1Hp: userId ? (payload.hp[userId] ?? 0) : 0,
                p2Hp: opponentId ? (payload.hp[opponentId] ?? 0) : 0,
                p1Combo: userId ? (payload.combo[userId] ?? 0) : 0,
                p2Combo: opponentId ? (payload.combo[opponentId] ?? 0) : 0,
                currentKey: payload.prompt.key,
                promptId: payload.prompt.promptId,
                lastHit: 'Hit landed. Looksmaxxing department approved.',
            });
        });
        socket.on('fight:stun', ({ stunDuration }: { stunDuration: number }) => {
            setDuel({ isStunned: true, lastHit: 'Wrong key. Stunned by the narrator.' });
            if (stunTimerRef.current) window.clearTimeout(stunTimerRef.current);
            stunTimerRef.current = window.setTimeout(
                () => setDuel({ isStunned: false }),
                stunDuration,
            );
        });
        socket.on('fight:game_over', (payload: FightGameOverPayload) => {
            setDuel({
                status: payload.winnerId === userId ? 'win' : 'lose',
                currentKey: '',
                lastHit: `${payload.stakeAmount} ${payload.stakeType} settled.`,
            });
        });
        socket.on('fight:cancelled', () =>
            setDuel({ status: 'cancelled', error: 'Opponent left the basement.' }),
        );
        socket.on('fight:rage_quit', ({ message }: { message?: string }) =>
            setDuel({ lastHit: message ?? 'Opponent rage quit.' }),
        );
        socket.on('fight:error', (payload) => setDuel({ error: getMessage(payload) }));
        socket.on('connect_error', (error) => setDuel({ error: error.message }));

        return () => {
            if (stunTimerRef.current) window.clearTimeout(stunTimerRef.current);
            socket.disconnect();
            if (socketRef.current === socket) socketRef.current = null;
        };
    }, [matchId, resetDuel, setDuel, token, userId]);

    return socketRef;
};
