import { useState } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { RoomActionsProps } from '../adminPanelTypes.ts';
import { AdminConfirmDialog } from '../AdminConfirmDialog.tsx';

export const AdminRoomActions = ({ selectedRoom, actions }: RoomActionsProps) => {
    return (
        <AdminRoomActionForm key={selectedRoom.id} selectedRoom={selectedRoom} actions={actions} />
    );
};

const AdminRoomActionForm = ({ selectedRoom, actions }: RoomActionsProps) => {
    const [quarantineReason, setQuarantineReason] = useState(selectedRoom.quarantineReason ?? '');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    return (
        <div className={styles.actionGroup}>
            <div className={styles.statusGrid}>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => actions.moveToStatus('active')}
                >
                    Move to active
                </button>
                <button
                    className={styles.actionBtnWarning}
                    type="button"
                    onClick={() => actions.moveToStatus('checkout')}
                >
                    Move to checkout
                </button>
                <button
                    className={styles.actionBtnDanger}
                    type="button"
                    onClick={() => setPendingAction(() => () => actions.moveToStatus('banned'))}
                >
                    ban room
                </button>
            </div>

            <div className={styles.controlCard}>
                <label className={styles.fieldLabel}>
                    Quarantine reason
                    <textarea
                        className={styles.textArea}
                        value={quarantineReason}
                        onChange={(event) => setQuarantineReason(event.target.value)}
                        placeholder="Required when quarantining a room"
                    />
                </label>
                <div className={styles.statusGrid}>
                    <button
                        className={styles.actionBtnWarning}
                        type="button"
                        disabled={quarantineReason.trim().length < 3}
                        onClick={() =>
                            setPendingAction(() => () => actions.quarantine(quarantineReason))
                        }
                    >
                        quarantine room
                    </button>
                    <button
                        className={styles.actionBtnSafe}
                        type="button"
                        onClick={actions.unquarantine}
                    >
                        Unquarantine room
                    </button>
                </div>
            </div>
            {pendingAction && (
                <AdminConfirmDialog
                    title="this room is about to be cooked"
                    body="the change applies to everyone in it."
                    confirmLabel="do it"
                    onCancel={() => setPendingAction(null)}
                    onConfirm={() => {
                        pendingAction();
                        setPendingAction(null);
                    }}
                />
            )}
        </div>
    );
};
