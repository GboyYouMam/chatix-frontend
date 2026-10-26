import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './CreateRoomModal.module.css';
import { PasswordInput } from './PasswordInput.tsx';
import { useCreateRoom } from '../../hooks/rooms/useCreateRoom.ts';
import { Modal } from '../ui/Modal.tsx';
import { ThemePicker } from './ThemePicker.tsx';
import { DEFAULT_ROOM_THEME, ROOM_THEME_KEYS } from '../../themes/roomThemes.ts';

const createRoomScheme = z
    .object({
        title: z.string().min(3, 'Title is def what u NEED TO CREATE A FUCIN ROOM').max(255, 'son'),
        topic: z.string().max(255).optional(),
        description: z.string().optional(),
        password: z.string().optional(),
        publicity: z.enum(['public', 'private']),
        theme: z.enum(ROOM_THEME_KEYS),
    })
    .superRefine((data, ctx) => {
        if (data.publicity === 'private' && (!data.password || data.password.length < 6)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Password must be at least 6 chars for restricted areas',
                path: ['password'],
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
    const { createRoom } = useCreateRoom();

    const methods = useForm<CreateRoomValues>({
        resolver: zodResolver(createRoomScheme),
        defaultValues: {
            title: '',
            topic: '',
            description: '',
            publicity: 'public',
            theme: DEFAULT_ROOM_THEME,
        },
    });

    const onSubmit = (data: CreateRoomValues) => {
        const payload = { ...data };

        if (payload.publicity === 'public') {
            delete payload.password;
        }

        createRoom.mutate(payload, {
            onSuccess: () => {
                methods.reset();
                onSuccess();
                onClose();
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} label="create room">
            <div className={styles.modal}>
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="close modal"
                >
                    ×
                </button>

                <h2 className={styles.title}>CREATE NEW ROOM</h2>

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Title *</label>
                            <input {...methods.register('title')} placeholder="e.g. YAPYAPYAP" />
                            {methods.formState.errors.title && (
                                <span className={styles.error}>
                                    {methods.formState.errors.title.message}
                                </span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Topic</label>
                            <input
                                {...methods.register('topic')}
                                placeholder="describe it in small words"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Description</label>
                            <textarea
                                {...methods.register('description')}
                                rows={3}
                                placeholder="Describe it in MORE words"
                            />
                        </div>

                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    value="public"
                                    {...methods.register('publicity')}
                                />
                                <span className={styles.radioText}>Public</span>
                            </label>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    value="private"
                                    {...methods.register('publicity')}
                                />
                                <span className={styles.radioText}>Private</span>
                            </label>
                        </div>

                        <Controller
                            name="theme"
                            control={methods.control}
                            render={({ field }) => (
                                <ThemePicker value={field.value} onChange={field.onChange} />
                            )}
                        />

                        <PasswordInput />

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={methods.formState.isSubmitting}
                        >
                            {methods.formState.isSubmitting ? 'Creating...' : 'Create This Shi'}
                        </button>
                    </form>
                </FormProvider>
            </div>
        </Modal>
    );
};
