import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { useFightClubStore } from '../../store/fightClubStore.ts';
import { PATH } from '../../utils/pathList.ts';
import type { StakeType } from '../../api/fight-club/types.ts';
import { useFightDuelSocket } from './useFightClubSocket.ts';

export const useFightDuel = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const duel = useFightClubStore((state) => state.duel);
    const setDuel = useFightClubStore((state) => state.setDuel);
    const resetDuel = useFightClubStore((state) => state.resetDuel);

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

    const socketRef = useFightDuelSocket({
        token,
        matchId,
        opponentId,
        stakeType,
        stakeAmount,
        userId: user?.id,
        resetDuel,
        setDuel,
    });

    const hit = useCallback(
        (key: string) => {
            if (duel.status !== 'fighting' || duel.isStunned || !matchId) return;
            socketRef.current?.emit('fight:hit', { matchId, k: key });
        },
        [duel.isStunned, duel.status, matchId, socketRef],
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => hit(event.key.toUpperCase());
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hit]);

    const goLobby = useCallback(() => navigate(PATH.fightClub.lobby), [navigate]);

    return { duel, players, matchId, stakeType, stakeAmount, hit, goLobby };
};
