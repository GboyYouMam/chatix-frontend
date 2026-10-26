import type { AchievementCatalogItem } from '../../api/achievements/types.ts';
import { ribbonStyle } from './ribbons.ts';
import styles from './MedalUnlockedToast.module.css';

export function MedalUnlockedToast({
    medal,
    visible,
    onClose,
}: {
    medal: AchievementCatalogItem;
    visible: boolean;
    onClose: () => void;
}) {
    const ribbon = ribbonStyle(medal);
    return (
        <button className={`${styles.toast} ${visible ? styles.visible : ''}`} onClick={onClose}>
            <span
                className={styles.ribbon}
                style={{ background: ribbon.background, borderColor: ribbon.border }}
                aria-hidden="true"
            >
                {medal.icon || '✦'}
            </span>
            <span>
                <strong>MEDAL UNLOCKED</strong>
                <span>{medal.name}</span>
            </span>
        </button>
    );
}
