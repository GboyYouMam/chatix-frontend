import { memo } from 'react';
import styles from '../../pages/Admin/AdminPanel.module.css';
import type { AdminAuditLog } from '../../api/admin/types.ts';
import type { AuditFeedProps } from './adminPanelTypes.ts';
import { formatDate, getLogSummary } from './adminPanelUtils.ts';

const AdminAuditLogEntry = memo(({ log }: { log: AdminAuditLog }) => {
    const formattedCreatedAt = formatDate(log.createdAt);
    const summary = getLogSummary(log);

    return (
        <div className={styles.logEntry}>
            <span className={styles.logTime}>{formattedCreatedAt}</span>
            <span className={log.success ? styles.logSuccess : styles.logError}>
                {log.statusCode}
            </span>
            <span className={styles.logAction}>{summary}</span>
        </div>
    );
});

export const AdminAuditFeed = memo(({ logs }: AuditFeedProps) => {
    return (
        <section className={styles.logsPanel}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.panelTitle}>Live Audit Feed</h2>
                <span className={styles.sectionNote}>{logs.length} recent events</span>
            </div>

            <div className={styles.logsContainer}>
                {logs.length === 0 && (
                    <div className={styles.placeholderText}>Waiting for admin activity.</div>
                )}

                {logs.map((log) => <AdminAuditLogEntry key={log.id} log={log} />)}
            </div>
        </section>
    );
});
