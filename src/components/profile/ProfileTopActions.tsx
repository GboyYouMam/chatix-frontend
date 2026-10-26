import { useNavigate } from 'react-router-dom';
import styles from './ProfileTopActions.module.css';
import { PATH } from '../../utils/pathList.ts';

interface ProfileTopActionsProps {
    isMyProfile: boolean;
}

export const ProfileTopActions = ({ isMyProfile }: ProfileTopActionsProps) => {
    const navigate = useNavigate();

    return (
        <div className={styles.topActions}>
            <button className={styles.backBtn} onClick={() => navigate(PATH.rooms.rooms)}>
                &lt;- back to rooms
            </button>
            <div className={styles.rightGroup}>
                <button className={styles.shopBtn} onClick={() => navigate(PATH.shop.shop)}>
                    mogger mart
                </button>
                {isMyProfile && (
                    <button
                        className={styles.editBtn}
                        onClick={() => navigate(PATH.authAndUser.editProfile)}
                    >
                        edit profile
                    </button>
                )}
            </div>
        </div>
    );
};
