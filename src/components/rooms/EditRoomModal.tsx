import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './CreateRoomModal.module.css';
import {useRooms} from "../../hooks/useRooms.ts";

const updateRoomSchema = z.object({
    title: z.string().min(3, 'Title is def what u NEED TO CREATE A FUCIN ROOM').max(255, 'son'),
    topic: z.string().max(255).optional(),
    description: z.string().optional(),
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
    };
}

export const UpdateRoomModal = ({ isOpen, onClose, onSuccess, roomId, initialData }: updateRoomModalProps) => {
    const { updateRoom, deleteRoom } = useRooms();

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
        },
    });

    const onSubmit = (data: updateRoomValues) => {
        updateRoom.mutate(
            { roomId, data },
            {
                onSuccess: () => {
                    reset();
                    onSuccess();
                    onClose();
                }
            }
        );
    }

    const handleDeleteRoom = () => {
        const isSure = window.confirm("Are u sure u want to NUKE this room? This action is irreversible.");
        if (!isSure) return;

        deleteRoom.mutate({ roomId }, {
            onSuccess: () => {
                onClose();
            }
        });
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