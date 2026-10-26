import { Link } from 'react-router-dom';
import styles from '../../pages/Rooms/Rooms.module.css';
import perkStyles from '../../pages/Rooms/Room.module.css';
import type { RoomDetails } from '../../api/rooms/types.ts';
import { PATH } from '../../utils/pathList.ts';
import { formatDate } from '../../utils/date.ts';
import { useNow } from '../../hooks/useNow.ts';
import { isActiveUntil } from './roomPerks.ts';

interface RoomCardProps {
    room: RoomDetails;
}

export const RoomCard = ({ room }: RoomCardProps) => {
    const now = useNow(30_000);
    const boosted = isActiveUntil(room.boostedUntil, now);
    const roomPath = room.hasPassword
        ? PATH.rooms.href.joinRoom(room.id)
        : PATH.rooms.href.room(room.id);

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.cardDate}>created at: {formatDate(room.createdAt)}</span>
                {boosted && <span className={perkStyles.promotedPill}>promoted</span>}
            </div>

            <h3 className={styles.cardTitle}>{room.title}</h3>
            {room.sponsoredBy && (
                <p className={perkStyles.sponsorLine}>sponsored by @{room.sponsoredBy.username}</p>
            )}
            <p className={styles.cardTopic}>{room.topic || 'no topic'}</p>
            <p className={styles.cardDesc}>{room.description}</p>

            <div className={styles.cardFooter}>
                <Link className={styles.cardCta} to={roomPath}>
                    {room.hasPassword
                        ? 'unlock this private convo'
                        : 'join this convo and mog them all'}
                </Link>
            </div>
        </div>
    );
};
