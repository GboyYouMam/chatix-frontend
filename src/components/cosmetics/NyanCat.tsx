import styles from './NyanCat.module.css';

export const NyanCat = () => (
    <span className={styles.nyan} role="img" aria-label="nyan cat">
        <span className={styles.trail} aria-hidden="true" />
        <span className={styles.cat} aria-hidden="true">
            <span className={styles.face} />
        </span>
    </span>
);
