import { memo, useEffect, useState } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { ForcedTitleControlProps } from '../adminPanelTypes.ts';

export const AdminForcedTitleControl = memo(({ selectedUser, onSave }: ForcedTitleControlProps) => {
    const [forcedTitle, setForcedTitle] = useState('');

    useEffect(() => {
        setForcedTitle(selectedUser.forcedTitle ?? '');
    }, [selectedUser.forcedTitle, selectedUser.id]);

    return (
        <div className={styles.controlCard}>
            <label className={styles.fieldLabel}>
                Forced title
                <input
                    className={styles.textInput}
                    value={forcedTitle}
                    onChange={(event) => setForcedTitle(event.target.value)}
                    placeholder="Optional forced title"
                />
            </label>
            <button className={styles.actionBtnSafe} type="button" onClick={() => onSave(forcedTitle)}>
                Save forced title
            </button>
        </div>
    );
});
