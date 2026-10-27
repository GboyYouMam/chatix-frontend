import { pageWindow } from './guestbookPaging.ts';
import styles from './GuestbookPager.module.css';

interface GuestbookPagerProps {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
}

// aria-disabled instead of disabled keeps focus on the control that was just used.
export const GuestbookPager = ({ page, totalPages, total, onPageChange }: GuestbookPagerProps) => {
    const go = (target: number) => {
        if (target < 1 || target > totalPages || target === page) return;
        onPageChange(target);
    };
    const atStart = page <= 1;
    const atEnd = page >= totalPages;

    return (
        <nav className={styles.pager} aria-label="guestbook pages">
            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.edge}
                    aria-disabled={atStart}
                    onClick={() => go(page - 1)}
                >
                    « prev
                </button>
                {pageWindow(page, totalPages).map((slot, index) =>
                    slot === '…' ? (
                        <span key={`gap-${index}`} className={styles.gap} aria-hidden="true">
                            …
                        </span>
                    ) : (
                        <button
                            key={slot}
                            type="button"
                            className={slot === page ? styles.current : styles.number}
                            aria-current={slot === page ? 'page' : undefined}
                            aria-label={`page ${slot}`}
                            onClick={() => go(slot)}
                        >
                            {slot === page ? `[${slot}]` : slot}
                        </button>
                    ),
                )}
                <button
                    type="button"
                    className={styles.edge}
                    aria-disabled={atEnd}
                    onClick={() => go(page + 1)}
                >
                    next »
                </button>
            </div>
            <p className={styles.summary}>
                page {page} of {totalPages} · {total} {total === 1 ? 'entry' : 'entries'} signed by
                chuds
            </p>
        </nav>
    );
};
