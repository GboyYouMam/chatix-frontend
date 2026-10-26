import { playVineBoom } from './vineBoom.ts';
import styles from './VineBoomButton.module.css';

export const VineBoomButton = () => (
    <button type="button" className={styles.btn} onClick={playVineBoom}>
        vine boom
    </button>
);
