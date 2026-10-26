import styles from './StatTile.module.css';

export function StatTile({ label, value }: { label: string; value: number | string }) {
    return (
        <div className={styles.tile}>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}
