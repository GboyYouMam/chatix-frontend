import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/rooms/rooms.service';
import { CreateRoomModal } from '../../components/rooms/CreateRoomModal.tsx';
import clsx from 'clsx';
import styles from './Rooms.module.css';
import bannerPng from '../../assets/banner.png';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { useRooms } from '../../hooks/rooms/useRooms.ts';
import { RoomCard } from '../../components/rooms/RoomCard.tsx';
import { type RoomDetails } from '../../api/rooms/types.ts';
import { PATH } from '../../utils/pathList.ts';
import { createTripleClickDetector, isSecretQuery } from '../../utils/easterEgg.ts';
import { notify } from '../../lib/toast.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { MyRooms } from '../../components/rooms/MyRooms.tsx';
import { achievementsApi } from '../../api/achievements/achievements.service.ts';

export const Rooms = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const { searchRoomByName } = useRooms();

    const [roomType, setRoomType] = useState<'public' | 'private'>('public');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const [searchPlaceholder] = useState(() =>
        Math.random() < 1 / 40 ? 'ask nobody about rule #1' : 'find your place',
    );
    const tripleClick = useRef(createTripleClickDetector());

    const triggerEasterEgg = (key: 'first_rule' | 'found_the_basement') => {
        if (!token) {
            notify.error('login first, chud');
            navigate(PATH.authAndUser.login);
            return;
        }
        setIsGlitching(true);
        void achievementsApi.discover(key).catch(() => undefined);
        notify.info("we don't talk about it.");
        window.setTimeout(() => navigate(PATH.fightClub.lobby), 600);
    };

    const {
        data: rooms,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: queryKeys.rooms(roomType),
        queryFn: () => roomApi.getRooms(roomType),
    });

    const filteredRooms = useMemo(() => {
        if (!rooms) return [];

        const lowerCaseQuery = searchQuery.toLowerCase();

        return rooms.filter(
            (room: RoomDetails) =>
                room.title.toLowerCase().includes(lowerCaseQuery) ||
                room.topic?.toLowerCase().includes(lowerCaseQuery),
        );
    }, [rooms, searchQuery]);

    const handleGoToMyProfile = () => {
        if (user && user.username) {
            navigate(PATH.authAndUser.href.profile(user.username));
        } else {
            navigate(PATH.authAndUser.login);
        }
    };

    const handleBackendSearch = () => {
        if (!searchQuery.trim()) return;
        searchRoomByName.mutate(searchQuery);
    };

    const renderGridContent = () => {
        if (isError) {
            return (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                    the lobby is on fire. <button onClick={() => void refetch()}>retry</button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div
                    style={{
                        color: 'var(--primary)',
                        textAlign: 'center',
                        gridColumn: '1 / -1',
                        padding: '2rem',
                    }}
                >
                    Loading rooms...
                </div>
            );
        }

        if (filteredRooms.length === 0) {
            return (
                <div
                    style={{
                        color: 'var(--muted)',
                        textAlign: 'center',
                        gridColumn: '1 / -1',
                        padding: '2rem',
                    }}
                >
                    No rooms found, buuuut u can fix that, create first one
                </div>
            );
        }

        return filteredRooms.map((room: RoomDetails) => <RoomCard key={room.id} room={room} />);
    };

    return (
        <div className={clsx(styles.layout, isGlitching && styles.glitch)}>
            <header className={styles.header}>
                <div className={styles.toggleContainer}>
                    <button
                        className={clsx(
                            styles.toggleBtn,
                            roomType === 'public' && styles.activeToggle,
                        )}
                        onClick={() => setRoomType('public')}
                    >
                        Public
                    </button>
                    <button
                        className={clsx(
                            styles.toggleBtn,
                            roomType === 'private' && styles.activeToggle,
                        )}
                        onClick={() => setRoomType('private')}
                    >
                        Private
                    </button>
                </div>

                <h1 className={styles.logo}>CHATIX</h1>

                <div className={styles.headerRight}>
                    <button
                        type="button"
                        className={styles.shopLink}
                        onClick={() => navigate(PATH.shop.shop)}
                    >
                        laryok shop
                    </button>
                    <button
                        type="button"
                        className={styles.shopLink}
                        onClick={() => navigate(PATH.economy.leaderboard)}
                    >
                        leaderboard
                    </button>
                    <button
                        className={styles.profileBtn}
                        aria-label="Profile"
                        onClick={handleGoToMyProfile}
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                </div>
            </header>

            <img src={bannerPng} alt="Chatix Banner" className={styles.banner} />

            <main className={styles.mainContent}>
                <h2 className={styles.subtitle}>if u in debt or just a chud ts for you</h2>
                {token && <MyRooms />}

                <div className={styles.actionContainer}>
                    <button className={styles.addBtn} onClick={() => setIsCreateModalOpen(true)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fa4d98"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus-icon lucide-plus"
                        >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    </button>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                const query = e.target.value;
                                setSearchQuery(query);
                                if (isSecretQuery(query)) triggerEasterEgg('first_rule');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleBackendSearch()}
                        />
                        <span
                            className={styles.searchLmao}
                            aria-hidden="true"
                            onClick={() =>
                                tripleClick.current(Date.now()) &&
                                triggerEasterEgg('found_the_basement')
                            }
                        >
                            lmao
                        </span>
                        <button
                            className={styles.searchBtn}
                            onClick={handleBackendSearch}
                            disabled={searchRoomByName.isPending}
                        >
                            {searchRoomByName.isPending ? 'searching...' : 'join'}
                        </button>
                    </div>
                </div>

                <div className={styles.grid}>{renderGridContent()}</div>
            </main>

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.rooms() })}
            />
        </div>
    );
};
