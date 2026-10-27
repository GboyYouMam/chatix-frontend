import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type { ProfileWidgetData, RapSheetEntry } from '../../api/users/types.ts';
import { formatAmount } from '../shop/shopFormat.ts';
import { PATH } from '../../utils/pathList.ts';
import {
    auraTrend,
    debtPercent,
    embedHeight,
    padVisitor,
    relativeAgo,
    type TrendDirection,
} from './widgetMath.ts';
import styles from './WidgetBodies.module.css';

type WidgetData = ProfileWidgetData;

export const NowPlayingWidget = ({ nowPlaying }: { nowPlaying: WidgetData['nowPlaying'] }) => {
    if (!nowPlaying) return null;
    return (
        <div className={styles.player}>
            <iframe
                className={styles.embed}
                src={nowPlaying.embedUrl}
                title="currently rotting to"
                loading="lazy"
                allow="encrypted-media"
                width="100%"
                height={embedHeight(nowPlaying.provider)}
            />
            <p className={styles.caption}>via {nowPlaying.provider}</p>
        </div>
    );
};

const SPARK_WIDTH = 100;
const SPARK_HEIGHT = 40;

const sparkPoints = (values: number[]): string => {
    const min = Math.min(...values);
    const range = Math.max(...values) - min || 1;
    return values
        .map(
            (value, index) =>
                `${(index / (values.length - 1)) * SPARK_WIDTH},${SPARK_HEIGHT - ((value - min) / range) * SPARK_HEIGHT}`,
        )
        .join(' ');
};

const ARROW: Record<TrendDirection, string> = { up: '▲', down: '▼', flat: '–' };
const MOOD: Record<TrendDirection, string> = {
    up: 'bullish',
    down: 'bearish',
    flat: 'sideways (cope)',
};

export const AuraChartWidget = ({ points }: { points: WidgetData['auraChart'] }) => {
    if (points.length < 2) {
        return <p className={styles.muted}>no ticks yet. the market is asleep.</p>;
    }
    const trend = auraTrend(points);
    const values = points.map((point) => Number(point.aura));
    return (
        <div className={styles.ticker}>
            <p
                className={clsx(
                    styles.tickerLine,
                    trend.direction === 'down' ? styles.bear : styles.bull,
                )}
            >
                {`$AURA ${ARROW[trend.direction]} ${Math.abs(trend.pct)}% today. ${MOOD[trend.direction]}`}
            </p>
            <svg
                className={styles.spark}
                viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`aura over the last ${points.length} days`}
            >
                <polyline
                    points={sparkPoints(values)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <p className={styles.muted}>last {points.length} days. not financial advice.</p>
        </div>
    );
};

export const FightRecordWidget = ({ record }: { record: WidgetData['fightRecord'] }) => {
    const last = record.last;
    const streakLine =
        record.streak > 0
            ? `${record.streak} win streak. respect.`
            : record.streak < 0
              ? `${-record.streak} loss streak. ouch.`
              : 'no streak. boring.';
    const lastLine = !last
        ? 'never fought. literal NPC.'
        : last.won
          ? `last seen mogging @${last.opponent}`
          : `last seen getting mogged by @${last.opponent}`;
    return (
        <div className={styles.fight}>
            <p className={styles.bigMono}>
                <span>{record.wins}W</span>{' '}
                <span className={styles.lossNumber}>{record.losses}L</span>
            </p>
            <p className={styles.body}>{streakLine}</p>
            <p className={styles.muted}>
                {lastLine}
                {last ? ` · ${relativeAgo(last.at)}` : ''}
            </p>
        </div>
    );
};

export const TopGlazersWidget = ({ glazers }: { glazers: WidgetData['topGlazers'] }) => {
    if (glazers.length === 0) {
        return <p className={styles.muted}>nobody glazes u. ouch.</p>;
    }
    return (
        <ol className={styles.glazers}>
            {glazers.slice(0, 5).map((glazer, index) => (
                <li key={glazer.username}>
                    <Link
                        className={styles.glazer}
                        to={PATH.authAndUser.href.profile(glazer.username)}
                    >
                        {glazer.pfp_url ? (
                            <img className={styles.avatar} src={glazer.pfp_url} alt="" />
                        ) : (
                            <span className={styles.avatarEmpty} aria-hidden="true">
                                ?
                            </span>
                        )}
                        <span>
                            {index + 1}. {glazer.username}
                        </span>
                    </Link>
                </li>
            ))}
        </ol>
    );
};

