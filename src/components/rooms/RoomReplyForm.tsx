import { useState } from 'react';
import { Socket } from 'socket.io-client';
import styles from '../../pages/Rooms/Room.module.css';
import { RoomSocketEvent } from "../../hooks/useRoomSocket.ts";

interface RoomReplyFormProps {
    roomId: string;
    authorId: string | undefined;
    socket: Socket | null;
}

export const RoomReplyForm = ({ roomId, authorId, socket }: RoomReplyFormProps) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !authorId) return;

        try {
            socket.emit(RoomSocketEvent.sendMessage, {
                roomId,
                authorId,
                text: newMessage
            });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to yap via socket:', error);
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