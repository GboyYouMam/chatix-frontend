import styles from './ProfileCard.module.css';
import { formatDate } from '../../utils/date.ts';
import type { ProfileData } from '../../api/users/types.ts';
import { MedalRack } from '../achievements/MedalRack.tsx';
import type { AchievementCatalogItem } from '../../api/achievements/types.ts';
import { NyanCat } from '../cosmetics/NyanCat.tsx';
import { VerifiedCheck } from '../cosmetics/VerifiedCheck.tsx';
import { VineBoomButton } from '../cosmetics/VineBoomButton.tsx';
import { pickProfileTitle } from '../cosmetics/profileCosmetics.ts';
import { useShopCatalog } from '../../hooks/shop/useShop.ts';

interface ProfileCardProps {
    profileData: ProfileData;
    medalCatalog: AchievementCatalogItem[];
    onViewMedalBook: () => void;
}

export const ProfileCard = ({ profileData, medalCatalog, onViewMedalBook }: ProfileCardProps) => {
    const respectCount = profileData.respectCount ?? profileData.respect_count ?? 0;
    const isClown = profileData.is_clown ?? profileData.isClown;
    const adminGlazeMode = profileData.admin_glaze_mode ?? profileData.adminGlazeMode;
    const cosmetics = profileData.cosmetics;
    const { data: shopCatalog = [] } = useShopCatalog();
    const titleKey = cosmetics?.title;
    const cosmeticTitleName = titleKey
        ? (shopCatalog.find((item) => item.key === titleKey)?.name ?? null)
        : null;
    const shopTitle = pickProfileTitle({
        forcedTitle: profileData.forcedTitle,
        fightTitle: profileData.fightTitle,
        cosmeticTitleName,
    });

    return (
        <div className={styles.profileCard}>
            <div className={styles.avatarBox}>
                {profileData.pfp_url ? (
                    <img src={profileData.pfp_url} alt="avatar" className={styles.avatarImage} />
                ) : (
                    'no pfp here'
                )}
            </div>

            <div className={styles.userInfo}>
                <div className={styles.nameRow}>
                    {cosmetics?.nyanCat && <NyanCat />}
                    {profileData.forcedTitle && (
                        <span className={styles.forcedTitle}>[{profileData.forcedTitle}]</span>
                    )}
                    <div className={styles.nameLine}>
                        <h2 className={styles.username}>{profileData.username}</h2>
                        {cosmetics?.verified && <VerifiedCheck />}
                    </div>
                    {shopTitle && <p className={styles.shopTitle}>{shopTitle}</p>}
                </div>
                <p className={styles.vibe}>{profileData.vibe || 'no vibe detected'}</p>
                {cosmetics?.vineBoom && <VineBoomButton />}
                <MedalRack
                    unlocked={profileData.achievements ?? []}
                    catalog={medalCatalog}
                    onViewBook={onViewMedalBook}
                />
            </div>

            <div className={styles.statsCol}>
                <span className={styles.date}>
                    when u came here: {formatDate(profileData.created_at)}
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
                            {profileData.debt} debt
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
