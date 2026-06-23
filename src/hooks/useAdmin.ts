import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/client';

export const useAdmin = () => {
    const queryClient = useQueryClient();

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: () => api.get('/admin/users').then(res => res.data),
    });

    const { data: rooms, isLoading: roomsLoading } = useQuery({
        queryKey: ['admin', 'rooms'],
        queryFn: () => api.get('/admin/rooms').then(res => res.data),
    });

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['admin', 'messages'],
        queryFn: () => api.get('/admin/messages').then(res => res.data),
    });

    const vaporizeUser = useMutation({
        mutationFn: (userId: string) => api.delete(`/admin/users/${userId}/vaporize`),
        onSuccess: () => {
            toast.success('USER VAPORIZED. KILLSQUAD APPROVES.');
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to vaporize'),
    });

    const updateModifiers = useMutation({
        mutationFn: ({ userId, data }: { userId: string, data: any }) =>
            api.patch(`/admin/users/${userId}/modifiers`, data),
        onSuccess: () => {
            toast.success('MODIFIERS UPDATED. TOTAL DOMINATION.');
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
    });

    const updateRoomStatus = useMutation({
        mutationFn: ({ roomId, status }: { roomId: string, status: 'active' | 'checkout' | 'banned' | 'quarantined' }) =>
            api.patch(`/rooms/${roomId}/status`, { status }),
        onSuccess: () => {
            toast.success('ROOM STATUS OVERRIDDEN.');
            queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Status change failed'),
    });

    const deleteMessage = useMutation({
        mutationFn: (messageId: string) =>
            api.delete(`/messages/${messageId}`),
        onSuccess: () => {
            toast.success('MESSAGE ERASED FROM EXISTENCE.');
            queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
    });

    return {
        users, rooms, messages,
        isLoading: usersLoading || roomsLoading || messagesLoading,
        vaporizeUser, updateModifiers, updateRoomStatus, deleteMessage
    };
};