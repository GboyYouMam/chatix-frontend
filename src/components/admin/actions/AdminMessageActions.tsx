import { memo } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { MessageActionsProps } from '../adminPanelTypes.ts';
import { formatDate } from '../adminPanelUtils.ts';

export const AdminMessageActions = memo(({ selectedMessage, onDelete }: MessageActionsProps) => {
    const formattedCreatedAt = formatDate(selectedMessage.createdAt);

    return (
        <div className={styles.actionGroup}>
            <div className={styles.messageMeta}>
                <span>Author: {selectedMessage.author?.username ?? 'Anon'}</span>
                <span>Room: {selectedMessage.room?.title ?? 'Unknown room'}</span>
                <span>Created: {formattedCreatedAt}</span>
            </div>
            <button className={styles.actionBtnDanger} type="button" onClick={onDelete}>
                Delete message
            </button>
        </div>
    );
});
