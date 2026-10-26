import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.ts';
import type { AdminStats } from '../../api/admin/types.ts';
import type { AdminRoom, PaginatedResponse } from '../../api/admin/types.ts';

export function useAdminStats() {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => (await api.get<AdminStats>('/admin/stats')).data,
        staleTime: 15_000,
    });
}

export function useModerationQueue() {
    return useQuery({
        queryKey: ['admin', 'rooms', 'queue'],
        queryFn: async () =>
            (
                await api.get<PaginatedResponse<AdminRoom>>('/admin/rooms', {
                    params: { status: 'checkout', page: 1, limit: 50 },
                })
            ).data.items,
        staleTime: 10_000,
    });
}
