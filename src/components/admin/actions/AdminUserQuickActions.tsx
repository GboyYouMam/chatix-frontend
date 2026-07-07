import { memo } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { UserQuickActionsProps } from '../adminPanelTypes.ts';
import { getAdminGlazeMode, getCanChangeProfile } from '../adminPanelUtils.ts';

export const AdminUserQuickActions = memo(({ selectedUser, onUpdateModifiers }: UserQuickActionsProps) => {
    const debt = selectedUser.debt ?? 0;
    const aura = selectedUser.aura ?? 0;
    const adminGlazeMode = getAdminGlazeMode(selectedUser);
    const canChangeProfile = getCanChangeProfile(selectedUser);

    return (
        <>
            <button
                className={styles.actionBtnWarning}
                type="button"
                onClick={() => onUpdateModifiers({ isClown: !selectedUser.isClown })}
            >
                {selectedUser.isClown ? 'Unmark clown' : 'Mark as clown'}
            </button>
            <button
                className={styles.actionBtnWarning}
                type="button"
                onClick={() => onUpdateModifiers({ isMogged: !selectedUser.isMogged })}
            >
                {selectedUser.isMogged ? 'Unmog him' : 'Brutally Mog him'}
            </button>
            <button
                className={styles.actionBtnSafe}
                type="button"
                onClick={() => onUpdateModifiers({ adminGlazeMode: !adminGlazeMode })}
            >
                {adminGlazeMode ? 'Disable admin glaze mode' : 'Enable admin glaze mode'}
            </button>
            <button
                className={styles.actionBtnSafe}
                type="button"
                onClick={() => onUpdateModifiers({ canChangeProfile: !canChangeProfile })}
            >
                {canChangeProfile ? 'Lock profile editing' : 'Allow profile editing'}
            </button>
            <button
                className={styles.actionBtnWarning}
                type="button"
                onClick={() => onUpdateModifiers({ debt: debt + 100 })}
            >
                Add debt (+100)
            </button>
            <button
                className={styles.actionBtnWarning}
                type="button"
                onClick={() => onUpdateModifiers({ debt: debt - 100 })}
            >
                Reduce debt (-100)
            </button>
            <div className={styles.statusGrid}>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => onUpdateModifiers({ aura: aura + 1 })}
                >
                    Farm aura (+1)
                </button>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    disabled={debt <= 0}
                    onClick={() => onUpdateModifiers({ debt: debt - 1 })}
                >
                    Pay debt (-1)
                </button>
            </div>
        </>
    );
});
