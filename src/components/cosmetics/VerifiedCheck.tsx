import styles from './VerifiedCheck.module.css';

export const VerifiedCheck = () => (
    <span
        className={styles.check}
        role="img"
        title="verified by nobody"
        aria-label="verified by nobody"
        tabIndex={0}
    >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path
                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </span>
);
