import { useNavigate, useParams } from 'react-router-dom';
import profileUpBanner from '../../assets/profileUpBanner.png';
import styles from './Profile.module.css';
import { useState } from "react";
import { useAuthStore } from "../../store/authStore.ts";
import toast from "react-hot-toast";
import { usersApi } from "../../api/users/users.service.ts";
import type { ProfileData } from "../../api/users/types.ts";
import { ProfileEffectsOverlay } from "../../components/profile/ProfileEffectsOverlay.tsx";
import { ProfileTopActions } from "../../components/profile/ProfileTopActions.tsx";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar.tsx";
import { ProfileCard } from "../../components/profile/ProfileCard.tsx";
import { ProfileModerationBar } from "../../components/profile/ProfileModerationBar.tsx";
import { ProfileDescription } from "../../components/profile/ProfileDescription.tsx";
import { ProfileCommentsSection } from "../../components/profile/ProfileCommentsSection.tsx";
import { PATH } from "../../utils/pathList.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type EffectMode = 'aura' | 'debt' | null;

export const Profile = () => {
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();

    const {
        data: profileData,
        isLoading,
    } = useQuery({
        queryKey: ['profile', username],
        queryFn: () => usersApi.getProfile(username!),
        enabled: Boolean(username),
        retry: false,
    });

    const [activeEffect, setActiveEffect] = useState<EffectMode>(null);
    const [isRespectLoading, setIsRespectLoading] = useState(false);

    const isMyProfile = currentUser?.username === username;
    const canInteractWithProfile = Boolean(currentUser && !isMyProfile);

    const updateProfileCache = (updater: (prev: ProfileData) => ProfileData) => {
        queryClient.setQueryData(['profile', username], (oldData: ProfileData | undefined) => {
            if (!oldData) return oldData;
            return updater(oldData);
        });
    };

    const handleFarmAura = async () => {
        setActiveEffect('aura');

        updateProfileCache((prev) => ({ ...prev, aura: Number(prev.aura) + 1 }));

        try {
            const response = await usersApi.farmAura();
            updateProfileCache((prev) => ({ ...prev, aura: response.aura }));
        } catch (error) {
            console.error('Failed to farm aura:', error);
            updateProfileCache((prev) => ({ ...prev, aura: Number(prev.aura) - 1 }));
        }

        setTimeout(() => setActiveEffect(null), 1200);
    };

    const handlePayDebt = async () => {
        if (!profileData || profileData.debt <= 0) return;

        setActiveEffect('debt');

        updateProfileCache((prev) => ({ ...prev, debt: Math.max(Number(prev.debt) - 1, 0) }));

        try {
            const response = await usersApi.payDebt();
            updateProfileCache((prev) => ({
                ...prev,
                debt: typeof response.debt === 'number' ? response.debt : prev.debt,
            }));
        } catch (error) {
            console.error('Failed to pay debt:', error);
            updateProfileCache((prev) => ({ ...prev, debt: Number(prev.debt) + 1 }));
        }

        setTimeout(() => setActiveEffect(null), 1200);
    };

    const handleRespect = async () => {
        if (!username || !canInteractWithProfile || profileData?.hasRespected || isRespectLoading) return;

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
            toast.success(response.alreadyRespected ? "respect already sent" : "respect sent");
        } catch (error) {
            console.error('Failed to respect profile:', error);
            // Відкат у разі помилки
            updateProfileCache((prev) => ({
                ...prev,
                respectCount: Math.max((prev.respectCount ?? prev.respect_count ?? 1) - 1, 0),
                hasRespected: false,
            }));
            toast.error("could not send respect");
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
                <div className={styles.statusBox}>
                    Chud not found
                </div>
                <button className={styles.backBtn} onClick={() => navigate(PATH.rooms.rooms)}>
                    &lt;- go back
                </button>
            </div>
        );
    }

    const comments = profileData.comments ?? [];

    return (
        <div className={styles.layout}>
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
                    <div className={styles.mainBanner}>
                        <img
                            src={profileData.upper_banner_url || profileUpBanner}
                            alt="Profile Up Banner"
                            className={styles.bannerImage}
                        />
                    </div>

                    <ProfileCard profileData={profileData} />
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
                            : !canInteractWithProfile || profileData.hasRespected || isRespectLoading
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
