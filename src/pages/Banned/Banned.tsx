import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.ts';
import { notify } from '../../lib/toast.ts';
import { queryClient } from '../../lib/queryClient.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { APPEAL_DENIALS, BAN_TAUNTS, formatCountdown, getBanCountdown, pickNext } from '../../utils/banScreen.ts';
import { PATH } from '../../utils/pathList.ts';
import styles from './Banned.module.css';

export function Banned() {
    const ban = useAuthStore((state) => state.ban);
    const logout = useAuthStore((state) => state.logout);
    const clearBan = useAuthStore((state) => state.clearBan);
    const navigate = useNavigate();
    const [now, setNow] = useState(0);
    const [taunt, setTaunt] = useState<string>(BAN_TAUNTS[0]);
    const [appeal, setAppeal] = useState<string>(APPEAL_DENIALS[0]);
    useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
    useEffect(() => { const id = window.setInterval(() => setTaunt((old) => pickNext(BAN_TAUNTS, old)), 4000); return () => clearInterval(id); }, []);
    const countdown = getBanCountdown(ban?.bannedUntil ?? null, now);
    const handleLogout = () => { logout(); clearBan(); queryClient.clear(); navigate(PATH.authAndUser.login); };
    const retry = async () => { try { await api.get('/users/me'); clearBan(); navigate(PATH.rooms.rooms); } catch { if (useAuthStore.getState().ban) notify.error('still cooked.'); } };
    return <main className={styles.page}><p>session status: permanently unserious</p><h1 className={styles.title}>U GOT COOKED</h1><p>{ban?.banReason ?? 'no reason. the mods just felt like it.'}</p><div className={styles.count}>{countdown.permanent ? 'permanently cooked' : formatCountdown(countdown)}</div><p>{taunt}</p><div className={styles.marquee}>{[...BAN_TAUNTS, ...BAN_TAUNTS].join('  ✦  ')}</div><div className={styles.actions}><button onClick={() => setAppeal((old) => pickNext(APPEAL_DENIALS, old))}>{appeal}</button><button onClick={handleLogout}>logout</button>{countdown.expired && <button onClick={retry}>try again, bum</button>}</div></main>;
}
