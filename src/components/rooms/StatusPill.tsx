import type { RoomStatus } from '../../api/rooms/types.ts';
import styles from './StatusPill.module.css';

const labels: Record<RoomStatus, string> = {
    active: 'live',
    checkout: 'in review',
    quarantined: 'quarantined',
    banned: 'banned',
    rejected: 'rejected',
};

export const StatusPill = ({ status }: { status: RoomStatus }) => (
    <span className={`${styles.pill} ${styles[status]}`}>{labels[status]}</span>
);
