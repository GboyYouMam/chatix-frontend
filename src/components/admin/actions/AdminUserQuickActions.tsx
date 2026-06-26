import { memo } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { UserQuickActionsProps } from '../adminPanelTypes.ts';
import { getAdminGlazeMode, getCanChangeProfile } from '../adminPanelUtils.ts';

export const AdminUserQuickActions = memo(({ selectedUser, actions }: UserQuickActionsProps) => {
    return (
        <>
            <button className={styles.actionBtnWarning} type="button" onClick={actions.toggleClown}>
                {selectedUser.isClown ? 'Unmark clown' : 'Mark as clown'}
            </button>
            <button className={styles.actionBtnWarning} type="button" onClick={actions.toggleMogged}>
                {selectedUser.isMogged ? 'Unmog him' : 'Brutally Mog him'}
            </button>
            <button className={styles.actionBtnSafe} type="button" onClick={actions.toggleAdminGlaze}>
                {getAdminGlazeMode(selectedUser) ? 'Disable admin glaze mode' : 'Enable admin glaze mode'}
            </button>
            <button className={styles.actionBtnSafe} type="button" onClick={actions.toggleProfileEditing}>
                {getCanChangeProfile(selectedUser) ? 'Lock profile editing' : 'Allow profile editing'}
            </button>
            <button className={styles.actionBtnWarning} type="button" onClick={() => actions.adjustDebt(100)}>
                Add debt (+100)
            </button>
            <button className={styles.actionBtnWarning} type="button" onClick={() => actions.adjustDebt(-100)}>
                Reduce debt (-100)
            </button>
            <div className={styles.statusGrid}>
                <button className={styles.actionBtnSafe} type="button" onClick={actions.farmAura}>
                    Farm aura (+1)
                </button>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    disabled={(selectedUser.debt ?? 0) <= 0}
                    onClick={actions.payDebt}
                >
                    Pay debt (-1)
                </button>
            </div>
        </>
    );
});
