import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageFormatter } from './MessageFormatter.tsx';
import styles from '../../pages/Rooms/Room.module.css';
import type { MessageData } from '../../api/messages/types.ts';
import { PATH } from '../../utils/pathList.ts';
import { formatAttachmentSize } from './attachments.ts';

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
                message.createdAt
                    ? new Date(message.createdAt).toLocaleString('uk-UA')
                    : 'Just now',
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
            toast.error('Message not found in this thread, we lost it xddd');
        }
    };

    const handleCopyIdToReply = async (shortId: string) => {
        try {
            await navigator.clipboard.writeText(`>>${shortId} `);
            toast.success(`Copied >>${shortId} to clipboard, ready to mog`);
        } catch {
            toast.error('something went wrong');
        }
    };

    if (messages.length === 0) {
        return <div className={styles.emptyThread}>No replies yet. Be the first to mog.</div>;
    }

    return (
        <div className={styles.replies}>
            {messages.map((msg: MessageData) => {
                const shortId = msg.id.slice(-6);

                return (
                    <div
                        key={msg.id}
                        id={`post-${shortId}`}
                        ref={(node) => {
                            if (node) {
                                messageRefs.current.set(shortId, node);
                            } else {
                                messageRefs.current.delete(shortId);
                            }
                        }}
                        className={styles.replyBlock}
                    >
                        <div className={styles.postMeta}>
                            <span
                                className={styles.username}
                                onClick={() =>
                                    msg.author?.username
                                        ? navigate(
                                              PATH.authAndUser.href.profile(msg.author.username),
                                          )
                                        : null
                                }
                            >
                                {msg.author?.username || 'Anon'}

                                {msg.author?.username === roomCreatorUsername && (
                                    <span className={styles.opBadge}> [OP]</span>
                                )}

                                {msg.author?.isMogged && (
                                    <span className={styles.moggedBadge}> [MOGGED]</span>
                                )}

                                {msg.author?.forcedTitle && (
                                    <span className={styles.forcedTitle}>
                                        {' '}
                                        [{msg.author.forcedTitle}]
                                    </span>
                                )}
                            </span>
                            <span className={styles.date}>
                                {formattedDatesById.get(msg.id) ?? 'Just now'}
                            </span>
                            <span
                                className={styles.postId}
                                onClick={() => handleCopyIdToReply(shortId)}
                            >
                                №{shortId || 'ERROR'}
                            </span>
                        </div>

                        {msg.cipherText && (
                            <div className={styles.postBody}>
                                <MessageFormatter
                                    text={msg.cipherText}
                                    allMessages={messages}
                                    onQuoteClick={handleScrollToQuote}
                                />
                            </div>
                        )}

                        {msg.attachments && msg.attachments.length > 0 && (
                            <div className={styles.attachments}>
                                {msg.attachments.map((attachment) => (
                                    <figure className={styles.attachment} key={attachment.id}>
                                        <a href={attachment.url} target="_blank" rel="noreferrer">
                                            {attachment.mimeType.startsWith('image/') ? (
                                                <img
                                                    className={styles.attachmentImage}
                                                    src={attachment.url}
                                                    alt={attachment.fileName}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span className={styles.attachmentFile}>
                                                    [DOWNLOAD FILE]
                                                </span>
                                            )}
                                        </a>
                                        <figcaption className={styles.attachmentDescription}>
                                            File:{' '}
                                            <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {attachment.fileName}
                                            </a>{' '}
                                            ({formatAttachmentSize(attachment.size)},{' '}
                                            {attachment.mimeType})
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        )}

                        {msg.ipAddress && (
                            <div className={styles.ipAddress}>[HOST: {msg.ipAddress}]</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
