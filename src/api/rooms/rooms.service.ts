import { api } from "../client.ts";
export interface CreateRoomReq {
    title: string;
    topic?: string;
    description?: string;
    publicity?: string;
}

export const roomApi = {
    getRooms: async (publicity?: 'public' | 'private') => {
        const response = await api.get('/rooms', { params: { publicity } });
        return response.data;
    },

    getRoomDetailed: async (roommId: string) => {
        const response = await api.get(`/rooms/${roommId}`);
        return response.data;
    },

    createRoom: async (data: CreateRoomReq) => {
        const response = await api.post('/rooms', data);
        return response.data;
    },

    updateRoom: async (roomId: string, data: Partial<CreateRoomReq>) => {
        const response = await api.patch(`/rooms/${roomId}`, data);
        return response.data;
    },

    deleteRoom: async (roomId: string) => {
        const response = await api.delete(`/rooms/${roomId}`);
        return response.data;
    }
}

