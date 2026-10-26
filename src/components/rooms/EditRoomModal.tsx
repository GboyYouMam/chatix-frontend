import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './CreateRoomModal.module.css';
import { useUpdateRoom } from '../../hooks/rooms/useUpdateRoom.ts';
import { Modal } from '../ui/Modal.tsx';
import { AdminConfirmDialog } from '../admin/AdminConfirmDialog.tsx';

const updateRoomSchema = z.object({
    title: z.string().min(3, 'Title is def what u NEED TO CREATE A FUCIN ROOM').max(255, 'son'),
    topic: z.string().max(255).optional(),
    description: z.string().optional(),
});

type UpdateRoomValues = z.infer<typeof updateRoomSchema>;

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

export const UpdateRoomModal = ({
    isOpen,
    onClose,
    onSuccess,
    roomId,
    initialData,
}: updateRoomModalProps) => {
    const { updateRoom, deleteRoom } = useUpdateRoom();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateRoomValues>({
        resolver: zodResolver(updateRoomSchema),
        values: {
            title: initialData?.title || '',
            topic: initialData?.topic || '',
            description: initialData?.description || '',
        },
    });

    const onSubmit = (data: UpdateRoomValues) => {
        updateRoom.mutate(
            { roomId, data },
            {
                onSuccess: () => {
                    reset();
                    onSuccess();
                    onClose();
                },
            },
        );
    };

    const handleDeleteRoom = () => {
        deleteRoom.mutate(
            { roomId },
            {
                onSuccess: () => {
                    setConfirmDelete(false);
                    onClose();
                },
            },
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} label="update room">
            <div className={styles.modal}>
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="close modal"
                >
                    ×
                </button>

                <h2 className={styles.title}>UPDATE ROOM</h2>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Title *</label>
                        <input {...register('title')} placeholder="Room title..." />
                        {errors.title && (
                            <span className={styles.error}>{errors.title.message}</span>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Topic</label>
                        <input {...register('topic')} placeholder="What are we yapping about?" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            placeholder="Lore goes here..."
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update This Shi'}
                    </button>

                    <div className={styles.dangerZone}>
                        <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => setConfirmDelete(true)}
                            disabled={isSubmitting}
                        >
                            DELETE ROOM
                        </button>
                    </div>
                </form>
                {confirmDelete && (
                    <AdminConfirmDialog
                        title="nuke this room?"
                        body="this action cannot be undone."
                        confirmLabel="delete room"
                        onConfirm={handleDeleteRoom}
                        onCancel={() => setConfirmDelete(false)}
                    />
                )}
            </div>
        </Modal>
    );
};
