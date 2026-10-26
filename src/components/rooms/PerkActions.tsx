import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShopMe } from '../../hooks/shop/useShop.ts';
import { useShopUse } from '../../hooks/shop/useShopUse.ts';
import { AdminConfirmDialog } from '../admin/AdminConfirmDialog.tsx';
import { PATH } from '../../utils/pathList.ts';
import { ownedCount } from './roomPerks.ts';
import type { ShopUseItemKey } from '../../api/shop/types.ts';
import styles from '../../pages/Rooms/Room.module.css';

interface PerkButtonProps {
    itemKey: ShopUseItemKey;
    label: string;
    body: string;
    variables: { roomId?: string; messageId?: string; targetUserId?: string };
    targetName?: string;
    hideWhenEmpty?: boolean;
}

// One consumable: shows how many the user holds, confirms before spending it.
export const PerkButton = ({
    itemKey,
    label,
    body,
    variables,
    targetName,
    hideWhenEmpty,
}: PerkButtonProps) => {
    const { data: shopMe } = useShopMe();
    const use = useShopUse();
    const [confirming, setConfirming] = useState(false);
    const owned = ownedCount(shopMe?.inventory, itemKey);

    if (owned === 0) {
        if (hideWhenEmpty) return null;
        return (
            <Link className={styles.actionBtn} to={PATH.shop.shop}>
                {label}: buy in the laryok shop
            </Link>
        );
    }

    return (
        <>
            <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setConfirming(true)}
                disabled={use.isPending}
            >
                {label} ×{owned}
            </button>
            {confirming && (
                <AdminConfirmDialog
                    title={`use ${label}?`}
                    body={body}
                    confirmLabel="yes, use it"
                    onCancel={() => setConfirming(false)}
                    onConfirm={() => {
                        setConfirming(false);
                        use.mutate({ itemKey, ...variables, targetName });
                    }}
                />
            )}
        </>
    );
};

export const RoomPerkActions = ({ roomId }: { roomId: string }) => (
    <div className={styles.actionRow}>
        <PerkButton
            itemKey="aura_tax"
            label="aura tax"
            body="sponsors this room for 24h. everyone sees it. no refunds."
            variables={{ roomId }}
        />
        <PerkButton
            itemKey="room_boost"
            label="room boost"
            body="puts this room first in the lobby for 1h, tagged promoted."
            variables={{ roomId }}
        />
    </div>
);

export const SpotlightButton = ({ roomId, messageId }: { roomId: string; messageId: string }) => (
    <PerkButton
        itemKey="spotlight"
        label="spotlight"
        body="pins this message on top of the room for 10 min."
        variables={{ roomId, messageId }}
        hideWhenEmpty
    />
);

export const ProfileTrollActions = ({
    targetUserId,
    targetName,
}: {
    targetUserId: string;
    targetName: string;
}) => (
    <div className={styles.actionRow}>
        <PerkButton
            itemKey="clown_stamp"
            label="clown stamp"
            body={`stamps "certified clown" on @${targetName} for 24h. they cannot take it off.`}
            variables={{ targetUserId }}
            targetName={targetName}
            hideWhenEmpty
        />
        <PerkButton
            itemKey="rename_curse"
            label="rename curse"
            body={`@${targetName} shows as "(he/him/it/mogged)" for 1h.`}
            variables={{ targetUserId }}
            targetName={targetName}
            hideWhenEmpty
        />
    </div>
);
