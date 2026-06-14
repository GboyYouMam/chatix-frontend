import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';
import styles from './Auth.module.css';
import firstImageAuth from '../../assets/firstImageAuth.png';
import secondImageAuth from '../../assets/secondImageAuth.png';

export const Register = () => {

    const { register: signup, isRegistering } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: { username: '', password: '' },
    });

    const onSubmit = (data: any) => {
        signup(data);
    };

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <h1 className={styles.logo}>CHATIX</h1>
            </header>

            <main className={styles.mainContent}>
                <img
                    src={firstImageAuth}
                    alt="firstImageAuth"
                    className={styles.authImage}
                />
                <div className={styles.card}>
                    <h2 className={styles.title}>ascend to chud</h2>
                    <h3 className={styles.subtitle}>"U SHOULD REGISTER NOW!" - ltg quote</h3>

                    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                        <div className={styles.inputWrapper}>
                            <input
                                {...register('username', {
                                    required: 'username is missing lmao',
                                    pattern: {
                                        value: /^[a-zA-Z0-9_-]{3,25}$/,
                                        message: '3-25 chars, no weird symbols',
                                    },
                                })}
                                type="text"
                                className={clsx(styles.input, errors.username && styles.inputError)}
                                placeholder="choose your username"
                                disabled={isRegistering}
                            />
                            {errors.username && (
                                <span className={styles.errorText}>
                                    {errors.username.message as string}
                                </span>
                            )}
                        </div>

                        <div className={styles.inputWrapper}>
                            <input
                                {...register('password', {
                                    required: 'password is missing dum a$$',
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message: 'needs upper, lower, number, and special char',
                                    },
                                })}
                                type="password"
                                className={clsx(styles.input, errors.password && styles.inputError)}
                                placeholder="secure your soul (password)"
                                disabled={isRegistering}
                            />
                            {errors.password && (
                                <span className={styles.errorText}>
                                    {errors.password.message as string}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isRegistering}
                        >
                            {isRegistering ? 'ascending...' : 'register'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <span className={styles.mutedText}>already exist?</span>
                        <Link to="/login" className={styles.link}>
                            log in
                        </Link>
                    </div>
                </div>
                <img
                    src={secondImageAuth}
                    alt="secondImageAuth"
                    className={styles.authImage} />
            </main>
        </div>
    );
};