export const DebtMeterWidget = ({ debt }: { debt: number }) => {
    const value = Number(debt);
    if (value < 0) {
        return <p className={styles.cushion}>financial cushion: secured</p>;
    }
    const percent = debtPercent(value);
    return (
        <div className={styles.debt}>
            <p className={styles.bigMono}>{`financially cooked: ${percent}%`}</p>
            <div
                className={styles.bar}
                role="meter"
                aria-label="financially cooked"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
            >
                <span className={styles.barFill} style={{ width: `${percent}%` }} />
            </div>
            <p className={styles.muted}>{formatAmount(value)} debt</p>
        </div>
    );
};

export const YapStatsWidget = ({ stats }: { stats: WidgetData['yapStats'] }) => (
    <div className={styles.yap}>
        <p className={styles.bigMono}>{formatAmount(Number(stats.messages))} messages sent</p>
        <p className={styles.label}>top rooms</p>
        {stats.topRooms.length > 0 ? (
            <ul className={styles.rooms}>
                {stats.topRooms.map((room) => (
                    <li key={room.title}>
                        <span>{room.title}</span>
                        <span className={styles.mono}>{formatAmount(Number(room.count))}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className={styles.muted}>no rooms. ghost mode.</p>
        )}
        <p className={styles.label}>most cooked take</p>
        {stats.mostCookedTake ? (
            <blockquote className={styles.take}>
                &ldquo;{stats.mostCookedTake.excerpt}&rdquo;
                <span className={styles.muted}>
                    {' '}
                    · {stats.mostCookedTake.replies} replies got cooked
                </span>
            </blockquote>
        ) : (
            <p className={styles.muted}>no cooked takes yet. pure peace.</p>
        )}
    </div>
);

export const StatusLineWidget = ({ status }: { status: WidgetData['status'] }) =>
    status ? (
        <div className={styles.status}>
            <p className={styles.statusText}>{status.text}</p>
            <p className={styles.muted}>{relativeAgo(status.setAt)}</p>
        </div>
    ) : (
        <p className={styles.muted}>no status. u are a mystery.</p>
    );

const convictionRows = (
    entries: RapSheetEntry[],
    kind: 'WARN' | 'BAN',
): Array<RapSheetEntry & { kind: 'WARN' | 'BAN' }> => entries.map((entry) => ({ ...entry, kind }));

export const RapSheetWidget = ({
    sheet,
    username,
}: {
    sheet: WidgetData['rapSheet'];
    username: string;
}) => {
    const rows = [...convictionRows(sheet.warns, 'WARN'), ...convictionRows(sheet.bans, 'BAN')];
    return (
        <div className={styles.mugshot}>
            <p className={styles.mugHeader}>convictions · {username}</p>
            {rows.length === 0 ? (
                <p className={styles.stamp}>clean record. suspicious.</p>
            ) : (
                <ol className={styles.convictions}>
                    {rows.map((row, index) => (
                        <li key={`${row.kind}-${index}`}>
                            <span className={styles.kind}>{row.kind}</span>{' '}
                            {row.reason || 'no reason given. the judge was bored.'}
                            {row.at && (
                                <time className={styles.muted}> · {relativeAgo(row.at)}</time>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export const HitCounterWidget = ({ count }: { count: number }) => {
    const padded = padVisitor(Number(count));
    return (
        <div className={styles.hitBox}>
            <div className={styles.odometer} aria-label={`visitor number ${padded}`}>
                {padded.split('').map((digit, index) => (
                    <span className={styles.digit} key={index}>
                        {digit}
                    </span>
                ))}
            </div>
            <p className={styles.muted}>you are visitor #{padded}</p>
        </div>
    );
};

export const WantedPosterWidget = ({
    username,
    pfpUrl,
    debt,
}: {
    username: string;
    pfpUrl?: string | null;
    debt: number;
}) => (
    <figure className={styles.poster}>
        <p className={styles.wanted}>WANTED</p>
        <div className={styles.mugBox}>
            {pfpUrl ? (
                <img className={styles.mug} src={pfpUrl} alt="" />
            ) : (
                <span className={styles.muted}>no mugshot</span>
            )}
        </div>
        <p className={styles.posterName}>{username}</p>
        <p className={styles.reward}>
            reward: {formatAmount(Math.max(0, Number(debt)))} aura of debt
        </p>
    </figure>
);
