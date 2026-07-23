import { memo } from 'react';
import styles from '../../pages/Fight-Club/Duel.module.css';

interface DuelPlayerPanelProps {
    name: string;
    hp: number;
    combo: number;
    align?: 'left' | 'right';
}
export const DuelPlayerPanel = memo(({ name, hp, combo, align = 'left' }: DuelPlayerPanelProps) => {
    const hpPercent = Math.max(0, Math.min(100, (hp / 30) * 100));

    return (
        <section className={align === 'right' ? styles.playerRight : styles.player}>
            <div className={styles.playerHeader}>
                <h2>{name}</h2>
                <span>{hp}/30 HP</span>
            </div>
            <div className={styles.hpTrack}>
                <div key={hp} className={styles.hpFill} style={{ width: `${hpPercent}%` }} />
            </div>
            <div className={styles.comboRow}>
                {[1, 2, 3].map((slot) => (
                    <span key={slot} className={combo >= slot ? styles.comboOn : styles.combo} />
                ))}
            </div>
        </section>
    );
});
