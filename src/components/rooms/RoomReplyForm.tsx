import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import styles from '../../pages/Rooms/Room.module.css';
import { getAttachmentSelectionError, MAX_ATTACHMENTS } from './attachments.ts';

interface RoomReplyFormProps {
    roomId: string;
    authorId: string | undefined;
    onSendMessage: (payload: { roomId: string; text: string; attachments: File[] }) => Promise<void>;
}

export const RoomReplyForm = ({ roomId, authorId, onSendMessage }: RoomReplyFormProps) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = [...attachments, ...Array.from(event.target.files ?? [])];
        const error = getAttachmentSelectionError(files);
        if (error) {
            toast.error(error);
            event.target.value = '';
            return;
        }
        setAttachments(files);
        event.target.value = '';
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSending) return;
        if (!newMessage.trim() && !attachments.length) return;
        if (!authorId) {
            toast.error('Log in before replying.');
            return;
        }

        setIsSending(true);
        try {
            await onSendMessage({
                roomId,
                text: newMessage,
                attachments,
            });
            setNewMessage('');
            setAttachments([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
            toast.error('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={styles.replyFormContainer}>
            {attachments.length > 0 && (
                <div className={styles.selectedFiles}>
                    {attachments.map((file, index) => (
                        <span className={styles.selectedFile} key={`${file.name}-${file.lastModified}`}>
                            {file.name}
                            <button
                                type="button"
                                aria-label={`Remove ${file.name}`}
                                onClick={() => setAttachments((files) => files.filter((_, i) => i !== index))}
                            >
                                x
                            </button>
                        </span>
                    ))}
                </div>
            )}
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
                <input
                    ref={fileInputRef}
                    className={styles.fileInput}
                    type="file"
                    multiple
                    onChange={handleFilesSelected}
                />
                <button
                    type="button"
                    className={styles.attachBtn}
                    aria-label={`Attach up to ${MAX_ATTACHMENTS} files`}
                    title={`Attach files (${attachments.length}/${MAX_ATTACHMENTS})`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="lucide lucide-paperclip">
                        <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829L18.828 9A4 4 0 0 0 13.172 3.343l-8.415 8.414a6 6 0 0 0 8.486 8.486l8.414-8.414" />
                    </svg>
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSending}>
                    {isSending ? 'SENDING...' : 'REPLY'}
                </button>
            </form>
        </div>
    );
};
