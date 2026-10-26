import { useNavigate } from 'react-router-dom';
import { notify } from '../../lib/toast';
import styles from '../../pages/Rooms/Room.module.css';
import type { RoomDetails } from '../../api/rooms/types.ts';
import { PATH } from '../../utils/pathList.ts';
import { useMemo } from 'react';
import { formatDate } from '../../utils/date.ts';
import { FeaturedMedals } from '../achievements/FeaturedMedals.tsx';

interface RoomOpPostProps {
    room: RoomDetails;
    isRoomCreator: boolean;
}

export const RoomOpPost = ({ room, isRoomCreator }: RoomOpPostProps) => {
    const navigate = useNavigate();

    const formattedDate = useMemo(() => {
        return formatDate(room.createdAt);
    }, [room.createdAt]);

    const handleCopyInviteLink = async () => {
        const inviteUrl = `${window.location.origin}${PATH.rooms.href.joinRoom(room.id)}`;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            notify.success('Invite link copied. Send it to your bums.');
        } catch {
            notify.error('Failed to copy link.');
        }
    };

    return (
        <div className={styles.opPost}>
            <div className={styles.postMeta}>
                <span className={styles.subject}>{room.topic || 'No topic'}</span>
                <span
                    className={styles.username}
                    onClick={() => navigate(PATH.authAndUser.href.profile(room.creator.username))}
                >
                    {room.creator.username}
                    <FeaturedMedals keys={room.creator.featuredAchievements} />
                </span>
                {(room.creator.isMogged || room.creator.is_mogged) && (
                    <span className={styles.moggedBadge}> [MOGGED]</span>
                )}
                <span className={styles.date}>{formattedDate}</span>
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
