import { memo } from 'react';
import clsx from 'clsx';
import type { FightChallenge } from '../../api/fight-club/types.ts';
import styles from '../../pages/Fight-Club/Lobby.module.css';

interface FightChallengeCardProps {
    challenge: FightChallenge;
    onStart: (challenge: FightChallenge) => void;
}

export const FightChallengeCard = memo(({ challenge, onStart }: FightChallengeCardProps) => {
    return (
        <article className={styles.card}>
            <div className={styles.cardTop}>
                <span className={styles.creator}>@{challenge.creator}</span>
                <span
                    className={clsx(
                        styles.badge,
                        challenge.stakeType === 'debt' && styles.debtBadge,
                    )}
                >
                    {challenge.stakeType}
                </span>
            </div>

            <h3>{challenge.title}</h3>

            <div className={styles.cardStats}>
                <span>
                    {challenge.stakeAmount} {challenge.stakeType}
                </span>
            </div>

            <button className={styles.cardCta} onClick={() => onStart(challenge)}>
                beat his ahh
            </button>
        </article>
    );
});
