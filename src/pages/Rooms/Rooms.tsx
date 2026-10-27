import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/rooms/rooms.service';
import { CreateRoomModal } from '../../components/rooms/CreateRoomModal.tsx';
import clsx from 'clsx';
import styles from './Rooms.module.css';
import bannerPng from '../../assets/banner.png';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { useRooms } from '../../hooks/rooms/useRooms.ts';
import { RoomCard } from '../../components/rooms/RoomCard.tsx';
import { type RoomDetails } from '../../api/rooms/types.ts';
import { PATH } from '../../utils/pathList.ts';
import { createTripleClickDetector, isSecretQuery } from '../../utils/easterEgg.ts';
import { notify } from '../../lib/toast.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { achievementsApi } from '../../api/achievements/achievements.service.ts';
import { ProfileMenu } from '../../components/profile/ProfileMenu.tsx';
import { RoomFilterBar } from '../../components/rooms/RoomFilterBar.tsx';
import { AgeGateModal } from '../../components/rooms/AgeGate.tsx';
import { type RoomCategory } from '../../components/rooms/roomCategories.ts';
import {
    filterRooms,
    parseCategoryParam,
    readShowNsfw,
    writeShowNsfw,
} from '../../components/rooms/roomFilters.ts';

export const Rooms = () => {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const { searchRoomByName } = useRooms();

    const [roomType, setRoomType] = useState<'public' | 'private'>('public');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const category = parseCategoryParam(searchParams.get('cat'));
    // the saved preference only counts once the account has confirmed it is 18+
    const [showNsfwPref, setShowNsfwPref] = useState(readShowNsfw);
    const showNsfw = showNsfwPref && user?.ageConfirmed === true;
    const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
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

    const filteredRooms = useMemo(
        () => (rooms ? filterRooms(rooms, { query: searchQuery, category, showNsfw }) : []),
        [rooms, searchQuery, category, showNsfw],
    );

    const handleCategoryChange = (next: RoomCategory | null) => {
        setSearchParams(
            (prev) => {
                const params = new URLSearchParams(prev);
                if (next) params.set('cat', next);
                else params.delete('cat');
                return params;
            },
            { replace: true },
        );
    };

    const handleToggleNsfw = () => {
        if (showNsfw) {
            setShowNsfwPref(false);
            writeShowNsfw(false);
        } else if (user?.ageConfirmed === true) {
            setShowNsfwPref(true);
            writeShowNsfw(true);
        } else {
            setIsAgeGateOpen(true);
        }
    };

    const handleAgeConfirmed = () => {
        setIsAgeGateOpen(false);
        setShowNsfwPref(true);
        writeShowNsfw(true);
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
                    {category
                        ? `nothing in /${category}/ yet. be the main character, create one`
                        : 'No rooms found, buuuut u can fix that, create first one'}
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
                    <ProfileMenu />
                </div>
            </header>

            <img src={bannerPng} alt="Chatix Banner" className={styles.banner} />

            <main className={styles.mainContent}>
                <h2 className={styles.subtitle}>if u in debt or just a chud ts for you</h2>

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

                <RoomFilterBar
                    category={category}
                    onCategoryChange={handleCategoryChange}
                    showNsfw={showNsfw}
                    onToggleNsfw={handleToggleNsfw}
                />

                <div className={styles.grid}>{renderGridContent()}</div>
            </main>

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.rooms() })}
            />

            <AgeGateModal
                isOpen={isAgeGateOpen}
                onClose={() => setIsAgeGateOpen(false)}
                onConfirmed={handleAgeConfirmed}
            />
        </div>
    );
};
