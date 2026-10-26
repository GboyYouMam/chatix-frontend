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
import { useAdminStats, useModerationQueue } from '../../hooks/admin/useAdminStats.ts';
import { StatTile } from '../../components/admin/ui/StatTile.tsx';
import { api } from '../../api/client.ts';
import { notify } from '../../lib/toast.ts';

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
    const stats = useAdminStats();
    const queue = useModerationQueue();

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

    const approveRoom = async (roomId: string) => {
        try {
            await api.patch(`/admin/rooms/${encodeURIComponent(roomId)}/approve`);
            notify.success('room approved. let them cook.');
            await Promise.all([roomsState.refetch?.(), queue.refetch()]);
        } catch {
            notify.error('could not approve this room.');
        }
    };

    const rejectRoom = async (roomId: string) => {
        const reason = window.prompt('why is this room cooked?');
        if (!reason?.trim()) return;
        try {
            await api.patch(`/admin/rooms/${encodeURIComponent(roomId)}/reject`, {
                reason: reason.trim(),
            });
            notify.success('room rejected.');
            await Promise.all([roomsState.refetch?.(), queue.refetch()]);
        } catch {
            notify.error('could not reject this room.');
        }
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
                    onClick={() => navigate(PATH.admin.adminMessagePanel)}
                >
                    Open messages
                </button>
            </header>

            <section className={styles.statGrid} aria-label="moderation stats">
                <StatTile label="rooms in review" value={stats.data?.roomsInReview ?? '—'} />
                <StatTile label="active bans" value={stats.data?.activeBans ?? '—'} />
                <StatTile label="warns today" value={stats.data?.warnsToday ?? '—'} />
                <StatTile label="autobans this week" value={stats.data?.autobansThisWeek ?? '—'} />
            </section>

            <section className={styles.listPanel}>
                <div className={styles.listPanelHeader}>
                    <h2 className={styles.panelTitle}>rooms in review</h2>
                    <span className={styles.sectionNote}>{queue.data?.length ?? 0} loaded</span>
                </div>
                {queue.data?.map((room) => (
                    <div className={styles.listItem} key={room.id}>
                        <span className={styles.itemLabel}>
                            <strong>{room.title}</strong> ·{' '}
                            {room.creator?.username ?? 'unknown creator'}
                            <small>{room.topic ?? 'no topic'}</small>
                        </span>
                        <button
                            className={styles.actionBtnSafe}
                            type="button"
                            onClick={() => void approveRoom(room.id)}
                        >
                            approve
                        </button>
                        <button
                            className={styles.actionBtnDanger}
                            type="button"
                            onClick={() => void rejectRoom(room.id)}
                        >
                            reject
                        </button>
                    </div>
                ))}
                {(queue.data?.length ?? 0) === 0 && (
                    <p className={styles.placeholderText}>
                        no rooms waiting. the queue is cooked clean.
                    </p>
                )}
            </section>

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
