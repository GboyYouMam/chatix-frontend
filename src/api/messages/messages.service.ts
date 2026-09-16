import { api } from '../client.ts';

export const messagesApi = {
    getHistory: async (roomId: string) => (await api.get(`/messages/${roomId}`)).data,

    sendMessage: async (data: { roomId: string; cipherText: string; attachments?: File[] }) => {
        const formData = new FormData();
        formData.append('roomId', data.roomId);
        formData.append('cipherText', data.cipherText);
        data.attachments?.forEach((file) => formData.append('attachments', file));

        return (await api.post('/messages', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })).data;
    },
};
