import { memo, useEffect, useState } from 'react';
import styles from '../../pages/Admin/AdminPanel.module.css';
import type { AdminTabKey } from './adminPanelTypes.ts';

interface AdminSidebarSearchProps {
    activeTab: AdminTabKey;
    onApplySearch: (search: string) => void;
}

export const AdminSidebarSearch = memo(({ activeTab, onApplySearch }: AdminSidebarSearchProps) => {
    const [draft, setDraft] = useState('');

    useEffect(() => {
        setDraft('');
    }, [activeTab]);

    const submitSearch = () => {
        onApplySearch(draft.trim());
    };

    return (
        <div className={styles.searchPanel}>
            <input
                className={styles.searchInput}
                placeholder={`Search ${activeTab}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') submitSearch();
                }}
            />
            <button className={styles.searchButton} type="button" onClick={submitSearch}>
                Search
            </button>
        </div>
    );
});
