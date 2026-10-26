import { memo } from 'react';
import styles from './AdminAuditFeed.module.css';
import type { AdminAuditLog } from '../../api/admin/types.ts';
import type { AuditFeedProps } from './adminPanelTypes.ts';
import { auditSentence } from './auditSentence.ts';
import { formatDate } from '../../utils/date.ts';

const AdminAuditLogEntry = memo(({ log }: { log: AdminAuditLog }) => {
    const formattedCreatedAt = formatDate(log.createdAt);
    const sentence = auditSentence(log);

    return (
        <div className={styles.logEntry}>
            <span className={styles.logTime}>[{formattedCreatedAt}]</span>
            <span className={log.success ? styles.logSuccess : styles.logError}>
                {log.statusCode}
            </span>
            <span className={styles.logAction}>
                <strong>{sentence.actor}</strong> {sentence.verb} <strong>{sentence.target}</strong>
                {sentence.detail ? ` — ${sentence.detail}` : ''}
            </span>
        </div>
    );
});

export const AdminAuditFeed = memo(({ logs }: AuditFeedProps) => {
    return (
        <section className={styles.logsPanel} id="audit">
            <div className={styles.sectionHeader}>
                <h2 className={styles.panelTitle}>live audit feed</h2>
                <span className={styles.sectionNote}>{logs.length} recent events</span>
            </div>

            <div className={styles.logsContainer}>
                {logs.length === 0 && (
                    <div className={styles.placeholderText}>waiting for admin activity.</div>
                )}

                {logs.map((log) => (
                    <AdminAuditLogEntry key={log.id} log={log} />
                ))}
            </div>
        </section>
    );
});
