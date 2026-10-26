import { useEffect, useId, useRef } from 'react';
import styles from './AdminConfirmDialog.module.css';

interface AdminConfirmDialogProps {
    title: string;
    body: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function AdminConfirmDialog({
    title,
    body,
    confirmLabel,
    onConfirm,
    onCancel,
}: AdminConfirmDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const titleId = useId();

    useEffect(() => {
        cancelRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onCancel]);

    return (
        <div className={styles.dialogBackdrop}>
            <section
                aria-labelledby={titleId}
                aria-modal="true"
                className={styles.confirmDialog}
                role="dialog"
            >
                <h2 className={styles.panelTitle} id={titleId}>
                    {title}
                </h2>
                <p>{body}</p>
                <div className={styles.dialogActions}>
                    <button
                        className={styles.actionBtnSafe}
                        onClick={onCancel}
                        ref={cancelRef}
                        type="button"
                    >
                        nah
                    </button>
                    <button className={styles.actionBtnDanger} onClick={onConfirm} type="button">
                        {confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    );
}
