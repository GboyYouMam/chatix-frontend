import { api } from "../client.ts";
import type {CreateRoomDTO} from "./types.ts";

export const roomApi = {
    getRooms: async (publicity?: 'public' | 'private') => {
        const response = await api.get('/rooms', { params: { publicity } });
        return response.data;
    },

    getRoomDetailed: async (roommId: string) => {
        const response = await api.get(`/rooms/${roommId}`);
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
    }
}

