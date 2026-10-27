import { useEffect, useState } from 'react';
import type { AchievementCatalogItem, ProfileAchievement } from '../../api/achievements/types.ts';
import {
    RACK_COMPACT_QUERY,
    RACK_MAX_COMPACT,
    RACK_MAX_DESKTOP,
    sortForRack,
    visibleRibbons,
} from './ribbons.ts';
import { MedalIcon } from './MedalIcon.tsx';
import { formatDate } from '../../utils/date.ts';
import styles from './MedalRack.module.css';

function useCompactRack() {
    const [compact, setCompact] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(RACK_COMPACT_QUERY).matches,
    );
    useEffect(() => {
        const query = window.matchMedia(RACK_COMPACT_QUERY);
        const update = () => setCompact(query.matches);
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    return compact;
}

export function MedalRack({
    unlocked,
    catalog,
    onViewBook,
}: {
    unlocked: ProfileAchievement[];
    catalog: AchievementCatalogItem[];
    onViewBook: () => void;
}) {
    const compact = useCompactRack();
    const medals = sortForRack(unlocked, catalog);
    const dates = new Map(unlocked.map((item) => [item.key, item.unlockedAt]));
    const { shown, hidden } = visibleRibbons(medals, compact ? RACK_MAX_COMPACT : RACK_MAX_DESKTOP);
    return (
        <section className={styles.rack} aria-label="medal rack">
            {medals.length ? (
                <div className={styles.rows}>
                    {shown.map((medal) => {
                        const earned = dates.get(medal.key);
                        return (
                            <button
                                type="button"
                                className={styles.ribbon}
                                key={medal.key}
                                title={`${medal.name}: ${medal.description} · ${medal.unlockedPercent}% of players · ${formatDate(earned)}`}
                                aria-label={`${medal.name}, ${medal.description}`}
                                onClick={onViewBook}
                            >
                                <MedalIcon def={medal} width={18} height={30} />
                            </button>
                        );
                    })}
                    {hidden > 0 && (
                        <button
                            type="button"
                            className={styles.more}
                            title={`${hidden} more medals in the medal book`}
                            aria-label={`${hidden} more medals, open medal book`}
                            onClick={onViewBook}
                        >
                            +{hidden}
                        </button>
                    )}
                </div>
            ) : (
                <p className={styles.empty}>no medals. not even a shame one. impressive.</p>
            )}
            <button type="button" className={styles.bookLink} onClick={onViewBook}>
                view medal book
            </button>
        </section>
    );
}
