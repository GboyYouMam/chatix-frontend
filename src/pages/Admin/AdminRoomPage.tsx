import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { AdminRoomActions } from '../../components/admin/actions/AdminRoomActions.tsx';
import { formatDate } from '../../components/admin/adminPanelUtils.ts';
import { useAdminRoom } from '../../hooks/admin/rooms/useAdminRoom.ts';
import { useAdminRooms } from '../../hooks/admin/rooms/useAdminRooms.ts';
import type { AdminRoomStatus } from '../../api/admin/types.ts';
import styles from './AdminPanel.module.css';
import { PATH } from '../../utils/pathList.ts';
import { CopyId } from '../../components/admin/ui/CopyId.tsx';
import { StatusPill } from '../../components/rooms/StatusPill.tsx';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.ts';
import type { AdminMessage, PaginatedResponse } from '../../api/admin/types.ts';
import { notify } from '../../lib/toast.ts';
import { useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '../../hooks/admin/adminKeys.ts';

export const AdminRoomPage = () => {
    const [rejectReason, setRejectReason] = useState('');
    const queryClient = useQueryClient();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { room, isLoading, isError } = useAdminRoom(roomId);
    const { quarantineRoom, setRoomStatus, unquarantineRoom } = useAdminRooms({
        page: 1,
        search: '',
        enabled: false,
    });
    const recentMessages = useQuery({
        queryKey: ['admin', 'rooms', roomId, 'messages'],
        queryFn: async () =>
            (
                await api.get<PaginatedResponse<AdminMessage>>(
                    `/admin/rooms/${encodeURIComponent(roomId!)}/messages`,
                    { params: { page: 1, limit: 10 } },
                )
            ).data.items,
        enabled: Boolean(roomId),
    });

    if (isLoading) {
        return <div className={styles.adminPageShell}>Loading room...</div>;
    }

    if (isError || !room) {
        return (
            <div className={styles.adminPageShell}>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => navigate(PATH.admin.adminDashboard)}
                >
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
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => navigate(PATH.admin.adminDashboard)}
                >
                    Back to Dashboard
                </button>
                <CopyId id={room.id} />
            </header>

            <section className={styles.profileCard}>
                <div className={styles.profileSummary}>
                    {room.status && <StatusPill status={room.status} />}
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
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Password</span>
                        <strong>{room.hasPassword ? 'locked' : 'open'}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Messages</span>
                        <strong>{room.messagesCount ?? 0}</strong>
                    </div>
                </div>

                {room.description && <p className={styles.roomDescription}>{room.description}</p>}
                {room.quarantineReason && (
                    <p className={styles.roomDescription}>Quarantine: {room.quarantineReason}</p>
                )}
            </section>

            <section className={styles.logsPanel}>
                <h2 className={styles.panelTitle}>recent messages</h2>
                {recentMessages.data?.map((message) => (
                    <article className={styles.warningCard} key={message.id}>
                        <strong>
                            {message.author?.username ?? 'unknown'} ·{' '}
                            {message.room?.title ?? room.title}
                        </strong>
                        <p>{message.cipherText || '[empty message]'}</p>
                        <span className={styles.sectionNote}>{formatDate(message.createdAt)}</span>
                    </article>
                ))}
                {!recentMessages.isLoading && !recentMessages.data?.length && (
                    <p className={styles.placeholderText}>no messages in this room yet.</p>
                )}
            </section>

            <main className={styles.actionsPanel}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.panelTitle}>Actions</h2>
                </div>
                <AdminRoomActions selectedRoom={room} actions={actions} />
                <label className={styles.fieldLabel}>
                    rejection reason
                    <textarea
                        className={styles.textArea}
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                    />
                </label>
                <button
                    className={styles.actionBtnDanger}
                    type="button"
                    disabled={rejectReason.trim().length < 3}
                    onClick={async () => {
                        try {
                            await api.patch(`/admin/rooms/${encodeURIComponent(room.id)}/reject`, {
                                reason: rejectReason.trim(),
                            });
                            notify.success('room rejected.');
                            setRejectReason('');
                            await queryClient.invalidateQueries({
                                queryKey: adminKeys.room(room.id),
                            });
                        } catch {
                            notify.error('could not reject this room.');
                        }
                    }}
                >
                    reject room
                </button>
            </main>
        </div>
    );
};
