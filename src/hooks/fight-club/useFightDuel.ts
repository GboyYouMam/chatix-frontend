import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore.ts';
import { useFightClubStore } from '../../store/fightClubStore.ts';
import { PATH } from '../../utils/pathList.ts';
import type {
    FightGameOverPayload,
    FightUpdatePayload,
    StakeType,
} from '../../api/fight-club/types.ts';

const getMessage = (payload: unknown) =>
    typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: string }).message)
        : 'Fight socket error.';

export const useFightDuel = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const duel = useFightClubStore((state) => state.duel);
    const setDuel = useFightClubStore((state) => state.setDuel);
    const resetDuel = useFightClubStore((state) => state.resetDuel);
    const socketRef = useRef<Socket | null>(null);
    const stunTimerRef = useRef<number | null>(null);

    const matchId = params.get('matchId') ?? '';
    const opponentId = params.get('opponentId') ?? undefined;
    const opponentName = params.get('opponent') ?? 'Waiting for opponent';
    const stakeType: StakeType = params.get('stakeType') === 'debt' ? 'debt' : 'aura';
    const stakeAmount = Math.max(1, Number(params.get('stakeAmount')) || 1);
    const userIsPlayerOne = !opponentId;

    const players = useMemo(() => ({
        me: {
            name: user?.username ?? 'YOU',
            hp: userIsPlayerOne ? duel.p1Hp : duel.p2Hp,
            combo: userIsPlayerOne ? duel.p1Combo : duel.p2Combo,
        },
        enemy: {
            name: opponentName,
            hp: userIsPlayerOne ? duel.p2Hp : duel.p1Hp,
            combo: userIsPlayerOne ? duel.p2Combo : duel.p1Combo,
        },
    }), [duel.p1Combo, duel.p1Hp, duel.p2Combo, duel.p2Hp, opponentName, user?.username, userIsPlayerOne]);

    useEffect(() => {
        resetDuel();
        if (!matchId || !token) {
            setDuel({ error: 'Login and open a real fight link first.' });
            return;
        }

        const socket = io(`${import.meta.env.VITE_API_URL}/fight-club`, { auth: { token } });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('fight:join', {
                matchId,
                opponentId,
                stakeType,
                stakeAmount,
            });
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
                status: payload.winnerId === user?.id ? 'win' : 'lose',
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
    }, [matchId, opponentId, resetDuel, setDuel, stakeAmount, stakeType, token, user?.id]);

    const hit = useCallback(
        (key: string) => {
            if (duel.status !== 'fighting' || duel.isStunned || !matchId) return;
            socketRef.current?.emit('fight:hit', { matchId, k: key });
        },
        [duel.isStunned, duel.status, matchId],
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => hit(event.key.toUpperCase());
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hit]);

    const goLobby = useCallback(() => navigate(PATH.fightClub.lobby), [navigate]);

    return { duel, players, matchId, stakeType, stakeAmount, hit, goLobby };
};
