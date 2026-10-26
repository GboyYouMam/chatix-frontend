import { DuelCommandDeck } from '../../components/fight-club/DuelCommandDeck.tsx';
import { DuelPlayerPanel } from '../../components/fight-club/DuelPlayerPanel.tsx';
import { DuelResultOverlay } from '../../components/fight-club/DuelResultOverlay.tsx';
import { useFightDuel } from '../../hooks/fight-club/useFightDuel.ts';
import duelBackdrop from '../../assets/fight-duel-face.png';
import styles from './Duel.module.css';

export const Duel = () => {
    const { duel, players, stakeType, stakeAmount, goLobby } = useFightDuel();

    return (
        <div className={styles.layout}>
            <img
                className={`${styles.backgroundImage} ${styles.duelBackdrop}`}
                src={duelBackdrop}
                alt=""
                aria-hidden="true"
            />
            <header className={styles.header}>
                <button onClick={goLobby}>back to lobby</button>
                <div>
                    <strong>
                        {stakeAmount} {stakeType}
                    </strong>
                </div>
            </header>

            {duel.error && <div className={styles.error}>{duel.error}</div>}

            <main className={styles.arena}>
                <DuelPlayerPanel {...players.me} />
                <DuelCommandDeck
                    currentKey={duel.currentKey}
                    isStunned={duel.isStunned}
                    lastHit={duel.lastHit}
                />
                <DuelPlayerPanel {...players.enemy} align="right" />
            </main>

            <DuelResultOverlay status={duel.status} onLobby={goLobby} />
        </div>
    );
};
