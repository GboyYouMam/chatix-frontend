import { api } from '../client.ts';
import type { MessagePage } from './types.ts';

export const messagesApi = {
    getMessages: async (
        roomId: string,
        params?: { before?: string; limit?: number },
    ): Promise<MessagePage> => (await api.get(`/messages/${roomId}`, { params })).data,

    sendMessage: async (data: { roomId: string; cipherText: string; attachments?: File[] }) => {
        const formData = new FormData();
        formData.append('roomId', data.roomId);
        formData.append('cipherText', data.cipherText);
        data.attachments?.forEach((file) => formData.append('attachments', file));

        return (
            await api.post('/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        ).data;
    },
};
