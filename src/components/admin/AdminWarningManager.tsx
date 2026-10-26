import { memo, useMemo, useState } from 'react';
import styles from './AdminWarningManager.module.css';
import type { AdminWarning } from '../../api/admin/types.ts';
import type { WarningManagerProps } from './adminPanelTypes.ts';
import { formatDate } from './adminPanelUtils.ts';
import { AdminListPagination } from './AdminListPagination.tsx';
import { AdminConfirmDialog } from './AdminConfirmDialog.tsx';

const AdminWarningItem = memo(
    ({
        warning,
        onRevokeWarning,
    }: {
        warning: AdminWarning;
        onRevokeWarning: (warningId: string) => void;
    }) => {
        const [confirmRevoke, setConfirmRevoke] = useState(false);
        const createdAt = formatDate(warning.createdAt);
        const revokedAt = formatDate(warning.revokedAt);

        return (
            <div className={styles.warningCard}>
                <div className={styles.warningMeta}>
                    <span>{createdAt}</span>
                    <span>{warning.admin?.username ?? 'unknown admin'}</span>
                </div>
                <p
                    className={
                        warning.revokedAt
                            ? `${styles.warningReason} ${styles.revokedWarning}`
                            : styles.warningReason
                    }
                >
                    {warning.reason}
                </p>
                {warning.revokedAt ? (
                    <span className={styles.revokedText}>Revoked {revokedAt}</span>
                ) : (
                    <button
                        className={styles.smallDangerButton}
                        type="button"
                        title="revoke this warning; it does not remove a ban"
                        onClick={() => setConfirmRevoke(true)}
                    >
                        revoke
                    </button>
                )}
                {confirmRevoke && (
                    <AdminConfirmDialog
                        title="revoke this warning?"
                        body="the ban stays in place."
                        confirmLabel="revoke"
                        onCancel={() => setConfirmRevoke(false)}
                        onConfirm={() => {
                            onRevokeWarning(warning.id);
                            setConfirmRevoke(false);
                        }}
                    />
                )}
            </div>
        );
    },
);

export const AdminWarningManager = memo(
    ({
        warnings,
        activeWarningCount,
        warningsLoading,
        warningsPage,
        warningsPagination,
        onAddWarning,
        onPageChange,
        onRevokeWarning,
    }: WarningManagerProps) => {
        const [warningReason, setWarningReason] = useState('');
        const pagination = useMemo(
            () => ({ ...warningsPagination, page: warningsPage }),
            [warningsPage, warningsPagination],
        );

        return (
            <>
                <div className={styles.controlCard}>
                    <label className={styles.fieldLabel}>
                        warn reason (be creative)
                        <textarea
                            className={styles.textArea}
                            value={warningReason}
                            onChange={(event) => setWarningReason(event.target.value)}
                            placeholder="what did this chud do?"
                        />
                    </label>
                    <button
                        className={styles.actionBtnWarning}
                        type="button"
                        disabled={warningReason.trim().length < 3}
                        onClick={() => {
                            void onAddWarning(warningReason).then(
                                () => setWarningReason(''),
                                () => undefined,
                            );
                        }}
                    >
                        issue warning
                    </button>
                </div>

                <div className={styles.warningSection}>
                    <div className={styles.inlineHeader}>
                        <span className={styles.subTitle}>
                            Warnings · [WARN {activeWarningCount ?? warningsPagination.total}/3]
                        </span>
                        <span className={styles.sectionNote}>
                            {warningsLoading ? 'Loading...' : `${warningsPagination.total} total`}
                        </span>
                    </div>

                    {warnings.length === 0 && !warningsLoading && (
                        <p className={styles.placeholderText}>no warnings. suspiciously normal.</p>
                    )}

                    {warnings.map((warning) => (
                        <AdminWarningItem
                            key={warning.id}
                            warning={warning}
                            onRevokeWarning={onRevokeWarning}
                        />
                    ))}

                    <AdminListPagination pagination={pagination} onPageChange={onPageChange} />
                </div>
            </>
        );
    },
);
