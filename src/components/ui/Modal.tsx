import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

export const Modal = ({
    isOpen,
    onClose,
    label,
    children,
}: {
    isOpen: boolean;
    onClose: () => void;
    label: string;
    children: ReactNode;
}) => {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const element = dialog.current;
        if (!element) return;
        if (isOpen && !element.open) element.showModal();
        if (!isOpen && element.open) element.close();
    }, [isOpen]);

    return (
        <dialog
            ref={dialog}
            aria-label={label}
            className={styles.dialog}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => event.target === event.currentTarget && onClose()}
        >
            {children}
        </dialog>
    );
};
