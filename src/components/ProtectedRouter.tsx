import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PATH } from '../utils/pathList.ts';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const sessionStatus = useAuthStore((state) => state.sessionStatus);

    if (sessionStatus !== 'ready') return <div>loading ur aura...</div>;

    if (!token) {
        return <Navigate to={PATH.authAndUser.login} replace />;
    }

    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to={PATH.rooms.rooms} replace />;
    }

    return <Outlet />;
};
