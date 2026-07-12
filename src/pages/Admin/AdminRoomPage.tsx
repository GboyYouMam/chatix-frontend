import { useNavigate, useParams } from 'react-router-dom';
import { AdminRoomActions } from '../../components/admin/actions/AdminRoomActions.tsx';
import { formatDate } from '../../components/admin/adminPanelUtils.ts';
import { useAdminRoom, useAdminRooms } from '../../hooks/admin/useAdminRooms.ts';
import type { AdminRoomStatus } from '../../api/admin/types.ts';
import styles from './AdminPanel.module.css';
import { PATH } from '../../utils/pathList.ts';

export const AdminRoomPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { room, isLoading, isError } = useAdminRoom(roomId);
    const { quarantineRoom, setRoomStatus, unquarantineRoom } = useAdminRooms({
        page: 1,
        search: '',
        enabled: false,
    });

    if (isLoading) {
        return <div className={styles.adminPageShell}>Loading room...</div>;
    }

    if (isError || !room) {
        return (
            <div className={styles.adminPageShell}>
                <button className={styles.actionBtnSafe} type="button" onClick={() => navigate(PATH.admin.adminDashboard)}>
                    Back to Dashboard
                </button>
                <p className={styles.placeholderText}>Room was not found.</p>
            </div>
        );
    }

    const actions = {
        moveToStatus: (status: AdminRoomStatus) => {
            setRoomStatus.mutate({ roomId: room.id, status });
        },
        quarantine: (reason: string) => {
            if (reason.trim().length < 3) return;
            quarantineRoom.mutate({ roomId: room.id, reason: reason.trim() });
        },
        unquarantine: () => {
            unquarantineRoom.mutate(room.id);
        },
    };

    return (
        <div className={styles.adminPageShell}>
            <header className={styles.dashboardHeader}>
                <div>
                    <span className={styles.eyebrow}>Room control</span>
                    <h1 className={styles.sidebarTitle}>{room.title}</h1>
                </div>
                <button className={styles.actionBtnSafe} type="button" onClick={() => navigate(PATH.admin.adminDashboard)}>
                    Back to Dashboard
                </button>
            </header>

            <section className={styles.profileCard}>
                <div className={styles.profileSummary}>
                    <span className={styles.eyebrow}>{room.status ?? room.publicity}</span>
                    <h2 className={styles.panelTitle}>{room.title}</h2>
                    <span className={styles.sectionNote}>Created {formatDate(room.createdAt)}</span>
                </div>

                <div className={styles.statGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Creator</span>
                        <strong>{room.creator?.username ?? 'Unknown'}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Topic</span>
                        <strong>{room.topic ?? 'n/a'}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Visibility</span>
                        <strong>{room.publicity}</strong>
                    </div>
                </div>

                {room.description && <p className={styles.roomDescription}>{room.description}</p>}
                {room.quarantineReason && (
                    <p className={styles.roomDescription}>Quarantine: {room.quarantineReason}</p>
                )}
            </section>

            <main className={styles.actionsPanel}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.panelTitle}>Actions</h2>
                    <span className={styles.sectionNote}>{room.id}</span>
                </div>
                <AdminRoomActions selectedRoom={room} actions={actions} />
            </main>
        </div>
    );
};
