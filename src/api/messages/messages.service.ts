import { api } from '../client.ts'

export const messagesApi = {
    getHistory: async (roomId: string) => {
        const response = await api.get(`/messages/${roomId}`)
        return response.data
    },

    sendMessage: async (data: { roomId: string; cipherText: string }) => {
        const response = await api.post('/messages', data);
        return response.data;
    }
}