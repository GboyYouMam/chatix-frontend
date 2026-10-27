import { useRef, type KeyboardEvent } from 'react';
import styles from './ProfileTabs.module.css';

export type ProfileTab = 'widgets' | 'rooms';

const TABS: Array<{ key: ProfileTab; label: string }> = [
    { key: 'widgets', label: 'widgets' },
    { key: 'rooms', label: 'my rooms' },
];

interface ProfileTabsProps {
    value: ProfileTab;
    onChange: (tab: ProfileTab) => void;
}

export const ProfileTabs = ({ value, onChange }: ProfileTabsProps) => {
    const refs = useRef<Array<HTMLButtonElement | null>>([]);

    // Arrow keys move between tabs and select them; Home and End jump to the ends.
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        let next: number | null = null;
        if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = TABS.length - 1;
        if (next === null) return;
        event.preventDefault();
        refs.current[next]?.focus();
        onChange(TABS[next].key);
    };

    return (
        <div className={styles.tabs} role="tablist" aria-label="profile sections">
            {TABS.map((tab, index) => {
                const selected = tab.key === value;
                return (
                    <button
                        key={tab.key}
                        ref={(node) => {
                            refs.current[index] = node;
                        }}
                        id={`profile-tab-${tab.key}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls="profile-tabpanel"
                        tabIndex={selected ? 0 : -1}
                        className={selected ? styles.tabOn : styles.tab}
                        onClick={() => onChange(tab.key)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
