import { useFormContext, useWatch} from "react-hook-form";
import type {CreateRoomValues} from "./CreateRoomModal.tsx";
import styles from './CreateRoomModal.module.css';

export const PasswordInput = () => {
    const { control, register, formState: { errors } } = useFormContext<CreateRoomValues>();
    const publicity = useWatch({
        control,
        name: 'publicity',
    });

    if (publicity !== 'private') return null;

    return (
        <div className={styles.inputGroup}>
            <label>Override Key (Password) *</label>
            <input
                type="password"
                {...register('password')}
                placeholder="Min 6 chars..."
            />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>
    );
};