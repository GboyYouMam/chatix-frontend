import { memo } from 'react';
import styles from '../../pages/Fight-Club/Duel.module.css';

interface DuelCommandDeckProps {
    currentKey: string;
    isStunned: boolean;
    lastHit: string;
}
export const DuelCommandDeck = memo(({ currentKey, isStunned, lastHit }: DuelCommandDeckProps) => (
    <section className={styles.commandDeck}>
        <p className={styles.statusLine} key={lastHit}>
            {lastHit}
        </p>
        <div
            key={currentKey || 'waiting'}
            className={isStunned ? styles.targetStunned : styles.target}
            aria-live="polite"
        >
            {isStunned ? 'STUN' : currentKey || 'WAIT'}
        </div>
        <p className={styles.hint}>keyboard only. no clicking, chud.</p>
    </section>
));
