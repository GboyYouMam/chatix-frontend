import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuditFeed } from '../../components/admin/AdminAuditFeed.tsx';
import { AdminEntityList } from '../../components/admin/AdminEntityList.tsx';
import { AdminListPagination } from '../../components/admin/AdminListPagination.tsx';
import { AdminSidebarSearch } from '../../components/admin/AdminSidebarSearch.tsx';
import type { AdminEntity, AdminTabKey } from '../../components/admin/adminPanelTypes.ts';
import { useAdminAuditLogs } from '../../hooks/admin/useAdminAuditLogs.ts';
import { useAdminRooms } from '../../hooks/admin/useAdminRooms.ts';
import { useAdminSocket } from '../../hooks/admin/useAdminSocket.ts';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers.ts';
import type { PaginationMeta } from '../../api/admin/types.ts';
import styles from './AdminPanel.module.css';

interface AdminDashboardListProps {
    title: string;
    activeTab: Extract<AdminTabKey, 'users' | 'rooms'>;
    currentItems: AdminEntity[];
    isFetching: boolean;
    pagination: PaginationMeta;
    onApplySearch: (search: string) => void;
    onPageChange: (page: number) => void;
    onSelect: (id: string) => void;
}

const AdminDashboardList = ({
    title,
    activeTab,
    currentItems,
    isFetching,
    pagination,
    onApplySearch,
    onPageChange,
    onSelect,
}: AdminDashboardListProps) => (
    <section className={styles.listPanel}>
        <div className={styles.listPanelHeader}>
            <div>
                <span className={styles.eyebrow}>{activeTab}</span>
                <h2 className={styles.panelTitle}>{title}</h2>
            </div>
            <span className={styles.sectionNote}>
                {isFetching ? 'Refreshing...' : `${pagination.total} total`}
            </span>
        </div>

        <AdminSidebarSearch activeTab={activeTab} onApplySearch={onApplySearch} />

        <AdminEntityList
            activeTab={activeTab}
            currentItems={currentItems}
            selectedId={null}
            onSelect={onSelect}
        />

        <AdminListPagination pagination={pagination} onPageChange={onPageChange} />
    </section>
);

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [usersPage, setUsersPage] = useState(1);
    const [roomsPage, setRoomsPage] = useState(1);
    const [usersSearch, setUsersSearch] = useState('');
    const [roomsSearch, setRoomsSearch] = useState('');

    const { logs: liveLogs } = useAdminSocket();
    const usersState = useAdminUsers({ page: usersPage, search: usersSearch });
    const roomsState = useAdminRooms({ page: roomsPage, search: roomsSearch });
    const { auditLogs } = useAdminAuditLogs({ page: 1, limit: 25, search: '' });

    const seenLogIds = new Set<string>();
    const terminalLogs = [...liveLogs, ...auditLogs].filter((log) => {
        if (seenLogIds.has(log.id)) return false;
        seenLogIds.add(log.id);
        return true;
    });

    const applyUsersSearch = (nextSearch: string) => {
        setUsersPage(1);
        setUsersSearch(nextSearch);
    };

    const applyRoomsSearch = (nextSearch: string) => {
        setRoomsPage(1);
        setRoomsSearch(nextSearch);
    };

    return (
        <div className={styles.adminPageShell}>
            <header className={styles.dashboardHeader}>
                <div>
                    <span className={styles.eyebrow}>Moderation</span>
                    <h1 className={styles.sidebarTitle}>Admin Dashboard</h1>
                </div>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => navigate('/admin/messages')}
                >
                    Open messages
                </button>
            </header>

            <AdminAuditFeed logs={terminalLogs} />

            <div className={styles.dashboardGrid}>
                <AdminDashboardList
                    title="Users"
                    activeTab="users"
                    currentItems={usersState.users}
                    isFetching={usersState.isFetching}
                    pagination={usersState.pagination}
                    onApplySearch={applyUsersSearch}
                    onPageChange={setUsersPage}
                    onSelect={(id) => navigate(`/admin/users/${id}`)}
                />

                <AdminDashboardList
                    title="Rooms"
                    activeTab="rooms"
                    currentItems={roomsState.rooms}
                    isFetching={roomsState.isFetching}
                    pagination={roomsState.pagination}
                    onApplySearch={applyRoomsSearch}
                    onPageChange={setRoomsPage}
                    onSelect={(id) => navigate(`/admin/rooms/${id}`)}
                />
            </div>
        </div>
    );
};
