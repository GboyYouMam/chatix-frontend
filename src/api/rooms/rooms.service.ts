import { api } from '../client.ts';
import type { CreateRoomDTO } from './types.ts';
import type { AdminRoomStatus } from '../admin/types.ts';

export const roomApi = {
    getRooms: async (publicity?: 'public' | 'private') => {
        const response = await api.get('/rooms', { params: { publicity } });
        return response.data;
    },

    getRoomDetailed: async <T = any>(roomId: string): Promise<T> => {
        const response = await api.get<T>(`/rooms/${roomId}`);
        return response.data;
    },

    createRoom: async (data: CreateRoomDTO) => {
        const response = await api.post('/rooms', data);
        return response.data;
    },

    updateRoom: async (roomId: string, data: Partial<CreateRoomDTO>) => {
        const response = await api.patch(`/rooms/${roomId}`, data);
        return response.data;
    },

    deleteRoom: async (roomId: string) => {
        const response = await api.delete(`/rooms/${roomId}`);
        return response.data;
    },

    findRoomByName: async (roomName: string) => {
        const repsonse = await api.get(`/rooms/by-name/${roomName}`);
        return repsonse;
    },

    qurantineRoom: async (roomId: string, reason: string) => {
        const response = await api.patch(`/admin/rooms/${roomId}/quarantine`, { reason });
        return response;
    },
    unquarantineRoom: async (roomId: string) => {
        const response = await api.patch(`/admin/rooms/${roomId}/unquarantine`);
        return response;
    },
    patchRoomStatus: async (roomId: string, status: AdminRoomStatus) => {
        const response = await api.patch(`/rooms/${roomId}/status`, { status });
        return response.data;
    },
    joinRoom: async (roomId: string, password: string) => {
        const response = await api.patch(`/rooms/${roomId}/join`, { password });
        return response;
    },
};
