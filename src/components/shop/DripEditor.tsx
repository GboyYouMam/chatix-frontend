import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type { ShopCatalogItem, ShopEquipSlot, ShopMe } from '../../api/shop/types.ts';
import { useShopCatalog, useShopEquip, useShopMe } from '../../hooks/shop/useShop.ts';
import { PATH } from '../../utils/pathList.ts';
import { resolveAccentColor, ACCENT_PALETTE } from './cosmeticPalette.ts';
import { formatPrice } from './shopFormat.ts';
import { EMPTY_DRIP_LINE } from './martQuotes.ts';
import { isItemEquipped } from './shopSlots.ts';
import styles from './DripEditor.module.css';

interface Choice {
    id: string;
    itemKey: string | null;
    label: string;
    selected: boolean;
    owned: boolean;
    price: number | null;
    color?: string;
}

interface ChoiceGroupProps {
    legend: string;
    slot: ShopEquipSlot;
    choices: Choice[];
    busy: boolean;
    onPick: (slot: ShopEquipSlot, itemKey: string | null) => void;
}

const ChoiceGroup = ({ legend, slot, choices, busy, onPick }: ChoiceGroupProps) => (
    <fieldset className={styles.group}>
        <legend className={styles.legend}>{legend}</legend>
        <div className={styles.chips}>
            {choices.map((choice) => (
                <button
                    key={choice.id}
                    type="button"
                    aria-pressed={choice.selected}
                    disabled={busy || !choice.owned}
                    className={clsx(
                        styles.chip,
                        choice.selected && styles.chipOn,
                        !choice.owned && styles.chipLocked,
                    )}
                    onClick={() => {
                        if (!choice.selected) onPick(slot, choice.itemKey);
                    }}
                >
                    {choice.color && (
                        <span
                            className={styles.dot}
                            style={{ background: choice.color }}
                            aria-hidden="true"
                        />
                    )}
                    <span className={styles.chipLabel}>{choice.label}</span>
                    {!choice.owned && choice.price !== null && (
                        <span className={styles.price}>{formatPrice(choice.price)}</span>
                    )}
                </button>
            ))}
        </div>
    </fieldset>
);

const buildChoices = (
    items: ShopCatalogItem[],
    me: ShopMe,
    ownedKeys: Set<string>,
    fallback: { label: string; color?: string; selected: boolean },
    isSelected: (item: ShopCatalogItem) => boolean = (item) =>
        isItemEquipped(me.equipped, item.key),
): Choice[] => [
    {
        id: 'default',
        itemKey: null,
        label: fallback.label,
        selected: fallback.selected,
        owned: true,
        price: null,
        color: fallback.color,
    },
    ...items.map((item) => ({
        id: item.key,
        itemKey: item.key,
        label: item.name,
        selected: isSelected(item),
        owned: ownedKeys.has(item.key),
        price: ownedKeys.has(item.key) ? null : item.price,
        color:
            item.key.startsWith('accent_') || item.key.startsWith('namecolor_')
                ? resolveAccentColor(item.key)
                : undefined,
    })),
];

export const DripEditor = () => {
    const catalogQuery = useShopCatalog();
    const meQuery = useShopMe();
    const equip = useShopEquip();

    const catalog = catalogQuery.data ?? [];
    const me = meQuery.data;

    if (!me) {
        return (
            <section className={styles.drip}>
                <h2 className={styles.heading}>drip</h2>
                <p className={styles.note}>
                    {meQuery.isError ? 'couldnt load ur drip. unlucky.' : 'loading ur drip...'}
                </p>
            </section>
        );
    }

    const ownedKeys = new Set(me.inventory.map((entry) => entry.itemKey));
    const byPrefix = (prefix: string) => catalog.filter((item) => item.key.startsWith(prefix));
    const busy = equip.isPending;
    const onPick = (slot: ShopEquipSlot, itemKey: string | null) => equip.mutate({ slot, itemKey });

    const accentChoices = buildChoices(byPrefix('accent_'), me, ownedKeys, {
        label: 'hot pink (free)',
        color: ACCENT_PALETTE.hot_pink,
        selected: !byPrefix('accent_').some((item) => isItemEquipped(me.equipped, item.key)),
    });
    const nameColorChoices = buildChoices(byPrefix('namecolor_'), me, ownedKeys, {
        label: 'default',
        color: ACCENT_PALETTE.hot_pink,
        selected: !byPrefix('namecolor_').some((item) => isItemEquipped(me.equipped, item.key)),
    });
    const backgroundChoices = buildChoices(byPrefix('bg_'), me, ownedKeys, {
        label: 'plain',
        selected: !me.equipped.background,
    });
    const titleChoices = buildChoices(byPrefix('title_'), me, ownedKeys, {
        label: 'no title',
        selected: !me.equipped.title,
    });
    const nameIconChoices = buildChoices(byPrefix('nameicon_'), me, ownedKeys, {
        label: 'no icon',
        selected: !me.equipped.nameIcon,
    });
    const quoteChoices = buildChoices(byPrefix('quote_'), me, ownedKeys, {
        label: 'boring quotes',
        selected: !me.equipped.quoteStyle,
    });
    const verifiedChoices = buildChoices(
        byPrefix('verified_chud'),
        me,
        ownedKeys,
        { label: 'off', selected: !me.equipped.verified },
        () => me.equipped.verified,
    );

    return (
        <section className={styles.drip}>
            <h2 className={styles.heading}>drip</h2>
            <p className={styles.note}>
                every pick saves instantly. locked stuff needs aura first.{' '}
                <Link to={PATH.shop.shop} className={styles.shopLink}>
                    open the laryok shop
                </Link>
            </p>
            {me.inventory.length === 0 && <p className={styles.note}>{EMPTY_DRIP_LINE}</p>}

            <ChoiceGroup
                legend="accent"
                slot="accent"
                choices={accentChoices}
                busy={busy}
                onPick={onPick}
            />
            <ChoiceGroup
                legend="background"
                slot="background"
                choices={backgroundChoices}
                busy={busy}
                onPick={onPick}
            />
            <ChoiceGroup
                legend="title"
                slot="title"
                choices={titleChoices}
                busy={busy}
                onPick={onPick}
            />
            <ChoiceGroup
                legend="chat name colour"
                slot="nameColor"
                choices={nameColorChoices}
                busy={busy}
                onPick={onPick}
            />
            <ChoiceGroup
                legend="chat name icon"
                slot="nameIcon"
                choices={nameIconChoices}
                busy={busy}
                onPick={onPick}
            />
            <ChoiceGroup
                legend="quote style"
                slot="quoteStyle"
                choices={quoteChoices}
                busy={busy}
                onPick={onPick}
            />
            <ChoiceGroup
                legend="verified chud"
                slot="verified"
                choices={verifiedChoices}
                busy={busy}
                onPick={onPick}
            />
        </section>
    );
};
