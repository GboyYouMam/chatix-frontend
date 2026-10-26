import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
    ROOM_THEME_KEYS,
    ROOM_THEME_META,
    ROOM_THEMES,
    isThemeOwned,
    themeItemKey,
    type ThemeKey,
} from '../../themes/roomThemes.ts';
import { useShopCatalog, useShopMe } from '../../hooks/shop/useShop.ts';
import { formatPrice } from '../shop/shopFormat.ts';
import { notify } from '../../lib/toast.ts';
import { PATH } from '../../utils/pathList.ts';
import styles from './ThemePicker.module.css';

interface ThemePickerProps {
    value: ThemeKey;
    onChange: (key: ThemeKey) => void;
}

export const ThemePicker = ({ value, onChange }: ThemePickerProps) => {
    const { data: shopMe } = useShopMe();
    const { data: catalog } = useShopCatalog();

    const owned = new Set(
        (shopMe?.inventory ?? []).filter((entry) => entry.quantity > 0).map((e) => e.itemKey),
    );

    const priceOf = (key: ThemeKey): number | null => {
        const itemKey = themeItemKey(key);
        if (!itemKey) return null;
        return catalog?.find((item) => item.key === itemKey)?.price ?? null;
    };

    const handlePick = (key: ThemeKey) => {
        if (!isThemeOwned(key, owned)) {
            const price = priceOf(key);
            notify.info(
                price
                    ? `locked. ${formatPrice(price)} at the mogger mart.`
                    : 'locked. go buy it at the mogger mart.',
                `theme-locked-${key}`,
            );
            return;
        }
        onChange(key);
    };

    return (
        <div className={styles.wrapper}>
            <span className={styles.label} id="room-theme-label">
                Room theme
            </span>
            <div className={styles.grid} role="radiogroup" aria-labelledby="room-theme-label">
                {ROOM_THEME_KEYS.map((key) => {
                    const vars = ROOM_THEMES[key];
                    const unlocked = isThemeOwned(key, owned);
                    const selected = value === key;
                    const swatch = {
                        '--sw-bg': vars['--room-bg'],
                        '--sw-surface': vars['--room-surface'],
                        '--sw-text': vars['--room-text'],
                        '--sw-accent': vars['--room-accent'],
                        '--sw-font': vars['--room-font-heading'],
                    } as CSSProperties;
                    const price = priceOf(key);
                    return (
                        <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`${ROOM_THEME_META[key].name}${unlocked ? '' : ', locked'}`}
                            className={clsx(
                                styles.option,
                                selected && styles.selected,
                                !unlocked && styles.locked,
                            )}
                            style={swatch}
                            onClick={() => handlePick(key)}
                        >
                            <span className={styles.preview} aria-hidden="true">
                                <span className={styles.previewTitle}>aa</span>
                                <span className={styles.previewBar} />
                            </span>
                            <span className={styles.name}>{ROOM_THEME_META[key].name}</span>
                            <span className={styles.meta}>
                                {unlocked
                                    ? selected
                                        ? 'picked'
                                        : 'unlocked'
                                    : price
                                      ? `locked · ${formatPrice(price)}`
                                      : 'locked'}
                            </span>
                        </button>
                    );
                })}
            </div>
            <p className={styles.hint}>
                {value === 'basement' ? 'basement is free. ' : ''}
                locked themes come from the{' '}
                <Link to={PATH.shop.shop} className={styles.shopLink}>
                    mogger mart
                </Link>
                .
            </p>
        </div>
    );
};
