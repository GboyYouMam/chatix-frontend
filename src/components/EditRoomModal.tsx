import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom'; // ДОДАЛИ ІМПОРТ
import { roomApi } from '../api/rooms/rooms.service.ts';
import toast from 'react-hot-toast';
import styles from './CreateRoomModal.module.css';

const updateRoomSchema = z.object({
    title: z.string().min(3, 'Title is def what u NEED TO CREATE A FUCIN ROOM').max(255, 'son'),
    topic: z.string().max(255).optional(),
    description: z.string().optional(),
    publicity: z.enum(['public', 'private']),
});

type updateRoomValues = z.infer<typeof updateRoomSchema>;

interface updateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    roomId: string;
    initialData: {
        title: string;
        topic?: string;
        description?: string;
        publicity: 'public' | 'private';
    };
}

export const UpdateRoomModal = ({ isOpen, onClose, onSuccess, roomId, initialData }: updateRoomModalProps) => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<updateRoomValues>({
        resolver: zodResolver(updateRoomSchema),
        values: {
            title: initialData?.title || '',
            topic: initialData?.topic || '',
            description: initialData?.description || '',
            publicity: initialData?.publicity || 'public',
        },
    });

    const onSubmit = async (data: updateRoomValues) => {
        try {
            await roomApi.updateRoom(roomId, data);
            toast.success('Room updated successfully');
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'nah something went wrong.');
        }
    }

    const handleDeleteRoom = async () => {
        const isSure = window.confirm("Are u sure u want to NUKE this room? This action is irreversible.");
        if (!isSure) return;

        try {
            await roomApi.deleteRoom(roomId);
            toast.success('Room ERASED by KILLSQUAD.');
            onClose();
            navigate('/rooms');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to nuke room.');
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>

                <h2 className={styles.title}>UPDATE ROOM [ID: {roomId.slice(-6)}]</h2>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Title *</label>
                        <input {...register('title')} placeholder="Room title..." />
                        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Topic</label>
                        <input {...register('topic')} placeholder="What are we yapping about?" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <textarea {...register('description')} rows={3} placeholder="Lore goes here..." />
                    </div>

                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input type="radio" value="public" {...register('publicity')} />
                            <span className={styles.radioText}>Public</span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input type="radio" value="private" {...register('publicity')} />
                            <span className={styles.radioText}>Private</span>
                        </label>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update This Shi'}
                    </button>

                    <div className={styles.dangerZone}>
                        <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={handleDeleteRoom}
                            disabled={isSubmitting}
                        >
                            DELETE ROOM
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}