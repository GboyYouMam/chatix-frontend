import {type Control, type FieldErrors, type UseFormRegister, useWatch} from "react-hook-form";
import type {CreateRoomValues} from "./CreateRoomModal.tsx";
import styles from './CreateRoomModal.module.css';


interface PasswordInputProps {
    control: Control<CreateRoomValues>;
    register: UseFormRegister<CreateRoomValues>;
    errors: FieldErrors<CreateRoomValues>;
}

export const PasswordInput = ({ control, register, errors }: PasswordInputProps) => {
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