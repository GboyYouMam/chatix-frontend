import { useState } from 'react';
import clsx from 'clsx';
import { PASSWORD_EXAMPLE, PASSWORD_RULES } from './passwordRules.ts';
import styles from './PasswordHint.module.css';

interface PasswordHintProps {
    password: string;
}

// (i) inside the password field: hover/focus on desktop, tap to toggle on mobile.
export const PasswordHint = ({ password }: PasswordHintProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div className={clsx(styles.hint, open && styles.open)}>
            <button
                type="button"
                className={styles.trigger}
                aria-label="password requirements"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                onBlur={() => setOpen(false)}
            >
                i
            </button>
            <div className={styles.popover} role="tooltip">
                <p className={styles.title}>password rules, chud:</p>
                <ul className={styles.list}>
                    {PASSWORD_RULES.map((rule) => {
                        const ok = rule.test(password);
                        return (
                            <li key={rule.label} className={clsx(ok && styles.ok)}>
                                <span className={styles.mark}>{ok ? '[x]' : '[ ]'}</span>
                                {rule.label}
                            </li>
                        );
                    })}
                </ul>
                <p className={styles.example}>
                    e.g. <code>{PASSWORD_EXAMPLE}</code> (don't actually use it)
                </p>
            </div>
        </div>
    );
};
