import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { getBanCountdown } from '../utils/banScreen.ts';
import { PATH } from '../utils/pathList.ts';

const initialNow = Date.now();

export function BanGate() {
    const [now, setNow] = useState(initialNow);
    useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
    const ban = useAuthStore((state) => state.ban);
    const location = useLocation();
    const active = ban && (ban.bannedUntil === null || !getBanCountdown(ban.bannedUntil, now).expired);
    if (location.pathname === PATH.root.banned) return active ? <Outlet /> : <Navigate to={PATH.rooms.rooms} replace />;
    return active ? <Navigate to={PATH.root.banned} replace /> : <Outlet />;
}
