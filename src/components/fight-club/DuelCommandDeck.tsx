import { memo } from 'react';
import styles from '../../pages/Fight-Club/Duel.module.css';

interface DuelCommandDeckProps {
    currentKey: string;
    isStunned: boolean;
    status: string;
    lastHit: string;
    onHit: (key: string) => void;
}
export const DuelCommandDeck = memo(
    ({ currentKey, isStunned, status, lastHit, onHit }: DuelCommandDeckProps) => (
        <section className={styles.commandDeck}>
            <p className={styles.statusLine} key={lastHit}>{lastHit}</p>
            <button
                key={currentKey || 'waiting'}
                className={isStunned ? styles.targetStunned : styles.target}
                onClick={() => currentKey && onHit(currentKey)}
                disabled={!currentKey || status !== 'fighting' || isStunned}
            >
                {isStunned ? 'STUN' : currentKey || 'WAIT'}
            </button>
            <p className={styles.hint}>
                Keyboard works too. Miss the key and the narrator judges you.
            </p>
        </section>
    ),
);
