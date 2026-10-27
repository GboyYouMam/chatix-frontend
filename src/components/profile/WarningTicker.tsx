import { formatWarningTicker } from './warningTicker.ts';
import styles from './WarningTicker.module.css';

export const WarningTicker = ({ warnings }: { warnings: { reason: string }[] }) => {
    const messages = formatWarningTicker(warnings);
    if (!messages.length) return null;

    const text = messages.join(' /!\\ ');
    const duration = Math.max(12, text.length * 0.18);

    return (
        <div className={styles.ticker} aria-label={text}>
            <div className={styles.track} style={{ animationDuration: `${duration}s` }}>
                <span>{text} /!\</span>
                <span aria-hidden="true">{text} /!\</span>
            </div>
        </div>
    );
};
