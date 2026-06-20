import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from '../../pages/Rooms/Room.module.css';
import type { RoomDetails } from "../../api/rooms/types.ts";

interface RoomOpPostProps {
    room: RoomDetails;
    isRoomCreator: boolean;
}

export const RoomOpPost = ({ room, isRoomCreator }: RoomOpPostProps) => {
    const navigate = useNavigate();

    const handleCopyInviteLink = async () => {
        const inviteUrl = `${window.location.origin}/room/${room.id}/join`;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            toast.success('Invite link copied. Send it to your bums.');
        } catch (error) {
            toast.error('Failed to copy link.');
        }
    };

    return (
        <div className={styles.opPost}>
            <div className={styles.postMeta}>
                <span className={styles.subject}>{room.topic || 'No topic'}</span>
                <span
                    className={styles.username}
                    onClick={() => navigate(`/profile/${room.creator.username}`)}
                >
                    {room.creator.username}
                </span>
                {(room.creator.isMogged || room.creator.is_mogged) && (
                    <span className={styles.moggedBadge}> [MOGGED]</span>
                )}
                <span className={styles.date}>
                    {new Date(room.createdAt).toLocaleString('uk-UA')}
                </span>
                <span className={styles.postId}>№OP_{room.id.slice(-6)}</span>
            </div>
            <div className={styles.postBody}>
                {room.description || 'No description provided by OP.'}
            </div>

            {room.publicity === 'private' && isRoomCreator && (
                <div className={styles.opActions}>
                    <button onClick={handleCopyInviteLink} className={styles.inviteBtn}>
                        [COPY INVITE LINK]
                    </button>
                </div>
            )}
        </div>
    );
};