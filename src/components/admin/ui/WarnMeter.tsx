import { getWarnBadge } from '../adminBadges.ts';
import styles from './WarnMeter.module.css';

export function WarnMeter({ count, threshold = 3 }: { count: number; threshold?: number }) {
    const { level } = getWarnBadge(count, threshold);
    const filled = Math.min(Math.max(count, 0), threshold);

    return (
        <span className={`${styles.meter} ${styles[level]}`} aria-hidden="true">
            {Array.from({ length: threshold }, (_, index) => (
                <span
                    className={index < filled ? `${styles.segment} ${styles.on}` : styles.segment}
                    key={index}
                />
            ))}
        </span>
    );
}
