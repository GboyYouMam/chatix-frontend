import type { AchievementCatalogItem } from '../../api/achievements/types.ts';
import { MedalIcon } from './MedalIcon.tsx';
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
    return (
        <button className={`${styles.toast} ${visible ? styles.visible : ''}`} onClick={onClose}>
            <span className={styles.ribbon}>
                <MedalIcon def={medal} width={26} height={43} />
            </span>
            <span>
                <strong>MEDAL UNLOCKED</strong>
                <span>{medal.name}</span>
            </span>
        </button>
    );
}
