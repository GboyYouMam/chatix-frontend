import { api } from '../client.ts';
import type { UpdateModifiersPayload } from './types.ts';

export const adminApi = {
    vaporizeUser: (userId: string) => api.delete(`/admin/users/${userId}/vaporize`),

    updateModifier: (userId: string, data: UpdateModifiersPayload) =>
        api.patch(`/admin/users/${userId}/modifiers`, data),

    deleteMessage: (messageId: string) => api.delete(`/admin/messages/${messageId}`),

    addWarning: (userId: string, reason: string) =>
        api.post(`/admin/users/${userId}/warnings`, { reason }),

    revokeWarning: (userId: string, warningId: string) =>
        api.delete(`/admin/users/${userId}/warnings/${warningId}`),
};
