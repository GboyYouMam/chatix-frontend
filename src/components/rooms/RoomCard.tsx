import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Rooms/Rooms.module.css';
import type {RoomDetails} from "../../api/rooms/types.ts";
import { PATH } from '../../utils/pathList.ts';

interface RoomCardProps {
    room: RoomDetails;
}

export const RoomCard = ({ room }: RoomCardProps) => {
    const navigate = useNavigate();

    const formattedDate = new Date(room.createdAt).toLocaleDateString('uk-UA');

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.cardDate}>
                    created at: {formattedDate}
                </span>
            </div>

            <h3 className={styles.cardTitle}>{room.title}</h3>
            <p className={styles.cardTopic}>{room.topic || 'no topic'}</p>
            <p className={styles.cardDesc}>{room.description}</p>

            <div className={styles.cardFooter}>
                <a
                    className={styles.cardCta}
                    onClick={() => navigate(room.hasPassword ? PATH.rooms.href.joinRoom(room.id) : PATH.rooms.href.room(room.id))}
                    style={{ cursor: 'pointer' }}
                >
                    {room.hasPassword ? 'unlock this private convo' : 'join this convo and mog them all'}
                </a>
            </div>
        </div>
    );
};
