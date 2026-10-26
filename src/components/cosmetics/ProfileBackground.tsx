import clsx from 'clsx';
import type { BackgroundPattern } from './profileCosmetics.ts';
import styles from './ProfileBackground.module.css';

export const ProfileBackground = ({ pattern }: { pattern: BackgroundPattern }) => (
    <div aria-hidden="true" className={clsx(styles.layer, styles[pattern])} />
);
