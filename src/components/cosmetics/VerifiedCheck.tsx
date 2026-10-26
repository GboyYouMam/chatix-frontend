import styles from './VerifiedCheck.module.css';

export const VerifiedCheck = () => (
    <span
        className={styles.check}
        role="img"
        title="verified by nobody"
        aria-label="verified by nobody"
        tabIndex={0}
    >
        ✔
    </span>
);
