import { useEffect, useRef } from 'react';
import { type Socket } from 'socket.io-client';
import { createSocket } from '../../lib/socket.ts';
import { useQueryClient } from '@tanstack/react-query';
import type { AdminAuditLog, AdminRoom, AdminUser } from '../../api/admin/types.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { adminKeys } from './adminKeys.ts';

export const useAdminSocket = () => {
    const token = useAuthStore((state) => state.token);
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!token) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const socket = createSocket('/admin');

        socketRef.current = socket;

        const invalidate = (key: readonly unknown[]) =>
            queryClient.invalidateQueries({ queryKey: key });
        socket.on('admin:user_updated', ({ user, id }: { user: AdminUser | null; id?: string }) => {
            const userId = user?.id ?? id;
            if (userId && user) queryClient.setQueryData(adminKeys.user(userId), user);
            if (userId && !user) queryClient.removeQueries({ queryKey: adminKeys.user(userId) });
            void invalidate(['admin', 'users', 'list']);
        });
        socket.on('admin:room_updated', ({ room }: { room: AdminRoom }) => {
            queryClient.setQueryData(adminKeys.room(room.id), room);
            void invalidate(['admin', 'rooms', 'list']);
        });
        socket.on('admin:message_deleted', () => void invalidate(['admin', 'messages', 'list']));
        socket.on('newAdminLog', (log: AdminAuditLog) => {
            for (const [key, data] of queryClient.getQueriesData<{
                items: AdminAuditLog[];
                pagination: { total: number; limit: number };
            }>({ queryKey: ['admin', 'audit-logs', 'list'] })) {
                if ((key[3] as { page?: number } | undefined)?.page !== 1 || !data) continue;
                queryClient.setQueryData(key, {
                    ...data,
                    items: [log, ...data.items.filter((item) => item.id !== log.id)].slice(
                        0,
                        data.pagination.limit,
                    ),
                    pagination: { ...data.pagination, total: data.pagination.total + 1 },
                });
            }
        });

        return () => {
            socket.disconnect();
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [token, queryClient]);

    return undefined;
};
