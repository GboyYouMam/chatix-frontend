import styles from '../../pages/Rooms/Room.module.css';

interface RoomSocketErrorScreamProps {
    message: string;
    onClose: () => void;
}

export const RoomSocketErrorScream = ({ message, onClose }: RoomSocketErrorScreamProps) => (
    <div className={styles.socketScream} role="alert">
        <div>
            <div className={styles.socketScreamTitle}>I SEE U TRYING TO YAP</div>
            <div className={styles.socketScreamText}>{message}</div>
        </div>
        <button className={styles.socketScreamClose} type="button" onClick={onClose}>
            shut it up
        </button>
    </div>
);
