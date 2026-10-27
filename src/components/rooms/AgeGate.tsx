import { useConfirmAge } from '../../hooks/users/useConfirmAge.ts';
import { Modal } from '../ui/Modal.tsx';
import styles from './AgeGate.module.css';

const AGE_BODY =
    "this room talks about stuff your mom wouldn't like (drugs, nsfw, general degeneracy). you have to be 18+ to get in. lying here is on you.";

interface AgeGateCardProps {
    onConfirmed: () => void;
    onBack: () => void;
}

// The confirm screen itself. Used inline on the room page and inside AgeGateModal in the lobby.
export const AgeGateCard = ({ onConfirmed, onBack }: AgeGateCardProps) => {
    const confirm = useConfirmAge(onConfirmed);

    return (
        <section className={styles.card} aria-labelledby="age-gate-title">
            <div className={styles.stamp} aria-hidden="true">
                18+
            </div>
            <h2 id="age-gate-title" className={styles.title}>
                adults only, chud
            </h2>
            <p className={styles.body}>{AGE_BODY}</p>
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.primary}
                    onClick={() => confirm.mutate()}
                    disabled={confirm.isPending}
                >
                    {confirm.isPending ? 'confirming...' : "i'm 18+, let me in"}
                </button>
                <button
                    type="button"
                    className={styles.ghost}
                    onClick={onBack}
                    disabled={confirm.isPending}
                >
                    nah, take me back
                </button>
            </div>
        </section>
    );
};

interface AgeGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmed: () => void;
}

export const AgeGateModal = ({ isOpen, onClose, onConfirmed }: AgeGateModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} label="adults only">
        <AgeGateCard onConfirmed={onConfirmed} onBack={onClose} />
    </Modal>
);
