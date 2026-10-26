import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { economyApi } from '../../api/economy/economy.service.ts';
import type { LeaderboardEntry, LeaderboardWeek } from '../../api/economy/types.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { formatAmount } from '../../components/shop/shopFormat.ts';
import { glyphFor } from '../../components/cosmetics/profileCosmetics.ts';
import { PATH } from '../../utils/pathList.ts';
import styles from './Leaderboard.module.css';

type BoardKey = 'mostAura' | 'mostDebt' | 'mostMogged';

const BOARDS: Array<{ key: BoardKey; label: string; unit: string; blurb: string }> = [
    {
        key: 'mostAura',
        label: 'most aura',
        unit: 'aura',
        blurb: 'the ones who farmed like it was a job.',
    },
    {
        key: 'mostDebt',
        label: 'most in debt',
        unit: 'debt',
        blurb: 'financially cooked. respect the commitment.',
    },
    {
        key: 'mostMogged',
        label: 'most mogged',
        unit: 'losses',
        blurb: 'mogged so often it is a lifestyle.',
    },
];

// Podium icons: crown for first, skull for second, clown for third.
const PODIUM_ICONS = ['nameicon_crown', 'nameicon_skull', 'nameicon_clown'];

const WEEKS: Array<{ key: LeaderboardWeek; label: string }> = [
    { key: 'current', label: 'this week' },
    { key: 'previous', label: 'last week' },
];

const Row = ({
    entry,
    rank,
    unit,
    onOpen,
}: {
    entry: LeaderboardEntry;
    rank: number;
    unit: string;
    onOpen: (username: string) => void;
}) => {
    const avatar = entry.pfp_url ?? entry.avatar;
    return (
        <li className={styles.row}>
            <span className={styles.rank}>#{rank}</span>
            {avatar ? (
                <img src={avatar} alt="" className={styles.avatar} />
            ) : (
                <span className={styles.avatarFallback} aria-hidden="true" />
            )}
            <button type="button" className={styles.name} onClick={() => onOpen(entry.username)}>
                {entry.username}
            </button>
            <span className={styles.value}>
                {formatAmount(entry.value)} {unit}
            </span>
        </li>
    );
};

export const Leaderboard = () => {
    const navigate = useNavigate();
    const [week, setWeek] = useState<LeaderboardWeek>('current');
    const [boardKey, setBoardKey] = useState<BoardKey>('mostAura');
    const board = BOARDS.find((item) => item.key === boardKey) ?? BOARDS[0];

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: queryKeys.leaderboard(week),
        queryFn: () => economyApi.getLeaderboard(week),
        staleTime: 60_000,
    });

    const rows = data?.[boardKey] ?? [];
    const podium = rows.slice(0, 3);
    const rest = rows.slice(3);

    const openProfile = (username: string) => navigate(PATH.authAndUser.href.profile(username));

    let body;
    if (isError) {
        body = (
            <p className={styles.state}>
                the board is cooked. <button onClick={() => void refetch()}>retry</button>
            </p>
        );
    } else if (isLoading) {
        body = <p className={styles.state}>counting the aura...</p>;
    } else if (rows.length === 0) {
        body = <p className={styles.state}>nobody did anything this week. embarrassing.</p>;
    } else {
        body = (
            <>
                <ol className={styles.podium} aria-label={`${board.label}, top three`}>
                    {podium.map((entry, index) => (
                        <li key={entry.username} className={styles.podiumCard}>
                            <span className={styles.podiumIcon} aria-hidden="true">
                                {glyphFor(PODIUM_ICONS[index])}
                            </span>
                            <button
                                type="button"
                                className={styles.podiumName}
                                onClick={() => openProfile(entry.username)}
                            >
                                {entry.username}
                            </button>
                            <span className={styles.podiumValue}>
                                {formatAmount(entry.value)} {board.unit}
                            </span>
                        </li>
                    ))}
                </ol>
                {rest.length > 0 && (
                    <ol className={styles.list}>
                        {rest.map((entry, index) => (
                            <Row
                                key={entry.username}
                                entry={entry}
                                rank={index + 4}
                                unit={board.unit}
                                onOpen={openProfile}
                            />
                        ))}
                    </ol>
                )}
            </>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link to={PATH.rooms.rooms} className={styles.back}>
                    ← back to lobby
                </Link>
                <h1 className={styles.title}>the leaderboard</h1>
                <p className={styles.subtitle}>who&apos;s cooking this week. the rest are chuds.</p>
            </header>

            <div className={styles.controls}>
                <div className={styles.tabs} role="tablist" aria-label="leaderboard category">
                    {BOARDS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            role="tab"
                            aria-selected={boardKey === item.key}
                            className={clsx(styles.tab, boardKey === item.key && styles.tabActive)}
                            onClick={() => setBoardKey(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className={styles.weeks} role="group" aria-label="week">
                    {WEEKS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            aria-pressed={week === item.key}
                            className={clsx(styles.weekBtn, week === item.key && styles.tabActive)}
                            onClick={() => setWeek(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <p className={styles.blurb}>{board.blurb}</p>
            <main>{body}</main>
        </div>
    );
};
