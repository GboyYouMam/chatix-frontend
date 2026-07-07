import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminEntityList } from '../../components/admin/AdminEntityList.tsx';
import { AdminListPagination } from '../../components/admin/AdminListPagination.tsx';
import { AdminSidebarSearch } from '../../components/admin/AdminSidebarSearch.tsx';
import { AdminMessageActions } from '../../components/admin/actions/AdminMessageActions.tsx';
import { useAdminMessages } from '../../hooks/admin/useAdminMessages.ts';
import styles from './AdminPanel.module.css';

export const AdminMessagesPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const { messages, pagination, isFetching, deleteMessage } = useAdminMessages({ page, search });
    const selectedMessage = messages.find((message) => message.id === selectedMessageId) ?? null;

    const applySearch = (nextSearch: string) => {
        setPage(1);
        setSelectedMessageId(null);
        setSearch(nextSearch);
    };

    const changePage = (nextPage: number) => {
        setPage(nextPage);
        setSelectedMessageId(null);
    };

    const deleteSelectedMessage = () => {
        if (!selectedMessage) return;
        if (window.confirm('Delete this message?')) {
            deleteMessage.mutate(selectedMessage.id, {
                onSuccess: () => setSelectedMessageId(null),
            });
        }
    };

    return (
        <div className={styles.adminPageShell}>
            <header className={styles.dashboardHeader}>
                <div>
                    <span className={styles.eyebrow}>Moderation</span>
                    <h1 className={styles.sidebarTitle}>Messages</h1>
                </div>
                <button className={styles.actionBtnSafe} type="button" onClick={() => navigate('/admin')}>
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

                    <AdminEntityList
                        activeTab="messages"
                        currentItems={messages}
                        selectedId={selectedMessageId}
                        onSelect={setSelectedMessageId}
                    />

                    <AdminListPagination pagination={pagination} onPageChange={changePage} />
                </section>

                <section className={styles.actionsPanel}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.panelTitle}>Message Actions</h2>
                        {selectedMessage && <span className={styles.sectionNote}>{selectedMessage.id}</span>}
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
                        </>
                    ) : (
                        <p className={styles.placeholderText}>Select a message to moderate it.</p>
                    )}
                </section>
            </main>
        </div>
    );
};
