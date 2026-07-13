import { memo, useMemo, useState } from 'react';
import styles from '../../pages/Admin/AdminPanel.module.css';
import type { AdminWarning } from '../../api/admin/types.ts';
import type { WarningManagerProps } from './adminPanelTypes.ts';
import { formatDate } from './adminPanelUtils.ts';
import { AdminListPagination } from './AdminListPagination.tsx';

const AdminWarningItem = memo(({
    warning,
    onRevokeWarning,
}: {
    warning: AdminWarning;
    onRevokeWarning: (warningId: string) => void;
}) => {
    const createdAt = formatDate(warning.createdAt);
    const revokedAt = formatDate(warning.revokedAt);

    return (
        <div className={styles.warningCard}>
            <div className={styles.warningMeta}>
                <span>{createdAt}</span>
                <span>{warning.admin?.username ?? 'unknown admin'}</span>
            </div>
            <p className={styles.warningReason}>{warning.reason}</p>
            {warning.revokedAt ? (
                <span className={styles.revokedText}>Revoked {revokedAt}</span>
            ) : (
                <button
                    className={styles.smallDangerButton}
                    type="button"
                    onClick={() => onRevokeWarning(warning.id)}
                >
                    Revoke
                </button>
            )}
        </div>
    );
});

export const AdminWarningManager = memo(({
    warnings,
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
                    Warning reason
                    <textarea
                        className={styles.textArea}
                        value={warningReason}
                        onChange={(event) => setWarningReason(event.target.value)}
                        placeholder="Explain why this warning exists"
                    />
                </label>
                <button
                    className={styles.actionBtnWarning}
                    type="button"
                    disabled={warningReason.trim().length < 3}
                    onClick={() => {
                        onAddWarning(warningReason);
                        setWarningReason('');
                    }}
                >
                    Add warning
                </button>
            </div>

            <div className={styles.warningSection}>
                <div className={styles.inlineHeader}>
                    <span className={styles.subTitle}>Warnings</span>
                    <span className={styles.sectionNote}>
                        {warningsLoading ? 'Loading...' : `${warningsPagination.total} total`}
                    </span>
                </div>

                {warnings.length === 0 && !warningsLoading && (
                    <p className={styles.placeholderText}>No warnings for this user.</p>
                )}

                {warnings.map((warning) => (
                    <AdminWarningItem
                        key={warning.id}
                        warning={warning}
                        onRevokeWarning={onRevokeWarning}
                    />
                ))}

                <AdminListPagination
                    pagination={pagination}
                    onPageChange={onPageChange}
                />
            </div>
        </>
    );
});
