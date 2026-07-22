import { memo } from 'react';
import styles from '../../pages/Admin/AdminPanel.module.css';
import type { AdminEntity, AdminTabKey } from './adminPanelTypes.ts';
import { getEntityLabel } from './adminPanelUtils.ts';

interface AdminEntityListProps {
    activeTab: AdminTabKey;
    currentItems: AdminEntity[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const AdminEntityListItem = memo(({
    activeTab,
    entity,
    isSelected,
    onSelect,
}: {
    activeTab: AdminTabKey;
    entity: AdminEntity;
    isSelected: boolean;
    onSelect: (id: string) => void;
}) => {
    return (
        <button
            className={isSelected ? styles.selectedItem : styles.listItem}
            type="button"
            onClick={() => onSelect(entity.id)}
        >
            <span className={styles.itemLabel}>{getEntityLabel(activeTab, entity)}</span>
        </button>
    );
});

export const AdminEntityList = memo(({
    activeTab,
    currentItems,
    selectedId,
    onSelect,
}: AdminEntityListProps) => {
    return (
        <div className={styles.entityList}>
            {currentItems.length === 0 && (
                <div className={styles.emptyList}>No results for this view.</div>
            )}

            {currentItems.map((entity) => (
                <AdminEntityListItem
                    key={entity.id}
                    activeTab={activeTab}
                    entity={entity}
                    isSelected={selectedId === entity.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
});
