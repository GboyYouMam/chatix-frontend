import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import styles from './Room.module.css';

export const JoinRoom = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isHacking, setIsHacking] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;

        setIsHacking(true);
        try {
            await api.post(`/rooms/${id}/join`, { password });
            toast.success('ACCESS GRANTED.');

            navigate(`/room/${id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Access Denied.');
        } finally {
            setIsHacking(false);
        }
    };

    return (
        <div className={styles.layout} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className={styles.replyBlock} style={{ width: '400px', textAlign: 'center', padding: '2rem' }}>
                <h1 className={styles.boardTitle} style={{ marginBottom: '1rem' }}>RESTRICTED AREA</h1>
                <p style={{ color: '#888', marginBottom: '2rem' }}>
                    This room is private, like and ISLAND of someone extremely RICH.
                </p>

                <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        className={styles.replyInput}
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ height: '45px', textAlign: 'center', letterSpacing: '3px' }}
                    />
                    <button type="submit" className={styles.submitBtn} disabled={isHacking}>
                        {isHacking ? 'BYPASSING...' : 'INITIALIZE CONNECTION'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/')}
                    className={styles.backBtn}
                    style={{ marginTop: '2rem', display: 'block', width: '100%' }}
                >
                    {'<< ABORT AND RETURN'}
                </button>
            </div>
        </div>
    );
};