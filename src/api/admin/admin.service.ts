import { api } from "../client.ts";
import type {UpdateModifiersPayload} from "./types.ts";

export const adminApi = {
    vaporizeUser: async (userId: string) => {
        const response = await api.delete(`/admin/users/${userId}/vaporize`);
        return response;
    },

    updateModifier: async (userId: string, data: UpdateModifiersPayload) => {
        const response = await api.patch(`/admin/users/${userId}/modifiers`, data);
        return response;
    },

    deleteMessage: async (messageId: string) => {
        const response = await api.delete(`/admin/messages/${messageId}`);
        return response;
    },

    addWarning: async (userId: string, reason: string) => {
        const response = await api.post(`/admin/users/${userId}/warnings`, { reason });
        return response;
    },

    revokeWarning: async (userId: string, warningId: string) => {
        const response = await api.delete(`/admin/users/${userId}/warnings/${warningId}`);
        return response;
    },
}