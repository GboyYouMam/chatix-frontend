import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';
import styles from './Auth.module.css';
import thirdImageAuth from '../../assets/thirdImageAuth.png';
import fourthImageAuth from '../../assets/fourthImageAuth.png';
import headerImage from '../../assets/headerImage.png';

export const Login = () => {
    const { login, isLoggingIn } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: { username: '', password: '' },
    });

    const onSubmit = (data: any) => {
        login(data);
    };

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <img
                    src={headerImage}
                    alt="headerImage"
                    className={styles.headerImage}
                />
                <h1 className={styles.logo}>CHATIX</h1>
            </header>

            <main className={styles.mainContent}>
                <img
                    src={fourthImageAuth}
                    alt="fourthImageAuth"
                    className={styles.authImage}
                />
                <div className={styles.card}>
                    <h2 className={styles.title}>welcome back</h2>
                    <h3 className={styles.subtitle}>log in</h3>

                    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                        <div className={styles.inputWrapper}>
                            <input
                                {...register('username', { required: 'username is missing are we deadass?' })}
                                type="text"
                                className={clsx(styles.input, errors.username && styles.inputError)}
                                placeholder="your username"
                                disabled={isLoggingIn}
                            />
                            {errors.username && (
                                <span className={styles.errorText}>
                                    {errors.username.message as string}
                                </span>
                            )}
                        </div>

                        <div className={styles.inputWrapper}>
                            <input
                                {...register('password', { required: 'password is missing how do u expect to log in???' })}
                                type="password"
                                className={clsx(styles.input, errors.password && styles.inputError)}
                                placeholder="your password"
                                disabled={isLoggingIn}
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
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? 'ascending...' : 'log in'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <span className={styles.mutedText}>new here?</span>
                        <Link to="/register" className={styles.link}>
                            ascend now
                        </Link>
                    </div>
                </div>
                <img
                    src={thirdImageAuth}
                    alt="thirdImageAuth"
                    className={styles.authImage}
                />
            </main>
        </div>
    );
};