import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminActionsPanel } from '../../components/admin/panel/AdminActionsPanel.tsx';
import { AdminAuditFeed } from '../../components/admin/AdminAuditFeed.tsx';
import { AdminDetailsPanel } from '../../components/admin/panel/AdminDetailsPanel.tsx';
import { AdminPanelSidebar } from '../../components/admin/AdminPanelSidebar.tsx';
import type { AdminTabKey, TabConfig } from '../../components/admin/adminPanelTypes.ts';
import { addDuration } from '../../components/admin/adminPanelUtils.ts';
import { useAdmin } from '../../hooks/useAdmin';
import { useAdminSocket } from '../../hooks/useAdminSocket';
import styles from './AdminPanel.module.css';

const TABS: TabConfig[] = [
    { key: 'users', label: 'USERS' },
    { key: 'rooms', label: 'ROOMS' },
    { key: 'messages', label: 'MESSAGES' },
    { key: 'audit-logs', label: 'AUDIT' },
];

export const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState<AdminTabKey>('users');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [warningsPage, setWarningsPage] = useState(1);

    const { logs: liveLogs } = useAdminSocket();
    const {
        users,
        rooms,
        messages,
        auditLogs,
        pagination,
        warnings,
        warningsPagination,
        isLoading,
        isFetching,
        warningsLoading,
        vaporizeUser,
        updateModifiers,
        quarantineRoom,
        unquarantineRoom,
        setRoomStatus,
        deleteMessage,
        addWarning,
        revokeWarning,
    } = useAdmin({
        activeTab,
        page,
        search,
        selectedUserId: activeTab === 'users' ? selectedId : null,
        warningsPage,
        warningsSearch: '',
    });

    const currentItems = useMemo(() => {
        switch (activeTab) {
            case 'users':
                return users;
            case 'rooms':
                return rooms;
            case 'messages':
                return messages;
            case 'audit-logs':
                return auditLogs;
        }
    }, [activeTab, auditLogs, messages, rooms, users]);

    const selectedUser = useMemo(() => {
        return activeTab === 'users'
            ? users.find((user) => user.id === selectedId) ?? null
            : null;
    }, [activeTab, selectedId, users]);
    const selectedRoom = useMemo(() => {
        return activeTab === 'rooms'
            ? rooms.find((room) => room.id === selectedId) ?? null
            : null;
    }, [activeTab, rooms, selectedId]);
    const selectedMessage = useMemo(() => {
        return activeTab === 'messages'
            ? messages.find((message) => message.id === selectedId) ?? null
            : null;
    }, [activeTab, messages, selectedId]);
    const selectedLog = useMemo(() => {
        return activeTab === 'audit-logs'
            ? auditLogs.find((log) => log.id === selectedId) ?? null
            : null;
    }, [activeTab, auditLogs, selectedId]);

    const selectedEntity = selectedUser ?? selectedRoom ?? selectedMessage ?? selectedLog;

    const terminalLogs = useMemo(() => {
        const seen = new Set<string>();
        return [...liveLogs, ...auditLogs].filter((log) => {
            if (seen.has(log.id)) return false;
            seen.add(log.id);
            return true;
        });
    }, [auditLogs, liveLogs]);

    useEffect(() => {
        setSelectedId(null);
        setPage(1);
    }, [activeTab]);

    useEffect(() => {
        setWarningsPage(1);
    }, [selectedUser?.id]);

    const handleApplySearch = useCallback((nextSearch: string) => {
        setPage(1);
        setSelectedId(null);
        setSearch(nextSearch.trim());
    }, []);

    const handlePageChange = useCallback((nextPage: number) => {
        setSelectedId(null);
        setPage(nextPage);
    }, []);

    const userActions = useMemo(() => ({
        adjustDebt: (amount: number) => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { debt: (selectedUser.debt ?? 0) + amount },
            });
        },
        addWarning: (reason: string) => {
            if (!selectedUser || reason.trim().length < 3) return;
            addWarning.mutate({ userId: selectedUser.id, reason: reason.trim() });
        },
        farmAura: () => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { aura: (selectedUser.aura ?? 0) + 1 },
            });
        },
        payDebt: () => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { debt: Math.max((selectedUser.debt ?? 0) - 1, 0) },
            });
        },
        revokeWarning: (warningId: string) => {
            if (!selectedUser) return;
            revokeWarning.mutate({ userId: selectedUser.id, warningId });
        },
        setBanDuration: (amount: number, unit: 'minutes' | 'hours' | 'days') => {
            if (!selectedUser || !Number.isFinite(amount) || amount <= 0) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { bannedUntil: addDuration(amount, unit) },
            });
        },
        setCooldownDuration: (amount: number, unit: 'minutes' | 'hours' | 'days') => {
            if (!selectedUser || !Number.isFinite(amount) || amount <= 0) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { yapCooldown: addDuration(amount, unit) },
            });
        },
        toggleAdminGlaze: () => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: {
                    adminGlazeMode: !(selectedUser.adminGlazeMode ?? selectedUser.admin_glaze_mode ?? false),
                },
            });
        },
        toggleClown: () => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { isClown: !selectedUser.isClown },
            });
        },
        toggleMogged: () => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { isMogged: !selectedUser.isMogged },
            });
        },
        toggleProfileEditing: () => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: {
                    canChangeProfile: !(selectedUser.canChangeProfile ?? selectedUser.can_change_profile ?? false),
                },
            });
        },
        updateForcedTitle: (value: string) => {
            if (!selectedUser) return;
            updateModifiers.mutate({
                userId: selectedUser.id,
                data: { forcedTitle: value.trim() || null },
            });
        },
        vaporize: () => {
            if (!selectedUser) return;
            if (window.confirm(`Vaporize ${selectedUser.username}?`)) {
                vaporizeUser.mutate(selectedUser.id);
            }
        },
    }), [addWarning, revokeWarning, selectedUser, updateModifiers, vaporizeUser]);

    const roomActions = useMemo(() => ({
        moveToStatus: (status: 'active' | 'checkout' | 'banned' | 'quarantined') => {
            if (!selectedRoom) return;
            setRoomStatus.mutate({ roomId: selectedRoom.id, status });
        },
        quarantine: (reason: string) => {
            if (!selectedRoom || reason.trim().length < 3) return;
            quarantineRoom.mutate({
                roomId: selectedRoom.id,
                reason: reason.trim(),
            });
        },
        unquarantine: () => {
            if (!selectedRoom) return;
            unquarantineRoom.mutate(selectedRoom.id);
        },
    }), [quarantineRoom, selectedRoom, setRoomStatus, unquarantineRoom]);

    const deleteSelectedMessage = useCallback(() => {
        if (!selectedMessage) return;
        if (window.confirm('Delete this message?')) {
            deleteMessage.mutate(selectedMessage.id);
        }
    }, [deleteMessage, selectedMessage]);

    const actionHandlers = useMemo(() => ({
        deleteMessage: deleteSelectedMessage,
        room: roomActions,
        user: userActions,
    }), [deleteSelectedMessage, roomActions, userActions]);

    const actionSelection = useMemo(() => ({
        log: selectedLog,
        message: selectedMessage,
        room: selectedRoom,
        user: selectedUser,
    }), [selectedLog, selectedMessage, selectedRoom, selectedUser]);

    const warningsState = useMemo(() => ({
        items: warnings,
        isLoading: warningsLoading,
        page: warningsPage,
        pagination: warningsPagination,
        onPageChange: setWarningsPage,
    }), [warnings, warningsLoading, warningsPage, warningsPagination]);

    if (isLoading && currentItems.length === 0) {
        return <div className={styles.adminLayout}>Loading admin panel...</div>;
    }

    return (
        <div className={styles.adminLayout}>
            <AdminPanelSidebar
                activeTab={activeTab}
                currentItems={currentItems}
                isFetching={isFetching}
                pagination={pagination}
                selectedId={selectedId}
                tabs={TABS}
                onActiveTabChange={setActiveTab}
                onApplySearch={handleApplySearch}
                onPageChange={handlePageChange}
                onSelect={setSelectedId}
            />

            <main className={styles.mainContent}>
                <AdminAuditFeed logs={terminalLogs} />

                <section className={styles.bottomSection}>
                    <AdminDetailsPanel selectedEntity={selectedEntity} />

                    <AdminActionsPanel
                        handlers={actionHandlers}
                        selection={actionSelection}
                        warnings={warningsState}
                    />
                </section>
            </main>
        </div>
    );
};
