import { api } from '../client.ts';

export const messagesApi = {
    getHistory: async (roomId: string) => (await api.get(`/messages/${roomId}`)).data,

    sendMessage: async (data: { roomId: string; cipherText: string }) =>
        (await api.post('/messages', data)).data,
};
