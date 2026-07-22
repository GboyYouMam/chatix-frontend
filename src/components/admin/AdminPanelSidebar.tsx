import styles from '../../pages/Admin/AdminPanel.module.css';
import type { SidebarProps } from './adminPanelTypes.ts';
import { AdminEntityList } from './AdminEntityList.tsx';
import { AdminListPagination } from './AdminListPagination.tsx';
import { AdminSidebarSearch } from './AdminSidebarSearch.tsx';

export const AdminPanelSidebar = ({
    activeTab,
    currentItems,
    isFetching,
    pagination,
    selectedId,
    tabs,
    onActiveTabChange,
    onApplySearch,
    onPageChange,
    onSelect,
}: SidebarProps) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <span className={styles.eyebrow}>Moderation</span>
                <h1 className={styles.sidebarTitle}>Admin Panel</h1>
            </div>

            <div className={styles.tabRow}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={activeTab === tab.key ? styles.activeTab : styles.tabButton}
                        onClick={() => onActiveTabChange(tab.key)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AdminSidebarSearch activeTab={activeTab} onApplySearch={onApplySearch} />

            <div className={styles.listMeta}>
                <span>{pagination.total} total</span>
                <span>{isFetching ? 'Refreshing...' : `Page ${pagination.page}`}</span>
            </div>

            <AdminEntityList
                activeTab={activeTab}
                currentItems={currentItems}
                selectedId={selectedId}
                onSelect={onSelect}
            />

            <AdminListPagination pagination={pagination} onPageChange={onPageChange} />
        </aside>
    );
};
