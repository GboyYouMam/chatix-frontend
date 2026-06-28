import { useNavigate } from 'react-router-dom';
import styles from './ProfileTopActions.module.css';

interface ProfileTopActionsProps {
    isMyProfile: boolean;
}

export const ProfileTopActions = ({ isMyProfile }: ProfileTopActionsProps) => {
    const navigate = useNavigate();

    return (
        <div className={styles.topActions}>
            <button className={styles.backBtn} onClick={() => navigate('/rooms')}>
                &lt;- back to rooms
            </button>
            {isMyProfile ? (
                <button className={styles.editBtn} onClick={() => navigate('/settings')}>
                    edit profile
                </button>
            ) : (
                <div />
            )}
        </div>
    );
};
