import { useQuery } from '@tanstack/react-query';
import { economyApi } from '../../api/economy/economy.service.ts';
import type { LeaderboardEntry, LeaderboardResponse } from '../../api/economy/types.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import styles from './LeaderboardBadges.module.css';

const TOP_N = 3;
const LEADERBOARD_STALE_TIME = 10 * 60_000;

const BADGES: Array<{
    list: keyof Pick<LeaderboardResponse, 'mostAura' | 'mostDebt' | 'mostMogged'>;
    icon: string;
    label: string;
}> = [
    { list: 'mostAura', icon: '♛', label: 'top aura this week' },
    { list: 'mostDebt', icon: 'x_x', label: 'top debtor this week' },
    { list: 'mostMogged', icon: ':o)', label: 'most mogged this week' },
];

const isTopN = (entries: LeaderboardEntry[] | undefined, username: string) =>
    (entries ?? []).slice(0, TOP_N).some((entry) => entry.username === username);

export const LeaderboardBadges = ({ username }: { username: string }) => {
    const { data } = useQuery({
        queryKey: queryKeys.leaderboard('current'),
        queryFn: () => economyApi.getLeaderboard('current'),
        staleTime: LEADERBOARD_STALE_TIME,
    });

    if (!data) return null;
    const earned = BADGES.filter(({ list }) => isTopN(data[list], username));
    if (!earned.length) return null;

    return (
        <span className={styles.badges}>
            {earned.map(({ list, icon, label }) => (
                <span
                    key={list}
                    className={styles.pill}
                    title={label}
                    aria-label={label}
                    role="img"
                >
                    {icon}
                </span>
            ))}
        </span>
    );
};
