import { memo } from 'react';
import styles from './AdminLogActions.module.css';
import type { LogActionsProps } from '../adminPanelTypes.ts';

export const AdminLogActions = memo(({ selectedLog }: LogActionsProps) => {
    const target = [selectedLog.targetType, selectedLog.targetId].filter(Boolean).join(':') || 'n/a';

    return (
        <div className={styles.actionGroup}>
            <div className={styles.messageMeta}>
                <span>Actor: {selectedLog.admin?.username ?? selectedLog.adminId ?? 'unknown'}</span>
                <span>Status: {selectedLog.statusCode}</span>
                <span>Duration: {selectedLog.durationMs} ms</span>
                <span>Target: {target}</span>
            </div>
        </div>
    );
});
