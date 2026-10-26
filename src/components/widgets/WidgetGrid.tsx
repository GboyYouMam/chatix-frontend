import type { ReactNode } from 'react';
import type { ProfileData } from '../../api/users/types.ts';
import type { AchievementCatalogItem } from '../../api/achievements/types.ts';
import { MedalRack } from '../achievements/MedalRack.tsx';
import { isWidgetKey, WIDGET_META, type WidgetKey } from './widgetCatalog.ts';
import styles from './WidgetGrid.module.css';

interface WidgetGridProps {
    profile: ProfileData;
    medalCatalog: AchievementCatalogItem[];
    onViewMedalBook: () => void;
    guestbook: ReactNode;
}

export const WidgetGrid = ({
    profile,
    medalCatalog,
    onViewMedalBook,
    guestbook,
}: WidgetGridProps) => {
    const layout = (profile.widgets?.layout ?? []).filter(isWidgetKey);
    if (layout.length === 0) return null;

    const renderBody = (key: WidgetKey): ReactNode => {
        if (key === 'medal_rack') {
            return (
                <MedalRack
                    unlocked={profile.achievements ?? []}
                    catalog={medalCatalog}
                    onViewBook={onViewMedalBook}
                />
            );
        }
        if (key === 'guestbook') return guestbook;
        return <p className={styles.soon}>soon. chud patience.</p>;
    };

    return (
        <section className={styles.grid} aria-label="profile widgets">
            {layout.map((key) => (
                <article className={styles.panel} key={key} data-widget={key}>
                    <header className={styles.header}>
                        <h3 className={styles.title}>{WIDGET_META[key].title}</h3>
                        <p className={styles.subtitle}>{WIDGET_META[key].subtitle}</p>
                    </header>
                    {renderBody(key)}
                </article>
            ))}
        </section>
    );
};
