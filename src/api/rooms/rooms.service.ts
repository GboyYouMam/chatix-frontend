import { api } from '../client.ts';
import type { CreateRoomDTO, RoomDetails } from './types.ts';
import type { AdminRoomStatus } from '../admin/types.ts';

export const roomApi = {
    getMyRooms: async (): Promise<RoomDetails[]> => (await api.get('/rooms/mine')).data,
    getRooms: async (publicity?: 'public' | 'private') =>
        (await api.get('/rooms', { params: { publicity } })).data,

    getRoomDetailed: async <T = RoomDetails>(roomId: string): Promise<T> =>
        (await api.get<T>(`/rooms/${encodeURIComponent(roomId)}`)).data,

    createRoom: async (data: CreateRoomDTO) => (await api.post('/rooms', data)).data,

    updateRoom: async (roomId: string, data: Partial<CreateRoomDTO>) =>
        (await api.patch(`/rooms/${encodeURIComponent(roomId)}`, data)).data,

    deleteRoom: async (roomId: string) =>
        (await api.delete(`/rooms/${encodeURIComponent(roomId)}`)).data,

    findRoomByName: async (roomName: string) =>
        (await api.get(`/rooms/by-name/${encodeURIComponent(roomName)}`)).data,

    qurantineRoom: async (roomId: string, reason: string) =>
        (await api.patch(`/admin/rooms/${encodeURIComponent(roomId)}/quarantine`, { reason })).data,

    unquarantineRoom: async (roomId: string) =>
        (await api.patch(`/admin/rooms/${encodeURIComponent(roomId)}/unquarantine`)).data,

    patchRoomStatus: async (roomId: string, status: AdminRoomStatus) =>
        (await api.patch(`/rooms/${encodeURIComponent(roomId)}/status`, { status })).data,

    joinRoom: async (roomId: string, password: string) =>
        (await api.patch(`/rooms/${encodeURIComponent(roomId)}/join`, { password })).data,
};
