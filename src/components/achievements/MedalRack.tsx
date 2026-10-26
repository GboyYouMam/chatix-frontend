import type { AchievementCatalogItem, ProfileAchievement } from '../../api/achievements/types.ts';
import { ribbonStyle, sortForRack } from './ribbons.ts';
import styles from './MedalRack.module.css';

export function MedalRack({
    unlocked,
    catalog,
    onViewBook,
}: {
    unlocked: ProfileAchievement[];
    catalog: AchievementCatalogItem[];
    onViewBook: () => void;
}) {
    const medals = sortForRack(unlocked, catalog);
    const dates = new Map(unlocked.map((item) => [item.key, item.unlockedAt]));
    return (
        <section className={styles.rack} aria-label="medal rack">
            {medals.length ? (
                <div className={styles.rows}>
                    {Array.from({ length: Math.ceil(medals.length / 3) }, (_, row) => (
                        <div className={styles.row} key={row}>
                            {medals.slice(row * 3, row * 3 + 3).map((medal) => {
                                const ribbon = ribbonStyle(medal);
                                const earned = dates.get(medal.key);
                                return (
                                    <button
                                        className={styles.ribbon}
                                        key={medal.key}
                                        style={{
                                            background: ribbon.background,
                                            borderColor: ribbon.border,
                                        }}
                                        title={`${medal.name}: ${medal.description} · ${medal.unlockedPercent}% of players · ${earned ? new Date(earned).toLocaleDateString() : ''}`}
                                        aria-label={`${medal.name}, ${medal.description}`}
                                        onClick={onViewBook}
                                    >
                                        <span aria-hidden="true">{medal.icon || '✦'}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : (
                <p className={styles.empty}>no medals. not even a shame one. impressive.</p>
            )}
            <button className={styles.bookLink} onClick={onViewBook}>
                view medal book
            </button>
        </section>
    );
}
