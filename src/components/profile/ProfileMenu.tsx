import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { PATH } from '../../utils/pathList.ts';
import styles from './ProfileMenu.module.css';

export const ProfileMenu = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const { logout } = useAuth();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);
    const menuId = useId();

    const close = (returnFocus: boolean) => {
        setOpen(false);
        if (returnFocus) triggerRef.current?.focus();
    };

    // Outside clicks and Escape close the menu.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) close(false);
        };
        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') close(true);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    // Opening the menu moves focus to the first item.
    useEffect(() => {
        if (open) itemsRef.current[0]?.focus();
    }, [open]);

    const items = [
        ...(user?.username
            ? [
                  {
                      label: 'profile',
                      run: () => navigate(PATH.authAndUser.href.profile(user.username)),
                  },
              ]
            : []),
        { label: 'laryok shop', run: () => navigate(PATH.shop.shop) },
        { label: 'leaderboard', run: () => navigate(PATH.economy.leaderboard) },
        ...(user
            ? [
                  { label: 'settings', run: () => navigate(PATH.authAndUser.editProfile) },
                  { label: 'log out', run: () => logout() },
              ]
            : [{ label: 'log in', run: () => navigate(PATH.authAndUser.login) }]),
    ];

    const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const count = items.length;
        const current = itemsRef.current.findIndex((node) => node === document.activeElement);
        let next: number | null = null;
        if (event.key === 'ArrowDown') next = (current + 1) % count;
        if (event.key === 'ArrowUp') next = (current - 1 + count) % count;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = count - 1;
        if (event.key === 'Tab') close(false);
        if (next === null) return;
        event.preventDefault();
        itemsRef.current[next]?.focus();
    };

    const choose = (run: () => void) => {
        close(false);
        run();
    };

    return (
        <div className={styles.root} ref={rootRef}>
            <button
                ref={triggerRef}
                type="button"
                className={styles.trigger}
                aria-label="profile menu"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={() => setOpen((value) => !value)}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </button>
            {open && (
                <div
                    id={menuId}
                    role="menu"
                    aria-label="profile menu"
                    className={styles.menu}
                    onKeyDown={handleMenuKeyDown}
                >
                    {items.map((item, index) => (
                        <button
                            key={item.label}
                            ref={(node) => {
                                itemsRef.current[index] = node;
                            }}
                            type="button"
                            role="menuitem"
                            className={styles.item}
                            onClick={() => choose(item.run)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
