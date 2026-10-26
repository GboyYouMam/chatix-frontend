import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import type { ShopCatalogItem, ShopCategory } from '../../api/shop/types.ts';
import { Modal } from '../../components/ui/Modal.tsx';
import { ShopItemCard } from '../../components/shop/ShopItemCard.tsx';
import { MysterySoapReveal } from '../../components/shop/MysterySoapReveal.tsx';
import { MART_TAGLINES, pickTagline } from '../../components/shop/martQuotes.ts';
import { RotatingTagline } from '../../components/shop/RotatingTagline.tsx';
import {
    canAfford,
    formatAmount,
    formatPrice,
    humanizeKey,
} from '../../components/shop/shopFormat.ts';
import { isItemEquipped } from '../../components/shop/shopSlots.ts';
import { useShopCatalog, useShopMe, useShopPurchase } from '../../hooks/shop/useShop.ts';
import { useAuthStore } from '../../store/authStore.ts';
import styles from './Shop.module.css';

const CATEGORY_TABS: Array<{ value: ShopCategory; label: string }> = [
    { value: 'profile', label: 'profile' },
    { value: 'chat', label: 'chat' },
    { value: 'troll', label: 'troll' },
    { value: 'economy', label: 'economy' },
    { value: 'theme', label: 'themes' },
];

export const Shop = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const catalogQuery = useShopCatalog();
    const meQuery = useShopMe();
    const purchase = useShopPurchase();

    const [category, setCategory] = useState<ShopCategory>('profile');
    const [pendingItem, setPendingItem] = useState<ShopCatalogItem | null>(null);
    const [revealName, setRevealName] = useState<string | null>(null);
    const [footnote, setFootnote] = useState<string>(MART_TAGLINES[0]);

    const catalog = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
    const me = meQuery.data;
    const aura = me?.aura ?? user?.aura ?? 0;
    const quantityByKey = useMemo(
        () => new Map((me?.inventory ?? []).map((entry) => [entry.itemKey, entry.quantity])),
        [me],
    );
    const nameByKey = useMemo(
        () => new Map(catalog.map((item) => [item.key, item.name])),
        [catalog],
    );
    const visibleItems = catalog.filter((item) => item.category === category);

    const handleConfirm = () => {
        if (!pendingItem) return;
        purchase.mutate(pendingItem.key, {
            onSuccess: (response) => {
                setPendingItem(null);
                if (response.granted) {
                    setRevealName(nameByKey.get(response.granted) ?? humanizeKey(response.granted));
                }
            },
        });
    };

    const openPurchase = (item: ShopCatalogItem) => {
        setFootnote(pickTagline(Math.floor(Math.random() * MART_TAGLINES.length)));
        setPendingItem(item);
    };

    const pendingAffordable = pendingItem ? canAfford(aura, pendingItem.price) : false;

    const renderGrid = () => {
        if (catalogQuery.isError) {
            return (
                <div className={styles.status}>
                    the market is closed. the soap ran out.{' '}
                    <button
                        type="button"
                        className={styles.retryBtn}
                        onClick={() => void catalogQuery.refetch()}
                    >
                        retry
                    </button>
                </div>
            );
        }
        if (catalogQuery.isLoading) {
            return <div className={styles.status}>pricing the soap...</div>;
        }
        if (visibleItems.length === 0) {
            return <div className={styles.status}>nothing here. the shelves are empty, chud.</div>;
        }
        return visibleItems.map((item) => (
            <ShopItemCard
                key={item.key}
                item={item}
                quantity={quantityByKey.get(item.key) ?? 0}
                owned={quantityByKey.has(item.key) && item.kind === 'permanent'}
                equipped={me ? isItemEquipped(me.equipped, item.key) : false}
                onBuy={openPurchase}
            />
        ));
    };

    return (
        <div className={styles.layout}>
            <header className={styles.topBar}>
                <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
                    &lt;- back
                </button>
                <div className={styles.balance} aria-label="your aura">
                    <span className={styles.balanceLabel}>your aura</span>
                    <span className={styles.balanceValue}>{formatAmount(aura)}</span>
                </div>
            </header>

            <section className={styles.hero}>
                <p className={styles.eyebrow}>est. hypergamy era</p>
                <h1 className={styles.title}>MOGGER MART</h1>
                <RotatingTagline className={styles.tagline} />
            </section>

            <nav className={styles.tabs} role="tablist" aria-label="shop categories">
                {CATEGORY_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={category === tab.value}
                        className={clsx(styles.tab, category === tab.value && styles.activeTab)}
                        onClick={() => setCategory(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <section className={styles.grid} aria-label="items">
                {renderGrid()}
            </section>

            <Modal
                isOpen={pendingItem !== null}
                onClose={() => setPendingItem(null)}
                label="confirm purchase"
            >
                {pendingItem && (
                    <div className={styles.confirm}>
                        <h2 className={styles.confirmTitle}>buy {pendingItem.name}?</h2>
                        <p className={styles.confirmPrice}>{formatPrice(pendingItem.price)}</p>
                        <p className={styles.confirmNote}>
                            {pendingAffordable
                                ? 'no refunds. no mercy. no take-backs.'
                                : `u broke. go farm. you need ${formatAmount(pendingItem.price - aura)} more.`}
                        </p>
                        <p className={styles.confirmFootnote}>{footnote}</p>
                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => setPendingItem(null)}
                            >
                                nvm
                            </button>
                            <button
                                type="button"
                                className={styles.confirmBtn}
                                disabled={!pendingAffordable || purchase.isPending}
                                onClick={handleConfirm}
                            >
                                {purchase.isPending ? 'buying...' : 'take my aura'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {revealName && (
                <MysterySoapReveal name={revealName} onClose={() => setRevealName(null)} />
            )}
        </div>
    );
};
