import styles from './MysterySoapReveal.module.css';

interface MysterySoapRevealProps {
    name: string;
    onClose: () => void;
}

export const MysterySoapReveal = ({ name, onClose }: MysterySoapRevealProps) => (
    <div
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-label="mystery soap result"
    >
        <div className={styles.stage}>
            <div className={styles.bubble} aria-hidden="true">
                🧼
            </div>
            <p className={styles.kicker}>u pulled</p>
            <h2 className={styles.result}>{name}</h2>
            <p className={styles.note}>equip it in edit profile. or dont. ur choice, chud.</p>
            <button type="button" className={styles.closeBtn} onClick={onClose} autoFocus>
                ok, mid
            </button>
        </div>
    </div>
);
