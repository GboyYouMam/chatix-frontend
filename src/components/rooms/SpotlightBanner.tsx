import type { RoomSpotlight } from '../../api/rooms/types.ts';
import { useNow } from '../../hooks/useNow.ts';
import { formatCountdown, isActiveUntil } from './roomPerks.ts';
import styles from '../../pages/Rooms/Room.module.css';

export const SpotlightBanner = ({ spotlight }: { spotlight: RoomSpotlight | null | undefined }) => {
    const now = useNow(1000, Boolean(spotlight));
    if (!spotlight || !isActiveUntil(spotlight.expiresAt, now)) return null;

    const author = spotlight.message.author?.username ?? 'anon';
    return (
        <section className={styles.spotlightBox} aria-label="spotlight message">
            <div className={styles.spotlightMeta}>
                <span>spotlight · {author}</span>
                <span className={styles.countdown}>
                    ends in {formatCountdown(spotlight.expiresAt, now)}
                </span>
            </div>
            <div className={styles.postBody}>{spotlight.message.cipherText}</div>
        </section>
    );
};
