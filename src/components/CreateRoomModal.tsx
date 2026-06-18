import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomApi } from '../api/rooms/rooms.service.ts';
import toast from 'react-hot-toast';
import styles from './CreateRoomModal.module.css';

const createRoomScheme = z.object({
    title: z.string().min(3, 'Title is def what u NEED TO CREATE A FUCIN ROOM').max(255, 'son'),
    topic: z.string().max(255).optional(),
    description: z.string().optional(),
    publicity: z.enum(['public', 'private']),
});

type CreateRoomValues = z.infer<typeof createRoomScheme>;

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateRoomModal = ({ isOpen, onClose, onSuccess }: CreateRoomModalProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CreateRoomValues>({
        resolver: zodResolver(createRoomScheme),
        defaultValues: {
            title: '',
            topic: '',
            description: '',
            publicity: 'public',
        },
    });

    if (!isOpen) return null;

    const onSubmit = async (data: CreateRoomValues) => {
        try {
            await roomApi.createRoom(data);
            toast.success('Room created. Ready to mog.');
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'nah something went wrong.');
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>

                <h2 className={styles.title}>CREATE NEW ROOM</h2>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Title *</label>
                        <input {...register('title')} placeholder="e.g. YAPYAPYAP" />
                        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Topic</label>
                        <input {...register('topic')} placeholder="describe it in small words" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <textarea {...register('description')} rows={3} placeholder="Describe it in MORE words" />
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
                        {isSubmitting ? 'Creating...' : 'Create This Shi'}
                    </button>
                </form>
            </div>
        </div>
    );
};