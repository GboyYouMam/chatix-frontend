import { useForm} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './CreateRoomModal.module.css';
import {PasswordInput} from "./PasswordInput.tsx";
import {useRooms} from "../../hooks/useRooms.ts";

const createRoomScheme = z.object({
    title: z.string().min(3, 'Title is def what u NEED TO CREATE A FUCIN ROOM').max(255, 'son'),
    topic: z.string().max(255).optional(),
    description: z.string().optional(),
    password: z.string().optional(),
    publicity: z.enum(['public', 'private']),
}).superRefine((data, ctx) => {
    if (data.publicity === 'private' && (!data.password || data.password.length < 6)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must be at least 6 chars for restricted areas",
            path: ["password"]
        });
    }
});

export type CreateRoomValues = z.infer<typeof createRoomScheme>;


interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateRoomModal = ({ isOpen, onClose, onSuccess }: CreateRoomModalProps) => {
    const { createRoom } = useRooms();

    const {
        register,
        handleSubmit,
        reset,
        control,
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

    const onSubmit = (data: CreateRoomValues) => {
        const payload = { ...data };

        if (payload.publicity === 'public') {
            delete payload.password;
        }

        createRoom.mutate(payload, {
            onSuccess: () => {
                reset();
                onSuccess();
                onClose();
            }
        });
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

                    <PasswordInput control={control} register={register} errors={errors} />

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create This Shi'}
                    </button>
                </form>
            </div>
        </div>
    );
};