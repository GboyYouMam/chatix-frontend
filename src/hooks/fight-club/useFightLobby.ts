import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore.ts';
import { useFightClubStore } from '../../store/fightClubStore.ts';
import { PATH } from '../../utils/pathList.ts';
import type { FightChallenge, StakeType } from '../../api/fight-club/types.ts';

export const useFightLobby = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const challenges = useFightClubStore((state) => state.challenges);
    const stakeFilter = useFightClubStore((state) => state.stakeFilter);
    const minStake = useFightClubStore((state) => state.minStake);
    const maxStake = useFightClubStore((state) => state.maxStake);
    const setStakeFilter = useFightClubStore((state) => state.setStakeFilter);
    const setMinStake = useFightClubStore((state) => state.setMinStake);
    const setMaxStake = useFightClubStore((state) => state.setMaxStake);
    const addChallenge = useFightClubStore((state) => state.addChallenge);
    const setChallenges = useFightClubStore((state) => state.setChallenges);
    const removeChallenge = useFightClubStore((state) => state.removeChallenge);
    const socketRef = useRef<Socket | null>(null);
    const pendingCreateRef = useRef(false);

    const startDuel = useCallback(
        (challenge: FightChallenge, isCreator: boolean = false) => {
            const creator = isCreator || challenge.creatorId === user?.id;
            const params = new URLSearchParams({
                matchId: challenge.id,
                opponentId: challenge.creatorId,
                opponent: challenge.creator,
                stakeType: challenge.stakeType,
                stakeAmount: String(challenge.stakeAmount),
                role: creator ? 'creator' : 'challenger',
            });
            if (creator) {
                params.delete('opponentId');
                params.delete('opponent');
            }

            navigate(PATH.fightClub.href.duel(params));
        },
        [navigate, user?.id],
    );
    const goRooms = useCallback(() => navigate(PATH.rooms.rooms), [navigate]);

    useEffect(() => {
        if (!token) {
            setChallenges([]);
            return;
        }

        const socket = io(`${import.meta.env.VITE_API_URL}/fight-club`, {
            auth: { token },
        });
        socketRef.current = socket;
        socket.on('fight:challenges', setChallenges);
        socket.on('fight:challenge_created', (challenge: FightChallenge) => {
            addChallenge(challenge);
            if (pendingCreateRef.current && challenge.creatorId === user?.id) {
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
    }, [addChallenge, removeChallenge, setChallenges, startDuel, token, user?.id]);

    const filteredChallenges = useMemo(
        () =>
            challenges.filter((challenge) => {
                const stakeMatches = stakeFilter === 'all' || challenge.stakeType === stakeFilter;
                return (
                    stakeMatches &&
                    challenge.stakeAmount >= minStake &&
                    challenge.stakeAmount <= maxStake
                );
            }),
        [challenges, maxStake, minStake, stakeFilter],
    );

    const createChallenge = useCallback(
        (draft: { stakeType: StakeType; stakeAmount: number; title: string }) => {
            pendingCreateRef.current = true;
            socketRef.current?.emit('fight:create', draft);
        },
        [],
    );

    return {
        user,
        filteredChallenges,
        stakeFilter,
        minStake,
        maxStake,
        setStakeFilter,
        setMinStake,
        setMaxStake,
        goRooms,
        startDuel,
        createChallenge,
    };
};
