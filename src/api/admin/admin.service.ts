import { api } from '../client.ts';
import type { UpdateModifiersPayload } from './types.ts';

export const adminApi = {
    getUser: async <T>(userId: string): Promise<T> =>
        (await api.get<T>(`/admin/users/${userId}`)).data,

    getRoom: async <T>(roomId: string): Promise<T> =>
        (await api.get<T>(`/admin/rooms/${roomId}`)).data,

    vaporizeUser: async (userId: string) =>
        (await api.delete(`/admin/users/${userId}/vaporize`)).data,

    updateModifier: (userId: string, data: UpdateModifiersPayload) =>
        api.patch(`/admin/users/${userId}/modifiers`, data).then((response) => response.data),

    deleteMessage: async (messageId: string) =>
        (await api.delete(`/admin/messages/${messageId}`)).data,

    addWarning: (userId: string, reason: string) =>
        api.post(`/admin/users/${userId}/warnings`, { reason }).then((response) => response.data),

    revokeWarning: (userId: string, warningId: string) =>
        api
            .delete(`/admin/users/${userId}/warnings/${warningId}`)
            .then((response) => response.data),
};
