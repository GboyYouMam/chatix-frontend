import { useNavigate, useParams } from 'react-router-dom';
import profileUpBanner from '../../assets/profileUpBanner.png';
import profileSideBannerSecond from '../../assets/profileSideBannerSecond.png';
import profileSideBannerFirst from '../../assets/profileSideBannerFirst.png';
import styles from './Profile.module.css';
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore.ts";
import { api } from "../../api/client.ts";
import farmEffectGif from "../../assets/auraFarmingGif.gif"

export const Profile = () => {
    const navigate = useNavigate();

    const { username } = useParams<{ username: string }>();

    const { user: currentUser } = useAuthStore();

    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isMyProfile = currentUser?.username === username;

    const [showGif, setShowGif] = useState(false);

    const handleFarmAura = async () => {
        setShowGif(true);

        setProfileData((prev: any) => ({
            ...prev,
            aura: Number(prev.aura) + 1
        }));

        try {
            const response = await api.post('/users/farm-aura');
            setProfileData((prev: any) => ({
                ...prev,
                aura: response.data.aura
            }));
        } catch (error) {
            console.error('Failed to farm aura:', error);
            setProfileData((prev: any) => ({
                ...prev,
                aura: Number(prev.aura) - 1
            }));
        }

        setTimeout(() => {
            setShowGif(false);
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
            {showGif && (
                <div className={styles.gifOverlay}>
                    <img src={farmEffectGif} alt="Aura Level Up" className={styles.farmGif} />
                    <div className={styles.auraText}>AURA +1</div>
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
                            <button className={styles.actionBtn}>
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
                            <button className={styles.actionBtn} onClick={() => handleFarmAura()} disabled={showGif}>
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