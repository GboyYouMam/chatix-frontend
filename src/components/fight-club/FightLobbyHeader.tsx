import { memo } from 'react';
import type { User } from '../../api/auth/types.ts';
import styles from '../../pages/Fight-Club/Lobby.module.css';

interface FightLobbyHeaderProps {
    user: User | null;
    onCreate: () => void;
    onRooms: () => void;
}
export const FightLobbyHeader = memo(({ user, onCreate, onRooms }: FightLobbyHeaderProps) => (
    <header className={styles.header}>
        <div>
            <p className={styles.eyebrow}>made this shi for ur fun</p>
            <h1 className={styles.logo}>FIGHT CLUB</h1>
        </div>

        <div className={styles.headerControls}>
            <div className={styles.stats}>
                <span>AURA {user?.aura ?? 0}</span>
                <span className={styles.debtStat}>DEBT {user?.debt ?? 0}</span>
            </div>
            <button className={styles.primaryBtn} onClick={onCreate}>
                start smoke
            </button>
            <button className={styles.roomsBtn} onClick={onRooms}>
                BACK TO THE CHADS
            </button>
        </div>
    </header>
));
