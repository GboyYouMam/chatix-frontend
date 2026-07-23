import { memo, useCallback, useState } from 'react';
import clsx from 'clsx';
import type { StakeType } from '../../api/fight-club/types.ts';
import styles from '../../pages/Fight-Club/Lobby.module.css';

interface CreateFightModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (draft: { stakeType: StakeType; stakeAmount: number; title: string }) => void;
}

export const CreateFightModal = memo(({ isOpen, onClose, onCreate }: CreateFightModalProps) => {
    const [stakeType, setStakeType] = useState<StakeType>('aura');
    const [stakeAmount, setStakeAmount] = useState(100);
    const [title, setTitle] = useState('Paper Street appointment');

    const submit = useCallback(() => {
        if (stakeAmount <= 0) return;
        onCreate({
            stakeType,
            stakeAmount,
            title: title.trim() || 'nameless basement duel',
        });
        onClose();
    }, [onClose, onCreate, stakeAmount, stakeType, title]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>start fight</h2>
                    <button className={styles.iconBtn} onClick={onClose}>
                        x
                    </button>
                </div>

                <label>
                    Title
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>

                <div className={styles.segmented}>
                    {(['aura', 'debt'] as StakeType[]).map((type) => (
                        <button
                            key={type}
                            className={clsx(
                                styles.segmentBtn,
                                stakeType === type && styles.activeSegment,
                            )}
                            onClick={() => setStakeType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <label>
                    Stake
                    <input
                        type="number"
                        min="1"
                        value={stakeAmount}
                        onChange={(event) => setStakeAmount(Number(event.target.value))}
                    />
                </label>

                <p className={styles.modalNote}>are u winning son?</p>
                <button className={styles.primaryBtn} onClick={submit} disabled={stakeAmount <= 0}>
                    sign in soap
                </button>
            </div>
        </div>
    );
});
