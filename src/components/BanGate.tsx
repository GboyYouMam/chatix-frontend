import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { PATH } from '../utils/pathList.ts';
import { useEffect, useRef } from 'react';
import { notify } from '../lib/toast.ts';
import { RARE_HINTS, shouldShowRareHint } from '../utils/fightHints.ts';

export function BanGate() {
    const ban = useAuthStore((state) => state.ban);
    const location = useLocation();
    const previousLocation = useRef(location.key);
    useEffect(() => {
        if (previousLocation.current === location.key) return;
        previousLocation.current = location.key;
        const storageKey = 'chatix-rare-hint';
        const lastShownAt = Number(localStorage.getItem(storageKey)) || null;
        const now = Date.now();
        if (shouldShowRareHint(now, lastShownAt, Math.random())) {
            localStorage.setItem(storageKey, String(now));
            notify.info(RARE_HINTS[Math.floor(Math.random() * RARE_HINTS.length)]);
        }
    }, [location.key]);
    if (location.pathname === PATH.root.banned) {
        return ban ? <Outlet /> : <Navigate to={PATH.rooms.rooms} replace />;
    }

    return ban ? <Navigate to={PATH.root.banned} replace /> : <Outlet />;
}
