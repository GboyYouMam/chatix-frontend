import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { PATH } from '../utils/pathList.ts';

export function BanGate() {
    const ban = useAuthStore((state) => state.ban);
    const location = useLocation();
    if (location.pathname === PATH.root.banned) {
        return ban ? <Outlet /> : <Navigate to={PATH.rooms.rooms} replace />;
    }

    return ban ? <Navigate to={PATH.root.banned} replace /> : <Outlet />;
}
