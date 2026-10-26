import type { HTMLAttributes } from 'react';
import styles from './DataCard.module.css';

export function DataCard(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={`${styles.card} ${props.className ?? ''}`} />;
}
