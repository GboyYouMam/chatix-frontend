import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { DetailsPanelProps } from '../adminPanelTypes.ts';

export const AdminDetailsPanel = ({ selectedEntity }: DetailsPanelProps) => {
    return (
        <div className={styles.detailsPanel}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.panelTitle}>Selected Details</h2>
                {selectedEntity && <span className={styles.sectionNote}>{selectedEntity.id}</span>}
            </div>

            {selectedEntity ? (
                <pre className={styles.jsonDump}>
                    {JSON.stringify(selectedEntity, null, 2)}
                </pre>
            ) : (
                <p className={styles.placeholderText}>Select an item to inspect it.</p>
            )}
        </div>
    );
};
