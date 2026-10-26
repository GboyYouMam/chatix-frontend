import { useEffect, useRef, useState } from 'react';
import { type Socket } from 'socket.io-client';
import { createSocket } from '../../lib/socket.ts';
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

        const socket = createSocket('/admin');

        socketRef.current = socket;

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
