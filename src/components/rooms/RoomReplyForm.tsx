import { useState } from 'react';
import toast from 'react-hot-toast';
import styles from '../../pages/Rooms/Room.module.css';

interface RoomReplyFormProps {
    roomId: string;
    authorId: string | undefined;
    onSendMessage: (payload: { roomId: string; authorId: string; text: string }) => void;
}

export const RoomReplyForm = ({ roomId, authorId, onSendMessage }: RoomReplyFormProps) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!authorId) {
            toast.error('Log in before replying.');
            return;
        }

        try {
            onSendMessage({
                roomId,
                authorId,
                text: newMessage
            });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to yap via socket:', error);
            toast.error('Failed to send message.');
        }
    };

    return (
        <div className={styles.replyFormContainer}>
            <form className={styles.replyForm} onSubmit={handleSendMessage}>
                <textarea
                    className={styles.replyInput}
                    placeholder="Type your shit here... (click on ID of message for copying it and reply)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                />
                <button type="submit" className={styles.submitBtn}>REPLY</button>
            </form>
        </div>
    );
};