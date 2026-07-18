import { memo } from 'react';
import clsx from 'clsx';
import type { StakeFilter } from '../../api/fight-club/types.ts';
import styles from '../../pages/Fight-Club/Lobby.module.css';

interface FightLobbyFiltersProps {
    stakeFilter: StakeFilter;
    minStake: number;
    maxStake: number;
    onStakeFilter: (value: StakeFilter) => void;
    onMinStake: (value: number) => void;
    onMaxStake: (value: number) => void;
}

export const FightLobbyFilters = memo(
    ({
        stakeFilter,
        minStake,
        maxStake,
        onStakeFilter,
        onMinStake,
        onMaxStake,
    }: FightLobbyFiltersProps) => (
        <aside className={styles.sidebar}>
            <section className={styles.panel}>
                <h2>Stake type</h2>
                <div className={styles.segmented}>
                    {(['all', 'aura', 'debt'] as StakeFilter[]).map((type) => (
                        <button
                            key={type}
                            className={clsx(
                                styles.segmentBtn,
                                stakeFilter === type && styles.activeSegment,
                            )}
                            onClick={() => onStakeFilter(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.panel}>
                <h2>Min stake</h2>
                <input
                    type="range"
                    min="1"
                    max="10000"
                    value={minStake}
                    onChange={(event) => onMinStake(Number(event.target.value))}
                    className={styles.range}
                />
                <input
                    type="number"
                    min="1"
                    value={minStake}
                    onChange={(event) => onMinStake(Number(event.target.value))}
                    className={styles.numberInput}
                />
            </section>

            <section className={styles.panel}>
                <h2>Max stake</h2>
                <input
                    type="range"
                    min="1"
                    max="10000"
                    value={maxStake}
                    onChange={(event) => onMaxStake(Number(event.target.value))}
                    className={styles.range}
                />
                <input
                    type="number"
                    min="1"
                    value={maxStake}
                    onChange={(event) => onMaxStake(Number(event.target.value))}
                    className={styles.numberInput}
                />
            </section>
        </aside>
    ),
);
