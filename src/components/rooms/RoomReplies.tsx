import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageFormatter } from './MessageFormatter.tsx';
import styles from '../../pages/Rooms/Room.module.css';
import type { MessageData } from "../../api/messages/types.ts";
import { PATH } from '../../utils/pathList.ts';
import { useMemo, useRef } from "react";

interface RoomRepliesProps {
    messages: MessageData[];
    roomCreatorUsername: string;
}

export const RoomReplies = ({ messages, roomCreatorUsername }: RoomRepliesProps) => {
    const navigate = useNavigate();

    const messageRefs = useRef(new Map<string, HTMLDivElement>());
    const formattedDatesById = useMemo(() => {
        return new Map(
            messages.map((message) => [
                message.id,
                message.createdAt ? new Date(message.createdAt).toLocaleString('uk-UA') : 'Just now',
            ]),
        );
    }, [messages]);

    const handleScrollToQuote = (shortId: string) => {
        const node = messageRefs.current.get(shortId);
        if (node) {
            node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            node.classList.add(styles.highlighted);
            setTimeout(() => node.classList.remove(styles.highlighted), 2000);
        } else {
            toast.error("Message not found in this thread, we lost it xddd");
        }
    };

    const handleCopyIdToReply = async (shortId: string) => {
        try {
            await navigator.clipboard.writeText(`>>${shortId} `);
            toast.success(`Copied >>${shortId} to clipboard, ready to mog`);
        } catch (error) {
            toast.error('something went wrong');
        }
    };

    if (messages?.length === 0) {
        return <div className={styles.emptyThread}>No replies yet. Be the first to mog.</div>;
    }

    return (
        <div className={styles.replies}>
            {messages?.map((msg: MessageData) => (
                <div key={msg.id} id={`post-${msg.id?.slice(-6)}`} className={styles.replyBlock}>
                    <div className={styles.postMeta}>
            {messages?.map((msg: MessageData) => {
                const shortId = msg.id?.slice(-6);

                return (
                    <div
                        key={msg.id}
                        ref={(node) => {
                            if (node && shortId) {
                                messageRefs.current.set(shortId, node);
                            } else if (shortId) {
                                messageRefs.current.delete(shortId);
                            }
                        }}
                        className={styles.replyBlock}
                    >
                        <div className={styles.postMeta}>
                        <span
                            className={styles.username}
                            onClick={() => msg.author?.username ? navigate(PATH.authAndUser.href.profile(msg.author.username)) : null}
                        >
                            {msg.author?.username || 'Anon'}

                            {msg.author?.username === roomCreatorUsername && (
                                <span className={styles.opBadge}> [OP]</span>
                            )}

                            {msg.author?.isMogged && (
                                <span className={styles.moggedBadge}> [MOGGED]</span>
                            )}

                            {msg.author?.forcedTitle && (
                                <span className={styles.forcedTitle}> [{msg.author.forcedTitle}]</span>
                            )}
                        </span>
                            <span className={styles.date}>
                            {formattedDatesById.get(msg.id) ?? 'Just now'}
                        </span>
                            <span className={styles.postId} onClick={() => handleCopyIdToReply(msg.id?.slice(-6))}>
                            №{msg.id?.slice(-6) || 'ERROR'}
                        </span>
                        </div>

                        <div className={styles.postBody}>
                            <MessageFormatter
                                text={msg.cipherText || ''}
                                allMessages={messages || []}
                                onQuoteClick={handleScrollToQuote}
                            />
                        </div>

                        {msg.ipAddress && (
                            <div className={styles.ipAddress}>
                                [HOST: {msg.ipAddress}]
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};