import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notify } from '../../lib/toast';
import { MessageFormatter } from './MessageFormatter.tsx';
import styles from '../../pages/Rooms/Room.module.css';
import type { MessageData } from '../../api/messages/types.ts';
import { PATH } from '../../utils/pathList.ts';
import { formatAttachmentSize } from './attachments.ts';
import { DELETED_MESSAGE } from '../../hooks/rooms/messageCache.ts';
import { formatDate } from '../../utils/date.ts';
import { FeaturedMedals } from '../achievements/FeaturedMedals.tsx';
import { resolveAccentColor } from '../shop/cosmeticPalette.ts';
import { glyphFor } from '../cosmetics/profileCosmetics.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { SpotlightButton } from './PerkActions.tsx';

interface RoomRepliesProps {
    roomId: string;
    messages: MessageData[];
    roomCreatorUsername: string;
}

export const RoomReplies = ({ messages, roomCreatorUsername, roomId }: RoomRepliesProps) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const messageRefs = useRef(new Map<string, HTMLDivElement>());
    const formattedDatesById = useMemo(() => {
        return new Map(
            messages.map((message) => [
                message.id,
                message.createdAt ? formatDate(message.createdAt) : 'just now',
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
            notify.error('Message not found in this thread, we lost it xddd');
        }
    };

    const handleCopyIdToReply = async (shortId: string) => {
        try {
            await navigator.clipboard.writeText(`>>${shortId} `);
            notify.success(`Copied >>${shortId} to clipboard, ready to mog`);
        } catch {
            notify.error('something went wrong');
        }
    };

    if (messages.length === 0) {
        return <div className={styles.emptyThread}>No replies yet. Be the first to mog.</div>;
    }

    return (
        <div className={styles.replies}>
            {messages.map((msg: MessageData) => {
                if (msg.kind === 'system')
                    return (
                        <div key={msg.id} className={styles.systemLine}>
                            {msg.cipherText}
                        </div>
                    );
                const shortId = msg.id.slice(-6);
                const isOwnMessage = Boolean(user) && msg.author?.username === user?.username;

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
                                style={
                                    msg.author?.cosmetics?.nameColor
                                        ? {
                                              color: resolveAccentColor(
                                                  msg.author.cosmetics.nameColor,
                                              ),
                                          }
                                        : undefined
                                }
                                onClick={() =>
                                    msg.author?.username
                                        ? navigate(
                                              PATH.authAndUser.href.profile(msg.author.username),
                                          )
                                        : null
                                }
                            >
                                {msg.author?.cosmetics?.nameIcon && (
                                    <span aria-hidden="true">
                                        {glyphFor(msg.author.cosmetics.nameIcon)}{' '}
                                    </span>
                                )}
                                {msg.author?.username || 'Anon'}
                                {msg.author?.renameCursed && ' (he/him/it/mogged)'}
                                <FeaturedMedals keys={msg.author?.featuredAchievements} />

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
                            {isOwnMessage && <SpotlightButton roomId={roomId} messageId={msg.id} />}
                        </div>

                        {msg.ipTag && <div className={styles.ipAddress}>[HOST: {msg.ipTag}]</div>}
                        {msg.cipherText && (
                            <div className={styles.postBody}>
                                {msg.isDeleted ? (
                                    DELETED_MESSAGE
                                ) : (
                                    <MessageFormatter
                                        text={msg.cipherText}
                                        allMessages={messages}
                                        onQuoteClick={handleScrollToQuote}
                                        quoteStyle={msg.author?.cosmetics?.quoteStyle}
                                    />
                                )}
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
                    </div>
                );
            })}
        </div>
    );
};
