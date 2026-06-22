import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../../api/rooms/rooms.service';
import type { RoomDetails } from '../../api/rooms/types.ts';
import { CreateRoomModal } from '../../components/rooms/CreateRoomModal.tsx';
import clsx from 'clsx';
import styles from './Rooms.module.css';
import bannerPng from '../../assets/banner.png';
import { useNavigate} from "react-router-dom";
import {useAuthStore} from "../../store/authStore.ts";
import {useRooms} from "../../hooks/useRooms.ts";
import {RoomCard} from "../../components/rooms/RoomCard.tsx";

export const Rooms = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { searchRoomByName } = useRooms();

    const [roomType, setRoomType] = useState<'public' | 'private'>('public');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: rooms, isLoading, refetch } = useQuery({
        queryKey: ['rooms', roomType],
        queryFn: () => roomApi.getRooms(roomType),
    });

    const filteredRooms = rooms?.filter((room: RoomDetails) =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.topic?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleGoToMyProfile = () => {
        if (user && user.username) {
            navigate(`/profile/${user.username}`);
        } else {
            navigate('/login');
        }
    };

    const handleBackendSearch = () => {
        if (!searchQuery.trim()) return;
        searchRoomByName.mutate(searchQuery);
    };

    const renderGridContent = () => {
        if (isLoading) {
            return (
                <div style={{ color: 'var(--primary)', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                    Loading rooms...
                </div>
            );
        }

        if (filteredRooms.length === 0) {
            return (
                <div style={{ color: 'var(--muted)', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                    No rooms found, buuuut u can fix that, create first one
                </div>
            );
        }

        return filteredRooms.map((room: RoomDetails) => (
            <RoomCard key={room.id} room={room} />
        ));
    };

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.toggleContainer}>
                    <button
                        className={clsx(styles.toggleBtn, roomType === 'public' && styles.activeToggle)}
                        onClick={() => setRoomType('public')}
                    >
                        Public
                    </button>
                    <button
                        className={clsx(styles.toggleBtn, roomType === 'private' && styles.activeToggle)}
                        onClick={() => setRoomType('private')}
                    >
                        Private
                    </button>
                </div>

                <h1 className={styles.logo}>CHATIX</h1>

                <button
                    className={styles.profileBtn}
                    aria-label="Profile"
                    onClick={handleGoToMyProfile}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
            </header>

            <img
                src={bannerPng}
                alt="Chatix Banner"
                className={styles.banner}
            />

            <main className={styles.mainContent}>
                <h2 className={styles.subtitle}>if u in debt or just a chud ts for you</h2>

                <div className={styles.actionContainer}>
                    <button className={styles.addBtn} onClick={() => setIsCreateModalOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fa4d98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-icon lucide-plus">
                            <path d="M5 12h14"/><path d="M12 5v14"/>
                        </svg>
                    </button>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="find your place"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleBackendSearch()} // Пошук на Enter
                        />
                        <span className={styles.searchLmao}>lmao</span>
                        <button
                            className={styles.searchBtn}
                            onClick={handleBackendSearch}
                            disabled={searchRoomByName.isPending}
                        >
                            {searchRoomByName.isPending ? 'searching...' : 'search'}
                        </button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {renderGridContent()}
                </div>
            </main>

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => refetch()}
            />
        </div>
    );
};
