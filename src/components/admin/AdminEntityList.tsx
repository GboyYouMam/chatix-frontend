import { memo, useEffect, useState } from 'react';
import styles from '../../pages/Admin/AdminPanel.module.css';
import type { AdminEntity, AdminTabKey } from './adminPanelTypes.ts';
import { getEntityLabel } from './adminPanelUtils.ts';
import { getUserBadges, getWarnBadge } from './adminBadges.ts';

interface AdminEntityListProps {
    activeTab: AdminTabKey;
    currentItems: AdminEntity[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isFetching?: boolean;
    isInitialLoading?: boolean;
}

const AdminEntityListItem = memo(
    ({
        activeTab,
        entity,
        isSelected,
        onSelect,
        now,
    }: {
        activeTab: AdminTabKey;
        entity: AdminEntity;
        isSelected: boolean;
        onSelect: (id: string) => void;
        now: number;
    }) => {
        return (
            <button
                className={isSelected ? styles.selectedItem : styles.listItem}
                type="button"
                onClick={() => onSelect(entity.id)}
            >
                {activeTab === 'users' ? (
                    (() => {
                        const user = entity as Extract<AdminEntity, { username: string }>;
                        const warn = getWarnBadge(user.activeWarningsCount ?? 0);
                        return (
                            <>
                                {user.pfpUrl ? (
                                    <img alt="" className={styles.rowAvatar} src={user.pfpUrl} />
                                ) : (
                                    <span className={styles.rowAvatarFallback}>
                                        {user.username.slice(0, 1)}
                                    </span>
                                )}
                                <span className={styles.itemLabel}>{user.username}</span>
                                {getUserBadges(user, now).map((badge) => (
                                    <span className={styles.userBadge} key={badge}>
                                        {badge}
                                    </span>
                                ))}
                                <span className={`${styles.warnBadge} ${styles[warn.level]}`}>
                                    {warn.label}
                                </span>
                                <span className={styles.rowStats}>
                                    {user.aura ?? 0} / {user.debt ?? 0}
                                </span>
                            </>
                        );
                    })()
                ) : (
                    <span className={styles.itemLabel}>{getEntityLabel(activeTab, entity)}</span>
                )}
            </button>
        );
    },
);

export const AdminEntityList = memo(
    ({
        activeTab,
        currentItems,
        selectedId,
        onSelect,
        isFetching = false,
        isInitialLoading = false,
    }: AdminEntityListProps) => {
        const [now, setNow] = useState(0);
        useEffect(() => {
            const updateNow = () => setNow(Date.now());
            updateNow();
            const intervalId = window.setInterval(updateNow, 60_000);
            return () => window.clearInterval(intervalId);
        }, []);

        return (
            <div className={styles.entityList} aria-busy={isFetching}>
                {isFetching && <span className={styles.fetchingBar} />}
                {isInitialLoading &&
                    Array.from({ length: 6 }, (_, index) => (
                        <span className={styles.skeletonRow} key={index} />
                    ))}
                {!isInitialLoading && !isFetching && currentItems.length === 0 && (
                    <div className={styles.emptyList}>no chuds found. lower the standards.</div>
                )}

                {currentItems.map((entity) => (
                    <AdminEntityListItem
                        key={entity.id}
                        activeTab={activeTab}
                        entity={entity}
                        isSelected={selectedId === entity.id}
                        onSelect={onSelect}
                        now={now}
                    />
                ))}
            </div>
        );
    },
);
