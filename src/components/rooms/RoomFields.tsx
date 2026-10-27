import clsx from 'clsx';
import { ROOM_CATEGORIES, type RoomCategory } from './roomCategories.ts';
import styles from './RoomFields.module.css';

interface RoomCategoryPickerProps {
    value: RoomCategory | null;
    onChange: (category: RoomCategory | null) => void;
}

export const RoomCategoryPicker = ({ value, onChange }: RoomCategoryPickerProps) => (
    <div className={styles.wrapper}>
        <span className={styles.label} id="room-category-label">
            Category
        </span>
        <div className={styles.chips} role="radiogroup" aria-labelledby="room-category-label">
            {[null, ...ROOM_CATEGORIES].map((key) => {
                const selected = value === key;
                return (
                    <button
                        key={key ?? 'none'}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={clsx(styles.chip, selected && styles.chipSelected)}
                        onClick={() => onChange(key)}
                    >
                        {key ? `/${key}/` : 'none'}
                    </button>
                );
            })}
        </div>
    </div>
);

interface NsfwSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const NsfwSwitch = ({ checked, onChange }: NsfwSwitchProps) => (
    <div className={styles.nsfwWrapper}>
        <label className={styles.switchLabel}>
            <input
                type="checkbox"
                role="switch"
                className={styles.switchInput}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span className={clsx(styles.track, checked && styles.trackOn)} aria-hidden="true">
                <span className={styles.knob} />
            </span>
            <span className={styles.switchText}>18+ room</span>
        </label>
        <p className={styles.hint}>
            drugs talk, nsfw, cursed stuff. people will have to confirm they're adults. illegal
            stuff still gets you banned, chud.
        </p>
    </div>
);
