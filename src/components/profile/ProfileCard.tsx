import styles from './ProfileCard.module.css';
import type { ProfileData } from '../../api/users/types.ts';

interface ProfileCardProps {
    profileData: ProfileData;
}

export const ProfileCard = ({ profileData }: ProfileCardProps) => {
    const respectCount = profileData.respectCount ?? profileData.respect_count ?? 0;
    const isClown = profileData.is_clown ?? profileData.isClown;
    const adminGlazeMode = profileData.admin_glaze_mode ?? profileData.adminGlazeMode;

    return (
        <div className={styles.profileCard}>
            <div className={styles.avatarBox}>
                {profileData.pfp_url ? (
                    <img
                        src={profileData.pfp_url}
                        alt="avatar"
                        className={styles.avatarImage}
                    />
                ) : (
                    'no pfp here'
                )}
            </div>

            <div className={styles.userInfo}>
                <div className={styles.nameRow}>
                    <h2 className={styles.username}>{profileData.username}</h2>
                    {profileData.forcedTitle && (
                        <span className={styles.forcedTitle}>[{profileData.forcedTitle}]</span>
                    )}
                </div>
                <p className={styles.vibe}>{profileData.vibe || 'no vibe detected'}</p>
            </div>

            <div className={styles.statsCol}>
                <span className={styles.date}>
                    when u came here: {new Date(profileData.created_at).toLocaleDateString('uk-UA')}
                </span>
                <div className={styles.featuresBox}>
                    <div className={styles.featureItem}>
                        <span>AURA:</span>
                        <span className={styles.primaryText}>{profileData.aura}</span>
                    </div>
                    <div className={styles.featureItem}>
                        <span>RESPECT:</span>
                        <span className={styles.primaryText}>{respectCount}</span>
                    </div>
                    <div className={styles.featureItem}>
                        <span>CLOWN STATUS:</span>
                        <span>{isClown ? 'YES' : 'NO'}</span>
                    </div>
                    <div className={styles.featureItem}>
                        <span>DEBT:</span>
                        <span className={profileData.debt > 0 ? styles.errorText : ''}>
                            {profileData.debt}$
                        </span>
                    </div>
                    <div className={styles.featureItem}>
                        <span>ADMIN GLAZE:</span>
                        <span>{adminGlazeMode ? 'ON' : 'OFF'}</span>
                    </div>
                    <div className={styles.featureItem}>
                        <span>MOGGED:</span>
                        <span>{profileData.isMogged ? 'YEP' : 'NAH'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
