import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.ts';
import { notify } from '../../lib/toast.ts';
import { queryClient } from '../../lib/queryClient.ts';
import { useAuthStore } from '../../store/authStore.ts';
import {
    APPEAL_DENIALS,
    BAN_TAUNTS,
    formatCountdown,
    getBanCountdown,
    pickNext,
} from '../../utils/banScreen.ts';
import { PATH } from '../../utils/pathList.ts';
import styles from './Banned.module.css';

const initialNow = Date.now();
const marqueeText = BAN_TAUNTS.join('  ✦  ');

export function Banned() {
    const ban = useAuthStore((state) => state.ban);
    const logout = useAuthStore((state) => state.logout);
    const clearBan = useAuthStore((state) => state.clearBan);
    const navigate = useNavigate();
    const [now, setNow] = useState(initialNow);
    const [taunt, setTaunt] = useState<string>(BAN_TAUNTS[0]);
    const [appealNotice, setAppealNotice] = useState('');

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const id = window.setInterval(
            () => setTaunt((current) => pickNext(BAN_TAUNTS, current)),
            4000,
        );
        return () => clearInterval(id);
    }, []);

    const countdown = getBanCountdown(ban?.bannedUntil ?? null, now);
    const handleLogout = () => {
        logout();
        clearBan();
        queryClient.clear();
        navigate(PATH.authAndUser.login);
    };

    const retry = async () => {
        try {
            await api.get('/users/me');
            clearBan();
            navigate(PATH.rooms.rooms);
        } catch {
            if (useAuthStore.getState().ban) notify.error('still cooked.');
        }
    };

    const showAppealDenial = () => {
        setAppealNotice((current) => pickNext(APPEAL_DENIALS, current));
    };

    return (
        <main className={styles.page}>
            <div className={styles.scanLines} aria-hidden="true" />
            <div className={styles.content}>
                <p className={styles.eyebrow}>moderation department // final decision</p>
                <h1 className={styles.title}>U GOT COOKED</h1>
                <p className={styles.intro}>your account has been sent to the shadow realm.</p>

                <section className={styles.reason} aria-labelledby="ban-reason-title">
                    <h2 id="ban-reason-title">official reason</h2>
                    <p>{ban?.banReason ?? 'no reason. the mods just felt like it.'}</p>
                </section>

                <section className={styles.countdownPanel} aria-live="polite">
                    <span className={styles.panelLabel}>time left on the bench</span>
                    <strong className={styles.countdown}>
                        {countdown.permanent ? 'permanently cooked' : formatCountdown(countdown)}
                    </strong>
                </section>

                <p key={taunt} className={styles.taunt} aria-live="polite">
                    “{taunt}”
                </p>

                <div className={styles.actions}>
                    <div className={styles.appealAction}>
                        <button className={styles.appealButton} onClick={showAppealDenial}>
                            appeal
                        </button>
                        <span className={styles.appealNotice} aria-live="polite">
                            {appealNotice}
                        </span>
                    </div>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        logout
                    </button>
                    {countdown.expired && (
                        <button className={styles.retryButton} onClick={retry}>
                            try again, bum
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.marquee} aria-label={marqueeText}>
                <div className={styles.marqueeTrack} aria-hidden="true">
                    <span>{marqueeText}</span>
                    <span>{marqueeText}</span>
                </div>
            </div>
        </main>
    );
}
