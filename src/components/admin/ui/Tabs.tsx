import styles from './Tabs.module.css';

export function Tabs<T extends string>({
    items,
    active,
    onChange,
}: {
    items: readonly T[];
    active: T;
    onChange: (tab: T) => void;
}) {
    return (
        <div className={styles.tabs} role="tablist">
            {items.map((item) => (
                <button
                    aria-selected={active === item}
                    className={active === item ? styles.active : ''}
                    key={item}
                    onClick={() => onChange(item)}
                    role="tab"
                    type="button"
                >
                    {item}
                </button>
            ))}
        </div>
    );
}
