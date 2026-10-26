import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notify } from '../../lib/toast';
import styles from './Room.module.css';
import { PATH } from '../../utils/pathList.ts';
import { useRooms } from '../../hooks/rooms/useRooms.ts';

export const JoinRoom = () => {
    const { id } = useParams<{ id: string }>();
    const { joinRoom } = useRooms();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isHacking, setIsHacking] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!password.trim()) return;

        setIsHacking(true);
        try {
            await joinRoom.mutateAsync({
                roomId: id,
                password: password,
            });
            notify.success('ACCESS GRANTED.');

            navigate(PATH.rooms.href.room(id));
        } catch (error) {
            notify.error(error);
        } finally {
            setIsHacking(false);
        }
    };

    return (
        <div className={styles.layout}>
            <div className={styles.joinCard}>
                <h1 className={styles.boardTitle}>restricted area</h1>
                <p>this room is private, like an island owned by someone extremely rich.</p>

                <form onSubmit={handleJoin} className={styles.joinForm}>
                    <input
                        type="password"
                        className={`${styles.replyInput} ${styles.joinInput}`}
                        placeholder="enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className={styles.submitBtn} disabled={isHacking}>
                        {isHacking ? 'bypassing...' : 'initialize connection'}
                    </button>
                </form>

                <button
                    onClick={() => navigate(PATH.root.home)}
                    className={`${styles.backBtn} ${styles.joinBack}`}
                >
                    {'← abort and return'}
                </button>
            </div>
        </div>
    );
};
