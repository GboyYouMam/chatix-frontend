import { memo } from 'react';
import styles from '../../pages/Fight-Club/Duel.module.css';

interface DuelResultOverlayProps {
    status: string;
    onLobby: () => void;
}
export const DuelResultOverlay = memo(({ status, onLobby }: DuelResultOverlayProps) => {
    if (status === 'fighting' || status === 'waiting') return null;

    const won = status === 'win';

    return (
        <div className={styles.overlay}>
            <h2 className={won ? styles.winTitle : styles.loseTitle}>
                {won ? 'aura restored' : status === 'cancelled' ? 'basement empty' : 'mogged'}
            </h2>
            <p>
                {won
                    ? "You are Jack's immaculate combo meter."
                    : 'The soap market remains undefeated.'}
            </p>
            <button onClick={onLobby}>return to lobby</button>
        </div>
    );
});
