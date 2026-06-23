import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useAdminSocket } from '../../hooks/useAdminSocket';
import styles from './AdminPanel.module.css';

type Tab = 'USERS' | 'MESSAGES' | 'ROOMS';

export const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState<Tab>('USERS');
    const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

    const { users, rooms, messages, isLoading, vaporizeUser, updateModifiers, updateRoomStatus, deleteMessage } = useAdmin();
    const { logs } = useAdminSocket();

    const logsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getCurrentList = () => {
        if (activeTab === 'USERS') return users || [];
        if (activeTab === 'ROOMS') return rooms || [];
        if (activeTab === 'MESSAGES') return messages || [];
        return [];
    };

    const currentList = getCurrentList();

    const handleVaporize = () => {
        if (!selectedEntity || selectedEntity.type !== 'users') return;
        if (window.confirm('VAPORIZE THIS SOUL?')) vaporizeUser.mutate(selectedEntity.id);
    };

    const handleRoomStatus = (status: 'active' | 'checkout' | 'banned' | 'quarantined') => {
        if (!selectedEntity || selectedEntity.type !== 'rooms') return;
        updateRoomStatus.mutate({ roomId: selectedEntity.id, status });
    };

    const handleDeleteMessage = () => {
        if (!selectedEntity || selectedEntity.type !== 'messages') return;
        if (window.confirm('ERASE MESSAGE?')) deleteMessage.mutate(selectedEntity.id);
    };

    if (isLoading) return <div className={styles.adminLayout} style={{padding: '2rem'}}>INITIALIZING KILLSQUAD TERMINAL...</div>;

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <button className={activeTab === 'USERS' ? styles.activeTab : ''} onClick={() => { setActiveTab('USERS'); setSelectedEntity(null); }}>USERS</button>
                <button className={activeTab === 'MESSAGES' ? styles.activeTab : ''} onClick={() => { setActiveTab('MESSAGES'); setSelectedEntity(null); }}>MESSAGES</button>
                <button className={activeTab === 'ROOMS' ? styles.activeTab : ''} onClick={() => { setActiveTab('ROOMS'); setSelectedEntity(null); }}>ROOMS</button>

                <div className={styles.entityList}>
                    {currentList.map((entity: any) => (
                        <div
                            key={entity.id}
                            className={selectedEntity?.id === entity.id ? styles.selectedItem : styles.listItem}
                            onClick={() => setSelectedEntity({ ...entity, type: activeTab.toLowerCase() })}
                        >
                            {activeTab === 'USERS' && `[AURA: ${entity.aura}] ${entity.username}`}
                            {activeTab === 'ROOMS' && `[${entity.status.toUpperCase()}] ${entity.title}`}
                            {activeTab === 'MESSAGES' && `[${entity.author?.username || 'Anon'}] ${entity.cipherText?.slice(0, 20)}...`}
                        </div>
                    ))}
                </div>
            </aside>

            <main className={styles.mainContent}>
                <div className={styles.logsPanel}>
                    <h3 className={styles.panelTitle}>KILLSQUAD TERMINAL LOGS</h3>
                    <div className={styles.logsContainer}>
                        <span>[SYS] Admin terminal initialized... Waiting for events.</span>
                        {[...logs].reverse().map((log) => (
                            <div key={log.id} style={{ borderBottom: '1px dashed #333', paddingBottom: '4px' }}>
                                <span style={{ color: '#888' }}>[{new Date(log.timestamp).toLocaleTimeString()}] </span>
                                <span style={{ color: '#ffb000', fontWeight: 'bold' }}>{log.action} </span>
                                <span style={{ color: '#fff' }}>TARGET: {log.target} </span>
                                <span style={{ color: '#00ff00' }}>{log.details}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <div className={styles.detailsPanel}>
                        <h3 className={styles.panelTitle}>TARGET DETAILS</h3>
                        {selectedEntity ? (
                            <pre className={styles.jsonDump}>
                                {JSON.stringify(selectedEntity, null, 2)}
                            </pre>
                        ) : (
                            <p className={styles.placeholderText}>NO TARGET SELECTED</p>
                        )}
                    </div>

                    <div className={styles.actionsPanel}>
                        <h3 className={styles.panelTitle}>EXECUTIVE ACTIONS</h3>

                        {!selectedEntity && <p className={styles.placeholderText}>SELECT TARGET TO UNLOCK ACTIONS</p>}

                        {selectedEntity?.type === 'users' && (
                            <>
                                <button className={styles.actionBtnWarning} onClick={() => updateModifiers.mutate({ userId: selectedEntity.id, data: { isClown: true } })}>
                                    MARK AS CLOWN
                                </button>
                                <button className={styles.actionBtnWarning} onClick={() => updateModifiers.mutate({ userId: selectedEntity.id, data: { debt: selectedEntity.debt + 100 } })}>
                                    ADD DEBT (+100)
                                </button>
                                <button className={styles.actionBtnDanger} onClick={handleVaporize}>
                                    ☢️ VAPORIZE USER
                                </button>
                            </>
                        )}

                        {selectedEntity?.type === 'rooms' && (
                            <>
                                <button className={styles.actionBtnSafe} onClick={() => handleRoomStatus('active')}>SET ACTIVE</button>
                                <button className={styles.actionBtnWarning} onClick={() => handleRoomStatus('quarantined')}>QUARANTINE</button>
                                <button className={styles.actionBtnDanger} onClick={() => handleRoomStatus('banned')}>BAN ROOM</button>
                            </>
                        )}

                        {selectedEntity?.type === 'messages' && (
                            <button className={styles.actionBtnDanger} onClick={handleDeleteMessage}>
                                🗑️ ERASE MESSAGE
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};