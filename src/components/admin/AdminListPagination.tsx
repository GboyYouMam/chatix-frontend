import { memo } from 'react';
import styles from '../../pages/Admin/AdminPanel.module.css';
import type { PaginationMeta } from '../../api/admin/types.ts';

interface AdminListPaginationProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
}

export const AdminListPagination = memo(({ pagination, onPageChange }: AdminListPaginationProps) => {
    const totalPages = Math.max(pagination.totalPages, 1);

    return (
        <div className={styles.paginationRow}>
            <button
                className={styles.paginationButton}
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(Math.max(pagination.page - 1, 1))}
            >
                Prev
            </button>
            <span className={styles.paginationText}>
                {pagination.page} / {totalPages}
            </span>
            <button
                className={styles.paginationButton}
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
            >
                Next
            </button>
        </div>
    );
});
