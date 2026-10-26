import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuditFeed } from '../../components/admin/AdminAuditFeed.tsx';
import { AdminEntityList } from '../../components/admin/AdminEntityList.tsx';
import { AdminListPagination } from '../../components/admin/AdminListPagination.tsx';
import { AdminSidebarSearch } from '../../components/admin/AdminSidebarSearch.tsx';
import type { AdminEntity, AdminTabKey } from '../../components/admin/adminPanelTypes.ts';
import { useAdminAuditLogs } from '../../hooks/admin/useAdminAuditLogs.ts';
import { useAdminRooms } from '../../hooks/admin/rooms/useAdminRooms.ts';
import { useAdminUsers } from '../../hooks/admin/users/useAdminUsers.ts';
import type { PaginationMeta } from '../../api/admin/types.ts';
import styles from './AdminPanel.module.css';
import { PATH } from '../../utils/pathList.ts';

interface AdminDashboardListProps {
    title: string;
    activeTab: Extract<AdminTabKey, 'users' | 'rooms'>;
    currentItems: AdminEntity[];
    isFetching: boolean;
    isInitialLoading: boolean;
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
    isInitialLoading,
    pagination,
    onApplySearch,
    onPageChange,
    onSelect,
}: AdminDashboardListProps) => (
    <section className={styles.listPanel} id={activeTab}>
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
            isFetching={isFetching}
            isInitialLoading={isInitialLoading}
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

    const usersState = useAdminUsers({ page: usersPage, search: usersSearch });
    const roomsState = useAdminRooms({ page: roomsPage, search: roomsSearch });
    const { auditLogs } = useAdminAuditLogs({ page: 1, limit: 25, search: '' });

    const applyUsersSearch = useCallback((nextSearch: string) => {
        setUsersPage(1);
        setUsersSearch(nextSearch);
    }, []);

    const applyRoomsSearch = useCallback((nextSearch: string) => {
        setRoomsPage(1);
        setRoomsSearch(nextSearch);
    }, []);

    const selectUser = useCallback(
        (id: string) => {
            navigate(PATH.admin.href.userPanel(id));
        },
        [navigate],
    );

    const selectRoom = useCallback(
        (id: string) => {
            navigate(PATH.admin.href.roomPanel(id));
        },
        [navigate],
    );

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
                    onClick={() => navigate(PATH.admin.adminMessagePanel)}
                >
                    Open messages
                </button>
            </header>

            <AdminAuditFeed logs={auditLogs} />

            <div className={styles.dashboardGrid}>
                <AdminDashboardList
                    title="Users"
                    activeTab="users"
                    currentItems={usersState.users}
                    isFetching={usersState.isFetching}
                    isInitialLoading={usersState.isInitialLoading}
                    pagination={usersState.pagination}
                    onApplySearch={applyUsersSearch}
                    onPageChange={setUsersPage}
                    onSelect={selectUser}
                />

                <AdminDashboardList
                    title="Rooms"
                    activeTab="rooms"
                    currentItems={roomsState.rooms}
                    isFetching={roomsState.isFetching}
                    isInitialLoading={roomsState.isInitialLoading}
                    pagination={roomsState.pagination}
                    onApplySearch={applyRoomsSearch}
                    onPageChange={setRoomsPage}
                    onSelect={selectRoom}
                />
            </div>
        </div>
    );
};
