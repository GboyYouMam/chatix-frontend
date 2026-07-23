import { useCallback, useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import type {
    FightGameOverPayload,
    FightChallenge,
    FightUpdatePayload,
    StakeType,
} from '../../api/fight-club/types.ts';
import type { DuelState } from '../../store/fightClubStore.ts';

const fightClubUrl = `${import.meta.env.VITE_API_URL}/fight-club`;

type LobbySocketOptions = {
    token: string | null;
    userId?: string;
    addChallenge: (challenge: FightChallenge) => void;
    setChallenges: (challenges: FightChallenge[]) => void;
    removeChallenge: (matchId: string) => void;
    startDuel: (challenge: FightChallenge, isCreator?: boolean) => void;
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

        const socket = io(fightClubUrl, { auth: { token } });
        socketRef.current = socket;
        socket.on('fight:challenges', setChallenges);
        socket.on('fight:challenge_created', (challenge: FightChallenge) => {
            addChallenge(challenge);
            if (pendingCreateRef.current && challenge.creatorId === userId) {
                pendingCreateRef.current = false;
                startDuel(challenge, true);
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
    opponentId?: string;
    stakeType: StakeType;
    stakeAmount: number;
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
    opponentId,
    stakeType,
    stakeAmount,
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

        const socket = io(fightClubUrl, { auth: { token } });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('fight:join', { matchId, opponentId, stakeType, stakeAmount });
        });
        socket.on('fight:start', ({ firstKey }: { firstKey: string }) => {
            setDuel({
                currentKey: firstKey,
                status: 'fighting',
                error: null,
                lastHit: 'The bell rang. Press the key before your aura files a complaint.',
            });
        });
        socket.on('fight:update', (payload: FightUpdatePayload) => {
            setDuel({
                p1Hp: payload.p1Hp,
                p2Hp: payload.p2Hp,
                p1Combo: payload.p1Combo,
                p2Combo: payload.p2Combo,
                currentKey: payload.nextKey,
                lastHit: payload.isCrit
                    ? `Critical ${payload.damage ?? 5}. Looksmaxxing department approved.`
                    : `Hit landed for ${payload.damage ?? 1}.`,
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
    }, [matchId, opponentId, resetDuel, setDuel, stakeAmount, stakeType, token, userId]);

    return socketRef;
};
