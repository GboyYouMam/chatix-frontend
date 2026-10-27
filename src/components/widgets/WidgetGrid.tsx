import type { ReactNode } from 'react';
import type { ProfileData } from '../../api/users/types.ts';
import type { AchievementCatalogItem } from '../../api/achievements/types.ts';
import { MedalRack } from '../achievements/MedalRack.tsx';
import { isWidgetKey, WIDGET_META, type WidgetKey } from './widgetCatalog.ts';
import { isPlayableNowPlaying } from './widgetMath.ts';
import {
    AuraChartWidget,
    DebtMeterWidget,
    FightRecordWidget,
    HitCounterWidget,
    NowPlayingWidget,
    RapSheetWidget,
    StatusLineWidget,
    TopGlazersWidget,
    WantedPosterWidget,
    YapStatsWidget,
} from './WidgetBodies.tsx';
import bodyStyles from './WidgetBodies.module.css';
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
    const widgets = profile.widgets;
    if (!widgets) return null;
    const data = widgets.data;
    // No track means no player panel at all, not an empty frame.
    const layout = widgets.layout
        .filter(isWidgetKey)
        .filter((key) => key !== 'now_playing' || isPlayableNowPlaying(data.nowPlaying));
    if (layout.length === 0) return null;

    const renderBody = (key: WidgetKey): ReactNode => {
        switch (key) {
            case 'now_playing':
                return <NowPlayingWidget nowPlaying={data.nowPlaying} />;
            case 'medal_rack':
                return (
                    <MedalRack
                        unlocked={profile.achievements ?? []}
                        catalog={medalCatalog}
                        onViewBook={onViewMedalBook}
                    />
                );
            case 'aura_chart':
                return <AuraChartWidget points={data.auraChart} />;
            case 'fight_record':
                return <FightRecordWidget record={data.fightRecord} />;
            case 'top_glazers':
                return <TopGlazersWidget glazers={data.topGlazers} />;
            case 'debt_meter':
                return <DebtMeterWidget debt={data.debt} />;
            case 'yap_stats':
                return <YapStatsWidget stats={data.yapStats} />;
            case 'guestbook':
                return <div className={bodyStyles.guestbook}>{guestbook}</div>;
            case 'status_line':
                return <StatusLineWidget status={data.status} />;
            case 'rap_sheet':
                return <RapSheetWidget sheet={data.rapSheet} username={profile.username} />;
            case 'hit_counter':
                return <HitCounterWidget count={data.hitCount} />;
            case 'wanted_poster':
                return (
                    <WantedPosterWidget
                        username={profile.username}
                        pfpUrl={profile.pfp_url}
                        debt={data.debt}
                    />
                );
        }
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
