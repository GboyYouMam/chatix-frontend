import { useNavigate, useParams } from 'react-router-dom';
import profileUpBanner from '../../assets/profileUpBanner.png';
import profileSideBannerSecond from '../../assets/profileSideBannerSecond.png';
import profileSideBannerFirst from '../../assets/profileSideBannerFirst.png';
import styles from './Profile.module.css';
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore.ts";
import { api } from "../../api/client.ts";
import farmEffectGif from "../../assets/auraFarmingGif.gif"
import payingDebtGif from "../../assets/payingDebtGif.gif"
import type { User } from "../../api/auth/types.ts";

interface ProfileData extends User {
    created_at: string;
    admin_glaze_mode?: boolean;
    is_clown?: boolean;
    isMogged?: boolean;
}

type EffectMode = 'aura' | 'debt' | null;

export const Profile = () => {
    const navigate = useNavigate();

    const { username } = useParams<{ username: string }>();

    const { user: currentUser } = useAuthStore();

    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isMyProfile = currentUser?.username === username;

    const [activeEffect, setActiveEffect] = useState<EffectMode>(null);

    const handleFarmAura = async () => {
        setActiveEffect('aura');

        setProfileData((prev) => prev ? ({
            ...prev,
            aura: Number(prev.aura) + 1
        }) : prev);

        try {
            const response = await api.post('/users/farm-aura');
            setProfileData((prev) => prev ? ({
                ...prev,
                aura: response.data.aura
            }) : prev);
        } catch (error) {
            console.error('Failed to farm aura:', error);
            setProfileData((prev) => prev ? ({
                ...prev,
                aura: Number(prev.aura) - 1
            }) : prev);
        }

        setTimeout(() => {
            setActiveEffect(null);
        }, 1200);
    };

    const handlePayDebt = async () => {
        if (!profileData || profileData.debt <= 0) return;

        setActiveEffect('debt');

        setProfileData((prev) => prev ? ({
            ...prev,
            debt: Math.max(Number(prev.debt) - 1, 0),
        }) : prev);

        try {
            const response = await api.post('/users/pay-debt');
            setProfileData((prev) => prev ? ({
                ...prev,
                debt: typeof response.data?.debt === 'number' ? response.data.debt : prev.debt,
            }) : prev);
        } catch (error) {
            console.error('Failed to pay debt:', error);
            setProfileData((prev) => prev ? ({
                ...prev,
                debt: Number(prev.debt) + 1,
            }) : prev);
        }

        setTimeout(() => {
            setActiveEffect(null);
        }, 1200);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/users/profile/${username}`);
                setProfileData(response.data);
            } catch (error) {
                console.error('Profile fetch error:', error);
                setProfileData(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (isLoading) {
        return <div className={styles.layout}>Loading aura...</div>;
    }

    if (!profileData) {
        return (
            <div className={styles.layout}>
                <div style={{ textAlign: 'center', marginTop: '10rem', color: 'var(--primary)', fontSize: '2rem' }}>
                    Chud not found 💀
                </div>
                <button className={styles.backBtn} style={{ margin: '2rem auto', display: 'block' }} onClick={() => navigate('/rooms')}>
                    ← go back
                </button>
            </div>
        );
    }

    return (
        <div className={styles.layout}>
            {activeEffect && (
                <div className={styles.gifOverlay}>
                    <img
                        src={activeEffect === 'aura' ? farmEffectGif : payingDebtGif}
                        alt={activeEffect === 'aura' ? "Aura Level Up" : "Debt Paid"}
                        className={styles.farmGif}
                    />
                    <div className={styles.auraText}>
                        {activeEffect === 'aura' ? 'AURA +1' : 'DEBT -1'}
                    </div>
                </div>
            )}
            <div className={styles.topActions}>
                <button
                    className={styles.backBtn}
                    onClick={() => navigate('/rooms')}
                >
                    ← back to rooms
                </button>
                {isMyProfile ? (
                        <button className={styles.editBtn} onClick={() => navigate('/settings')}>
                            edit profile ✎
                        </button>
                    ) :
                    <div/>
                }
            </div>

            <div className={styles.gridContainer}>

                <aside className={styles.sideCol}>
                    {isMyProfile ? (
                            <button
                                className={styles.actionBtn}
                                onClick={() => handlePayDebt()}
                                disabled={activeEffect !== null || profileData.debt <= 0}
                            >
                                pay debt
                            </button>
                        )
                        :
                        <div/>
                    }
                    <div className={styles.verticalBanner}>
                        <img
                            src={profileSideBannerFirst}
                            alt="Profile Side Banner"
                            style={{ width: '100%', height: '100%', objectFit: 'scale-down', borderRadius: '8px' }}
                        />
                    </div>
                </aside>

                <main className={styles.mainCol}>
                    <div className={styles.mainBanner}>
                        <img
                            src={profileUpBanner}
                            alt="Profile Up Banner"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                    </div>

                    <div className={styles.profileCard}>
                        <div className={styles.avatarBox}>
                            {profileData.pfp_url ? (
                                <img
                                    src={profileData.pfp_url}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                                />
                            ) : (
                                'no pfp here'
                            )}
                        </div>

                        <div className={styles.userInfo}>
                            <h2 className={styles.username}>{profileData.username}</h2>
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
                                    <span>CLOWN STATUS:</span>
                                    <span>{profileData.is_clown ? 'YES' : 'NO'}</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <span>DEBT:</span>
                                    <span className={profileData.debt > 0 ? styles.errorText : ''}>
                                        {profileData.debt}$
                                    </span>
                                </div>
                                <div className={styles.featureItem}>
                                    <span>ADMIN GLAZE:</span>
                                    <span>{profileData.admin_glaze_mode ? 'ON' : 'OFF'}</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <span>MOGGED:</span>
                                    <span>{profileData.isMogged ? 'YEP' : 'LTN'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.descriptionBox}>
                        <h3 className={styles.descTitle}>description</h3>
                        <p>{profileData.description || 'This chud has nothing to say.'}</p>
                    </div>
                </main>

                <aside className={styles.sideCol}>
                    {isMyProfile ? (
                            <button
                                className={styles.actionBtn}
                                onClick={() => handleFarmAura()}
                                disabled={activeEffect !== null}
                            >
                                farm aura
                            </button>
                    ) :
                        <div/>
                    }
                    <div className={styles.verticalBanner}>
                        <img
                            src={profileSideBannerSecond}
                            alt="Profile Side Banner"
                            style={{ width: '100%', height: '100%', objectFit: 'scale-down', borderRadius: '8px' }}
                        />
                    </div>
                </aside>

            </div>
        </div>
    );
};
