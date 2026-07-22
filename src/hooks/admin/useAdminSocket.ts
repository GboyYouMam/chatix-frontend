import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { AdminAuditLog } from '../../api/admin/types.ts';
import { useAuthStore } from '../../store/authStore.ts';

export const useAdminSocket = () => {
    const token = useAuthStore((state) => state.token);
    const socketRef = useRef<Socket | null>(null);
    const [logs, setLogs] = useState<AdminAuditLog[]>([]);

    useEffect(() => {
        if (!token) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const socket = io(import.meta.env.VITE_API_URL, {
            auth: {
                token: `Bearer ${token}`,
            },
        });

        socketRef.current = socket;
        socket.emit('joinAdminLogs');

        socket.on('newAdminLog', (log: AdminAuditLog) => {
            setLogs((prevLogs) => {
                const deduped = prevLogs.filter((entry) => entry.id !== log.id);
                return [log, ...deduped].slice(0, 100);
            });
        });

        return () => {
            socket.disconnect();
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [token]);

    return { logs: token ? logs : [] };
};
