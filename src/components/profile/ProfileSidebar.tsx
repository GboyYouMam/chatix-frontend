import profileSideBannerFirst from '../../assets/profileSideBannerFirst.png';
import profileSideBannerSecond from '../../assets/profileSideBannerSecond.png';
import styles from './ProfileSidebar.module.css';

interface ProfileSidebarProps {
    actionLabel?: string;
    actionDisabled?: boolean;
    onAction?: () => void;
    bannerSrc?: string | null;
    bannerAlt: string;
    fallbackBanner: 'left' | 'right';
}

export const ProfileSidebar = ({
    actionLabel,
    actionDisabled = false,
    onAction,
    bannerSrc,
    bannerAlt,
    fallbackBanner,
}: ProfileSidebarProps) => {
    const fallbackImage = fallbackBanner === 'left' ? profileSideBannerFirst : profileSideBannerSecond;

    return (
        <aside className={styles.sideCol}>
            {actionLabel && onAction ? (
                <button className={styles.actionBtn} onClick={onAction} disabled={actionDisabled}>
                    {actionLabel}
                </button>
            ) : (
                <div />
            )}
            <div className={styles.verticalBanner}>
                <img src={bannerSrc || fallbackImage} alt={bannerAlt} className={styles.bannerImage} />
            </div>
        </aside>
    );
};
