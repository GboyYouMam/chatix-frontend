import { useState } from 'react';
import clsx from 'clsx';
import styles from './Rooms.module.css';
import bannerPng from '../../assets/banner.png';
import { useNavigate} from "react-router-dom";
import {useAuthStore} from "../../store/authStore.ts";

const MOCK_ROOMS = [
    {
        id: '1',
        title: 'Title',
        topic: 'topic',
        description: 'description larping etc just filling it for test-design lmao',
        createdAt: '12/12/2000 12:12',
        updatedAt: '12/12/2000 12:12',
    },
    {
        id: '2',
        title: 'Title',
        topic: 'topic',
        description: 'description larping etc just filling it for test-design lmao',
        createdAt: '12/12/2000 12:12',
        updatedAt: '12/12/2000 12:12',
    },
    {
        id: '3',
        title: 'Title',
        topic: 'topic',
        description: 'description larping etc just filling it for test-design lmao',
        createdAt: '12/12/2000 12:12',
        updatedAt: '12/12/2000 12:12',
    },
    {
        id: '4',
        title: 'Title',
        topic: 'topic',
        description: 'description larping etc just filling it for test-design lmao',
        createdAt: '12/12/2000 12:12',
        updatedAt: '12/12/2000 12:12',
    },
    {
        id: '5',
        title: 'Title',
        topic: 'topic',
        description: 'description larping etc just filling it for test-design lmao',
        createdAt: '12/12/2000 12:12',
        updatedAt: '12/12/2000 12:12',
    },
    {
        id: '6',
        title: 'Title',
        topic: 'topic',
        description: 'description larping etc just filling it for test-design lmao',
        createdAt: '12/12/2000 12:12',
        updatedAt: '12/12/2000 12:12',
    },
    {
        id: '7',
        title: 'Title',
        topic: 'topic',
        description: 'description larping etc just filling it for test-design lmao',
        createdAt: '12/12/2000 12:12',
        updatedAt: '12/12/2000 12:12',
    },
];

export const Rooms = () => {
    const [roomType, setRoomType] = useState<'public' | 'private'>('public');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const { user } = useAuthStore();
    const handleGoToMyProfile = () => {
        if (user && user.username) {
            navigate(`/profile/${user.username}`);
        } else {
            navigate('/login');
        }
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
                    onClick={() => handleGoToMyProfile()}
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

            {/* MAIN CONTENT */}
            <main className={styles.mainContent}>
                <h2 className={styles.subtitle}>if u in debt or just a chud ts for you</h2>

                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="find your place"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className={styles.searchLmao}>lmao</span>
                    <button className={styles.searchBtn}>search</button>
                </div>

                <div className={styles.grid}>
                    {MOCK_ROOMS.map((room) => (
                        <div key={room.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardDate}>created at: {room.createdAt}</span>
                            </div>

                            <h3 className={styles.cardTitle}>{room.title}</h3>
                            <p className={styles.cardTopic}>{room.topic}</p>
                            <p className={styles.cardDesc}>{room.description}</p>

                            <div className={styles.cardFooter}>
                                <a className={styles.cardCta}>join this convo and mog them all</a>
                                <span className={styles.cardDate}>updated at: {room.updatedAt}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};