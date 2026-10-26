import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { useFightClubStore } from '../../store/fightClubStore.ts';
import { PATH } from '../../utils/pathList.ts';
import { useFightDuelSocket } from './useFightClubSocket.ts';
import { toHitKey } from './qteKey.ts';

export const useFightDuel = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const duel = useFightClubStore((state) => state.duel);
    const setDuel = useFightClubStore((state) => state.setDuel);
    const resetDuel = useFightClubStore((state) => state.resetDuel);

    const matchId = params.get('matchId') ?? '';
    const matchState = duel.matchState;

    const players = useMemo(
        () => ({
            me: {
                name: matchState?.you.username ?? user?.username ?? 'YOU',
                hp: duel.p1Hp,
                combo: duel.p1Combo,
            },
            enemy: {
                name: matchState?.opponent?.username ?? 'Waiting for opponent',
                hp: duel.p2Hp,
                combo: duel.p2Combo,
            },
        }),
        [duel.p1Combo, duel.p1Hp, duel.p2Combo, duel.p2Hp, matchState, user?.username],
    );

    const socketRef = useFightDuelSocket({
        token,
        matchId,
        userId: user?.id,
        resetDuel,
        setDuel,
    });

    const hit = useCallback(
        (key: string) => {
            if (duel.status !== 'fighting' || !matchId || !duel.promptId) return;
            socketRef.current?.emit('fight:hit', { matchId, promptId: duel.promptId, k: key });
        },
        [duel.promptId, duel.status, matchId, socketRef],
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = toHitKey(event);
            if (key) hit(key);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hit]);

    const goLobby = useCallback(() => navigate(PATH.fightClub.lobby), [navigate]);

    return {
        duel,
        players,
        matchId,
        stakeType: matchState?.stakeType ?? 'aura',
        stakeAmount: matchState?.stakeAmount ?? 0,
        hit,
        goLobby,
    };
};
