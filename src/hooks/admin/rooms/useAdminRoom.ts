import { useQuery } from '@tanstack/react-query';
import type { AdminRoom } from '../../../api/admin/types.ts';
import { adminApi } from '../../../api/admin/admin.service.ts';
import { adminKeys } from '../adminKeys.ts';

export const useAdminRoom = (roomId?: string) => {
    const roomQuery = useQuery({
        queryKey: adminKeys.room(roomId),
        queryFn: () => adminApi.getRoom<AdminRoom>(roomId!),
        enabled: Boolean(roomId),
        staleTime: 10_000,
    });

    return {
        room: roomQuery.data ?? null,
        isLoading: roomQuery.isLoading,
        isFetching: roomQuery.isFetching,
        isError: roomQuery.isError,
    };
};
