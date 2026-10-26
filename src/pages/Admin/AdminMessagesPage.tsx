import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminEntityList } from '../../components/admin/AdminEntityList.tsx';
import { AdminListPagination } from '../../components/admin/AdminListPagination.tsx';
import { AdminSidebarSearch } from '../../components/admin/AdminSidebarSearch.tsx';
import { AdminMessageActions } from '../../components/admin/actions/AdminMessageActions.tsx';
import { useAdminMessages } from '../../hooks/admin/useAdminMessages.ts';
import styles from './AdminMessagesPage.module.css';
import { PATH } from '../../utils/pathList.ts';
import { AdminConfirmDialog } from '../../components/admin/AdminConfirmDialog.tsx';
import { CopyId } from '../../components/admin/ui/CopyId.tsx';

export const AdminMessagesPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roomFilter, setRoomFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { messages, pagination, isFetching, isInitialLoading, deleteMessage } = useAdminMessages({
        page,
        search,
        room: roomFilter,
        user: userFilter,
    });
    const deleteMessageMutate = deleteMessage.mutate;
    const selectedMessage = messages.find((message) => message.id === selectedMessageId) ?? null;

    useEffect(() => {
        if (!selectedMessage) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedMessageId(null);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [selectedMessage]);

    const applySearch = useCallback((nextSearch: string) => {
        setPage(1);
        setSelectedMessageId(null);
        setSearch(nextSearch);
    }, []);

    const applyNameFilter = (kind: 'room' | 'user', value: string) => {
        setPage(1);
        setSelectedMessageId(null);
        if (kind === 'room') setRoomFilter(value);
        else setUserFilter(value);
    };

    const changePage = useCallback((nextPage: number) => {
        setPage(nextPage);
        setSelectedMessageId(null);
    }, []);

    const deleteSelectedMessage = useCallback(() => {
        if (!selectedMessage) return;
        setConfirmDelete(true);
    }, [selectedMessage]);

    return (
        <div className={styles.adminPageShell}>
            <header className={styles.dashboardHeader}>
                <div>
                    <span className={styles.eyebrow}>Moderation</span>
                    <h1 className={styles.sidebarTitle}>Messages</h1>
                </div>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => navigate(PATH.admin.adminDashboard)}
                >
                    Back to Dashboard
                </button>
            </header>

            <main className={styles.messageModerationLayout}>
                <section className={styles.listPanel}>
                    <div className={styles.listPanelHeader}>
                        <div>
                            <span className={styles.eyebrow}>messages</span>
                            <h2 className={styles.panelTitle}>Moderation queue</h2>
                        </div>
                        <span className={styles.sectionNote}>
                            {isFetching ? 'Refreshing...' : `${pagination.total} total`}
                        </span>
                    </div>

                    <AdminSidebarSearch activeTab="messages" onApplySearch={applySearch} />

                    <div className={styles.messageFilters}>
                        <label className={styles.fieldLabel}>
                            room title
                            <input
                                className={styles.textInput}
                                value={roomFilter}
                                onChange={(event) => applyNameFilter('room', event.target.value)}
                                placeholder="search room title"
                            />
                        </label>
                        <label className={styles.fieldLabel}>
                            username
                            <input
                                className={styles.textInput}
                                value={userFilter}
                                onChange={(event) => applyNameFilter('user', event.target.value)}
                                placeholder="search username"
                            />
                        </label>
                        {(roomFilter || userFilter) && (
                            <div className={styles.filterChips} aria-label="active message filters">
                                {roomFilter && (
                                    <button
                                        className={styles.filterChip}
                                        type="button"
                                        onClick={() => applyNameFilter('room', '')}
                                    >
                                        room: {roomFilter} ×
                                    </button>
                                )}
                                {userFilter && (
                                    <button
                                        className={styles.filterChip}
                                        type="button"
                                        onClick={() => applyNameFilter('user', '')}
                                    >
                                        user: {userFilter} ×
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <AdminEntityList
                        activeTab="messages"
                        currentItems={messages}
                        selectedId={selectedMessageId}
                        onSelect={setSelectedMessageId}
                        isFetching={isFetching}
                        isInitialLoading={isInitialLoading}
                    />

                    <AdminListPagination pagination={pagination} onPageChange={changePage} />
                </section>

                {selectedMessage && (
                    <button
                        aria-label="close message actions"
                        className={styles.sheetBackdrop}
                        onClick={() => setSelectedMessageId(null)}
                        type="button"
                    />
                )}
                <section
                    aria-label="message actions"
                    className={`${styles.actionsPanel} ${selectedMessage ? styles.mobileSheetOpen : ''}`}
                    role={selectedMessage ? 'dialog' : undefined}
                    aria-modal={selectedMessage ? true : undefined}
                >
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.panelTitle}>Message Actions</h2>
                        <button
                            className={styles.sheetClose}
                            onClick={() => setSelectedMessageId(null)}
                            type="button"
                        >
                            close
                        </button>
                    </div>

                    {selectedMessage ? (
                        <>
                            <pre className={styles.messageBody}>
                                {selectedMessage.cipherText || '[empty message]'}
                            </pre>
                            <AdminMessageActions
                                selectedMessage={selectedMessage}
                                onDelete={deleteSelectedMessage}
                            />
                            <CopyId id={selectedMessage.id} />
                        </>
                    ) : (
                        <p className={styles.placeholderText}>Select a message to moderate it.</p>
                    )}
                </section>
            </main>
            {confirmDelete && selectedMessage && (
                <AdminConfirmDialog
                    title="delete this message?"
                    body="this message is gone for good."
                    confirmLabel="do it"
                    onCancel={() => setConfirmDelete(false)}
                    onConfirm={() =>
                        deleteMessageMutate(selectedMessage.id, {
                            onSuccess: () => {
                                setSelectedMessageId(null);
                                setConfirmDelete(false);
                            },
                        })
                    }
                />
            )}
        </div>
    );
};
