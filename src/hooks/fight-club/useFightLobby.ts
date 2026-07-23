import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { useFightClubStore } from '../../store/fightClubStore.ts';
import { PATH } from '../../utils/pathList.ts';
import type { FightChallenge } from '../../api/fight-club/types.ts';
import { useFightLobbySocket } from './useFightClubSocket.ts';

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

    const { createChallenge } = useFightLobbySocket({
        token,
        userId: user?.id,
        addChallenge,
        setChallenges,
        removeChallenge,
        startDuel,
    });

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
