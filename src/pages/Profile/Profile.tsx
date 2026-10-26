import { useNavigate, useParams } from 'react-router-dom';
import profileUpBanner from '../../assets/profileUpBanner.png';
import styles from './Profile.module.css';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore.ts';
import { notify } from '../../lib/toast';
import { usersApi } from '../../api/users/users.service.ts';
import type { ProfileData } from '../../api/users/types.ts';
import { ProfileEffectsOverlay } from '../../components/profile/ProfileEffectsOverlay.tsx';
import { ProfileTopActions } from '../../components/profile/ProfileTopActions.tsx';
import { ProfileSidebar } from '../../components/profile/ProfileSidebar.tsx';
import { ProfileCard } from '../../components/profile/ProfileCard.tsx';
import { ProfileModerationBar } from '../../components/profile/ProfileModerationBar.tsx';
import { ProfileDescription } from '../../components/profile/ProfileDescription.tsx';
import { ProfileCommentsSection } from '../../components/profile/ProfileCommentsSection.tsx';
import { WarningTicker } from '../../components/profile/WarningTicker.tsx';
import { PATH } from '../../utils/pathList.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys.ts';
import { achievementsApi } from '../../api/achievements/achievements.service.ts';
import { MedalBook } from '../../components/achievements/MedalBook.tsx';

type EffectMode = 'aura' | 'debt' | null;

export const Profile = () => {
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const { data: medalCatalog = [] } = useQuery({
        queryKey: ['achievementCatalog'],
        queryFn: achievementsApi.getCatalog,
        staleTime: Infinity,
        retry: false,
    });

    const { data: profileData, isLoading } = useQuery({
        queryKey: queryKeys.profile(username),
        queryFn: () => usersApi.getProfile(username!),
        enabled: Boolean(username),
        retry: false,
    });

    const [activeEffect, setActiveEffect] = useState<EffectMode>(null);
    const [medalBookOpen, setMedalBookOpen] = useState(false);
    const [isRespectLoading, setIsRespectLoading] = useState(false);

    const isMyProfile = currentUser?.username === username;
    const canInteractWithProfile = Boolean(currentUser && !isMyProfile);

    const updateProfileCache = (updater: (prev: ProfileData) => ProfileData) => {
        queryClient.setQueryData(
            queryKeys.profile(username),
            (oldData: ProfileData | undefined) => {
                if (!oldData) return oldData;
                return updater(oldData);
            },
        );
    };

    const handleFarmAura = async () => {
        if (!profileData) return;
        const previous = profileData;
        setActiveEffect('aura');

        updateProfileCache((prev) => ({ ...prev, aura: Number(prev.aura) + 1 }));

        try {
            const response = await usersApi.farmAura();
            updateProfileCache((prev) => ({ ...prev, aura: response.aura }));
        } catch (error) {
            updateProfileCache(() => previous);
            notify.error(error);
        }

        setTimeout(() => setActiveEffect(null), 1200);
    };

    const handlePayDebt = async () => {
        if (!profileData || profileData.debt <= 0) return;
        const previous = profileData;

        setActiveEffect('debt');

        updateProfileCache((prev) => ({ ...prev, debt: Math.max(Number(prev.debt) - 1, 0) }));

        try {
            const response = await usersApi.payDebt();
            updateProfileCache((prev) => ({
                ...prev,
                debt: typeof response.debt === 'number' ? response.debt : prev.debt,
            }));
        } catch (error) {
            updateProfileCache(() => previous);
            notify.error(error);
        }

        setTimeout(() => setActiveEffect(null), 1200);
    };

    const handleRespect = async () => {
        if (!username || !canInteractWithProfile || profileData?.hasRespected || isRespectLoading)
            return;
        if (!profileData) return;
        const previous = profileData;

        setIsRespectLoading(true);

        updateProfileCache((prev) => ({
            ...prev,
            respectCount: (prev.respectCount ?? prev.respect_count ?? 0) + 1,
            hasRespected: true,
        }));

        try {
            const response = await usersApi.respectProfile(username);
            updateProfileCache((prev) => ({
                ...prev,
                respectCount: response.respectCount,
                hasRespected: response.respected,
            }));
            notify.success(response.alreadyRespected ? 'respect already sent' : 'respect sent');
        } catch (error) {
            updateProfileCache(() => previous);
            notify.error(error);
        } finally {
            setIsRespectLoading(false);
        }
    };

    if (isLoading) {
        return <div className={styles.layout}>Loading aura...</div>;
    }

    if (!profileData) {
        return (
            <div className={styles.layout}>
                <div className={styles.statusBox}>Chud not found</div>
                <button className={styles.backBtn} onClick={() => navigate(PATH.rooms.rooms)}>
                    &lt;- go back
                </button>
            </div>
        );
    }

    const comments = profileData.comments ?? [];

    return (
        <div className={styles.layout}>
            <MedalBook
                isOpen={medalBookOpen}
                onClose={() => setMedalBookOpen(false)}
                catalog={medalCatalog}
                unlockedKeys={(profileData.achievements ?? []).map(({ key }) => key)}
            />
            <ProfileEffectsOverlay activeEffect={activeEffect} />
            <ProfileTopActions isMyProfile={isMyProfile} />

            <div className={styles.gridContainer}>
                <ProfileSidebar
                    actionLabel={isMyProfile ? 'pay debt' : undefined}
                    actionDisabled={activeEffect !== null || profileData.debt <= 0}
                    onAction={isMyProfile ? handlePayDebt : undefined}
                    bannerSrc={profileData.left_banner_url}
                    bannerAlt="Profile Side Banner"
                    fallbackBanner="left"
                />

                <main className={styles.mainCol}>
                    <WarningTicker warnings={profileData.activeWarnings ?? []} />
                    <div className={styles.mainBanner}>
                        <img
                            src={profileData.upper_banner_url || profileUpBanner}
                            alt="Profile Up Banner"
                            className={styles.bannerImage}
                        />
                    </div>

                    <ProfileCard
                        profileData={profileData}
                        medalCatalog={medalCatalog}
                        onViewMedalBook={() => setMedalBookOpen(true)}
                    />
                    <ProfileModerationBar profileData={profileData} />
                    <ProfileDescription description={profileData.description} />
                    <ProfileCommentsSection
                        key={profileData.username}
                        profileUsername={profileData.username}
                        initialComments={comments}
                        canInteractWithProfile={canInteractWithProfile}
                    />
                </main>

                <ProfileSidebar
                    actionLabel={
                        isMyProfile
                            ? 'farm aura'
                            : profileData.hasRespected
                              ? 'respected'
                              : isRespectLoading
                                ? 'sending...'
                                : 'give respect'
                    }
                    actionDisabled={
                        isMyProfile
                            ? activeEffect !== null
                            : !canInteractWithProfile ||
                              profileData.hasRespected ||
                              isRespectLoading
                    }
                    onAction={isMyProfile ? handleFarmAura : handleRespect}
                    bannerSrc={profileData.right_banner_url}
                    bannerAlt="Profile Side Banner"
                    fallbackBanner="right"
                />
            </div>
        </div>
    );
};
