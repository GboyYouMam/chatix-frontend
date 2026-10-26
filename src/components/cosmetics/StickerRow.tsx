import clsx from 'clsx';
import { glyphFor } from './profileCosmetics.ts';
import styles from './StickerRow.module.css';

interface StickerRowProps {
    stickers?: Array<string | null> | null;
}

const SLOT_CLASSES = [styles.slot1, styles.slot2, styles.slot3];

export const StickerRow = ({ stickers }: StickerRowProps) => (
    <div className={styles.row} aria-hidden="true">
        {SLOT_CLASSES.map((slotClass, index) => {
            const value = stickers?.[index];
            if (!value) return null;
            return (
                <span key={index} className={clsx(styles.sticker, slotClass)}>
                    {glyphFor(value)}
                </span>
            );
        })}
    </div>
);
