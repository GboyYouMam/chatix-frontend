import styles from './Avatar.module.css';

export function Avatar({
    name,
    src,
    size = 'small',
}: {
    name: string;
    src?: string | null;
    size?: 'small' | 'large';
}) {
    return src ? (
        <img className={`${styles.avatar} ${styles[size]}`} src={src} alt={`${name} avatar`} />
    ) : (
        <span
            className={`${styles.avatar} ${styles[size]} ${styles.fallback}`}
            aria-label={`${name} avatar`}
        >
            {name.slice(0, 1).toUpperCase()}
        </span>
    );
}
