import { api } from '../client.ts';
import type { CreateRoomDTO } from './types.ts';
import type { AdminRoomStatus } from '../admin/types.ts';

export const roomApi = {
    getRooms: async (publicity?: 'public' | 'private') =>
        (await api.get('/rooms', { params: { publicity } })).data,

    getRoomDetailed: async <T = any>(roomId: string): Promise<T> =>
        (await api.get<T>(`/rooms/${roomId}`)).data,

    createRoom: async (data: CreateRoomDTO) => (await api.post('/rooms', data)).data,

    updateRoom: async (roomId: string, data: Partial<CreateRoomDTO>) =>
        (await api.patch(`/rooms/${roomId}`, data)).data,

    deleteRoom: async (roomId: string) => (await api.delete(`/rooms/${roomId}`)).data,

    findRoomByName: async (roomName: string) => (await api.get(`/rooms/by-name/${roomName}`)).data,

    qurantineRoom: async (roomId: string, reason: string) =>
        (await api.patch(`/admin/rooms/${roomId}/quarantine`, { reason })).data,

    unquarantineRoom: async (roomId: string) =>
        (await api.patch(`/admin/rooms/${roomId}/unquarantine`)).data,

    patchRoomStatus: async (roomId: string, status: AdminRoomStatus) =>
        (await api.patch(`/rooms/${roomId}/status`, { status })).data,

    joinRoom: async (roomId: string, password: string) =>
        (await api.patch(`/rooms/${roomId}/join`, { password })).data,
};
