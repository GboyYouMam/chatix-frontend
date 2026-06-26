import { memo } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { UserActionsProps } from '../adminPanelTypes.ts';
import { AdminForcedTitleControl } from '../control/AdminForcedTitleControl.tsx';
import { AdminTimeModifierControl } from '../control/AdminTimeModifierControl.tsx';
import { AdminUserQuickActions } from './AdminUserQuickActions.tsx';
import { AdminWarningManager } from '../AdminWarningManager.tsx';

export const AdminUserActions = memo(({
    selectedUser,
    warnings,
    warningsLoading,
    warningsPage,
    warningsPagination,
    onPageChange,
    actions,
}: UserActionsProps) => {
    return (
        <div className={styles.actionGroup}>
            <AdminUserQuickActions selectedUser={selectedUser} actions={actions} />

            <AdminForcedTitleControl
                selectedUser={selectedUser}
                onSave={actions.updateForcedTitle}
            />

            <AdminTimeModifierControl
                currentValue={selectedUser.bannedUntil}
                intent="danger"
                initialAmount="24"
                initialUnit="hours"
                label="Ban user"
                submitLabel="Apply ban"
                onSubmit={actions.setBanDuration}
            />

            <AdminTimeModifierControl
                currentValue={selectedUser.yapCooldown}
                intent="warning"
                initialAmount="15"
                initialUnit="minutes"
                label="Set yap cooldown"
                submitLabel="Apply cooldown"
                onSubmit={actions.setCooldownDuration}
            />

            <AdminWarningManager
                warnings={warnings}
                warningsLoading={warningsLoading}
                warningsPage={warningsPage}
                warningsPagination={warningsPagination}
                onAddWarning={actions.addWarning}
                onPageChange={onPageChange}
                onRevokeWarning={actions.revokeWarning}
            />

            <button className={styles.actionBtnDanger} type="button" onClick={actions.vaporize}>
                Vaporize user
            </button>
        </div>
    );
});
