import { useCallback, useState } from 'react';
import { CreateFightModal } from '../../components/fight-club/CreateFightModal.tsx';
import { FightChallengeCard } from '../../components/fight-club/FightChallengeCard.tsx';
import { FightLobbyFilters } from '../../components/fight-club/FightLobbyFilters.tsx';
import { FightLobbyHeader } from '../../components/fight-club/FightLobbyHeader.tsx';
import { useFightLobby } from '../../hooks/fight-club/useFightLobby.ts';
import lobbyBackdrop from '../../assets/fight-lobby-silhouette.png';
import styles from './Lobby.module.css';

export const Lobby = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
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
    } = useFightLobby();

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    return (
        <div className={styles.layout}>
            <img className={`${styles.backgroundImage} ${styles.lobbyBackdrop}`} src={lobbyBackdrop} alt="" aria-hidden="true" />
            <FightLobbyHeader user={user} onCreate={openModal} onRooms={goRooms} />

            <main className={styles.hero}>
                <div>
                    <p>underground queue for debt, aura, and questionable self-improvement arcs</p>
                    <h2>Pick a basement, press the key, protect the ratio.</h2>
                </div>
                <span>first rule: ship the feature</span>
            </main>

            <div className={styles.content}>
                <FightLobbyFilters
                    stakeFilter={stakeFilter}
                    minStake={minStake}
                    maxStake={maxStake}
                    onStakeFilter={setStakeFilter}
                    onMinStake={setMinStake}
                    onMaxStake={setMaxStake}
                />

                <main className={styles.grid}>
                    {filteredChallenges.map((challenge) => (
                        <FightChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onStart={startDuel}
                        />
                    ))}
                    {filteredChallenges.length === 0 && (
                        <div className={styles.empty}>
                            No duels survived the filter. Lower the standards, king.
                        </div>
                    )}
                </main>
            </div>

            <CreateFightModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onCreate={createChallenge}
            />
        </div>
    );
};
