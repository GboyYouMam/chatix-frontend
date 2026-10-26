import clsx from 'clsx';
import type { ShopCatalogItem } from '../../api/shop/types.ts';
import { formatPrice, humanizeKey, MYSTERY_ODDS_TEXT } from './shopFormat.ts';
import { previewFor } from './shopPreview.ts';
import styles from './ShopItemCard.module.css';

interface ShopItemCardProps {
    item: ShopCatalogItem;
    quantity: number;
    owned: boolean;
    equipped: boolean;
    onBuy: (item: ShopCatalogItem) => void;
}

const Preview = ({ item }: { item: ShopCatalogItem }) => {
    const preview = previewFor(item);
    if (preview.kind === 'swatch') {
        return (
            <span
                className={styles.swatch}
                style={{ background: preview.color }}
                aria-hidden="true"
            />
        );
    }
    if (preview.kind === 'glyph') {
        return (
            <span className={styles.glyph} aria-hidden="true">
                {preview.glyph}
            </span>
        );
    }
    return (
        <span className={clsx(styles.text, styles[preview.variant])} aria-hidden="true">
            {preview.text}
        </span>
    );
};

export const ShopItemCard = ({ item, quantity, owned, equipped, onBuy }: ShopItemCardProps) => {
    const isPermanent = item.kind === 'permanent';
    const buyDisabled = isPermanent && owned;
    const badge = equipped
        ? 'equipped'
        : isPermanent && owned
          ? 'owned'
          : quantity > 0
            ? `x${quantity} in bag`
            : null;

    return (
        <article className={clsx(styles.card, equipped && styles.equipped)}>
            <div className={styles.preview}>
                <Preview item={item} />
            </div>
            <h3 className={styles.name}>{item.name}</h3>
            <p className={styles.description}>{item.description}</p>
            {item.requires && <p className={styles.locked}>locked: {humanizeKey(item.requires)}</p>}
            {item.key === 'mystery_soap' && <p className={styles.odds}>{MYSTERY_ODDS_TEXT}</p>}
            <div className={styles.footer}>
                <span className={styles.price}>{formatPrice(item.price)}</span>
                {badge && <span className={styles.badge}>{badge}</span>}
                <button
                    type="button"
                    className={styles.buyBtn}
                    disabled={buyDisabled}
                    onClick={() => onBuy(item)}
                >
                    {buyDisabled ? 'yours' : 'buy'}
                </button>
            </div>
        </article>
    );
};
