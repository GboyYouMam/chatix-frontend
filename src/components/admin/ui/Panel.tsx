import type { HTMLAttributes } from 'react';
import styles from './Panel.module.css';

export function Panel(props: HTMLAttributes<HTMLElement>) {
    return <section {...props} className={`${styles.panel} ${props.className ?? ''}`} />;
}
