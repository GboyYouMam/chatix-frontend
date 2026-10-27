import clsx from 'clsx';
import { ROOM_CATEGORIES, type RoomCategory } from './roomCategories.ts';
import styles from './RoomFilterBar.module.css';

interface RoomFilterBarProps {
    category: RoomCategory | null;
    onCategoryChange: (category: RoomCategory | null) => void;
    showNsfw: boolean;
    onToggleNsfw: () => void;
}

// One scrolling row: `all`, one chip per category, then the 18+ toggle.
export const RoomFilterBar = ({
    category,
    onCategoryChange,
    showNsfw,
    onToggleNsfw,
}: RoomFilterBarProps) => (
    <nav className={styles.bar} aria-label="room categories">
        <div className={styles.row}>
            <button
                type="button"
                className={clsx(styles.chip, category === null && styles.active)}
                aria-pressed={category === null}
                onClick={() => onCategoryChange(null)}
            >
                all
            </button>
            {ROOM_CATEGORIES.map((key) => {
                const active = category === key;
                return (
                    <button
                        key={key}
                        type="button"
                        className={clsx(styles.chip, active && styles.active)}
                        aria-pressed={active}
                        // clicking the active category goes back to `all`
                        onClick={() => onCategoryChange(active ? null : key)}
                    >
                        /{key}/
                    </button>
                );
            })}
            <span className={styles.divider} aria-hidden="true" />
            <button
                type="button"
                className={clsx(styles.chip, styles.nsfw, showNsfw && styles.nsfwOn)}
                aria-pressed={showNsfw}
                onClick={onToggleNsfw}
            >
                {showNsfw ? 'hiding 18+' : 'show 18+'}
            </button>
        </div>
    </nav>
);
