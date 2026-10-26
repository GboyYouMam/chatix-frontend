import farmEffectGif from '../../assets/auraFarmingGif.gif';
import payingDebtGif from '../../assets/payingDebtGif.gif';
import styles from './ProfileEffectsOverlay.module.css';

interface ProfileEffectsOverlayProps {
    activeEffect: 'aura' | 'debt' | null;
}

export const ProfileEffectsOverlay = ({ activeEffect }: ProfileEffectsOverlayProps) => {
    if (!activeEffect) return null;

    return (
        <div className={styles.gifOverlay}>
            <img
                src={activeEffect === 'aura' ? farmEffectGif : payingDebtGif}
                alt={activeEffect === 'aura' ? 'Aura Level Up' : 'Debt Paid'}
                className={styles.farmGif}
            />
            <div className={styles.auraText}>
                {activeEffect === 'aura' ? 'AURA +1' : 'DEBT -1'}
            </div>
        </div>
    );
};
