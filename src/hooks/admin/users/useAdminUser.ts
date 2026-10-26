import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminUser, UpdateModifiersPayload } from '../../../api/admin/types.ts';
import { notify } from '../../../lib/toast.ts';
import { adminApi } from '../../../api/admin/admin.service.ts';
import { adminKeys } from '../adminKeys.ts';
import { getErrorMessage } from '../../../utils/adminQueryUtils.ts';

export const useAdminUser = (userId?: string) => {
    const queryClient = useQueryClient();
    const userQuery = useQuery({
        queryKey: adminKeys.user(userId),
        queryFn: () => adminApi.getUser<AdminUser>(userId!),
        enabled: Boolean(userId),
        staleTime: 10_000,
    });

    const updateModifiers = useMutation({
        mutationFn: (data: UpdateModifiersPayload) => adminApi.updateModifier(userId!, data),
        onSuccess: async (user) => {
            notify.success('user updated.');
            queryClient.setQueryData(adminKeys.user(userId), user);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'list'] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] }),
            ]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'could not update user')),
    });

    const vaporizeUser = useMutation({
        mutationFn: () => adminApi.vaporizeUser(userId!),
        onSuccess: async () => {
            notify.success('user vaporized.');
            queryClient.removeQueries({ queryKey: adminKeys.user(userId) });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'list'] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] }),
            ]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'could not vaporize user')),
    });

    return {
        user: userQuery.data ?? null,
        isLoading: userQuery.isLoading,
        isFetching: userQuery.isFetching,
        isError: userQuery.isError,
        updateModifiers,
        vaporizeUser,
    };
};
