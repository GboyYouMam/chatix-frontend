import { memo } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type {
    AdminAuditLog,
    AdminMessage,
    AdminRoom,
    AdminUser,
    AdminWarning,
    PaginationMeta,
} from '../../../api/admin/types.ts';
import type { RoomActionHandlers, UserActionHandlers } from '../adminPanelTypes.ts';
import { AdminLogActions } from '../actions/AdminLogActions.tsx';
import { AdminMessageActions } from '../actions/AdminMessageActions.tsx';
import { AdminRoomActions } from '../actions/AdminRoomActions.tsx';
import { AdminUserActions } from '../actions/AdminUserActions.tsx';

interface AdminActionsPanelSelection {
    log: AdminAuditLog | null;
    message: AdminMessage | null;
    room: AdminRoom | null;
    user: AdminUser | null;
}

interface AdminActionsPanelWarnings {
    items: AdminWarning[];
    isLoading: boolean;
    page: number;
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
}

interface AdminActionsPanelHandlers {
    deleteMessage: () => void;
    room: RoomActionHandlers;
    user: UserActionHandlers;
}

interface AdminActionsPanelProps {
    handlers: AdminActionsPanelHandlers;
    selection: AdminActionsPanelSelection;
    warnings: AdminActionsPanelWarnings;
}

export const AdminActionsPanel = memo(({ handlers, selection, warnings }: AdminActionsPanelProps) => {
    const hasSelection = Boolean(selection.user || selection.room || selection.message || selection.log);

    return (
        <div className={styles.actionsPanel}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.panelTitle}>Actions</h2>
            </div>

            {!hasSelection && (
                <p className={styles.placeholderText}>Actions unlock when a target is selected.</p>
            )}

            {selection.user && (
                <AdminUserActions
                    selectedUser={selection.user}
                    warnings={warnings.items}
                    warningsLoading={warnings.isLoading}
                    warningsPage={warnings.page}
                    warningsPagination={warnings.pagination}
                    onPageChange={warnings.onPageChange}
                    actions={handlers.user}
                />
            )}

            {selection.room && (
                <AdminRoomActions selectedRoom={selection.room} actions={handlers.room} />
            )}

            {selection.message && (
                <AdminMessageActions selectedMessage={selection.message} onDelete={handlers.deleteMessage} />
            )}

            {selection.log && <AdminLogActions selectedLog={selection.log} />}
        </div>
    );
});
