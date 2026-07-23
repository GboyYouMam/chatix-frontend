import { useMemo, useState } from 'react';
import type { MessageData } from '../../api/messages/types.ts';
import styles from './MessageFormatter.module.css';

interface MessageFormatterProps {
    text: string;
    allMessages: MessageData[];
    onQuoteClick: (shortId: string) => void;
}

export const MessageFormatter = ({ text, allMessages, onQuoteClick }: MessageFormatterProps) => {
    const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);

    const parts = text.split(/(>>[a-zA-Z0-9]+)/g);
    const messagesByShortId = useMemo(() => {
        return new Map(allMessages.map((message) => [message.id.slice(-6), message]));
    }, [allMessages]);

    return (
        <div className={styles.formattedText}>
            {parts.map((part, i) => {
                if (part.startsWith('>>')) {
                    const shortId = part.slice(2);
                    const quotedMsg = messagesByShortId.get(shortId);
                    const isHovered = hoveredPostId === shortId;

                    return (
                        <span
                            key={i}
                            className={styles.quoteLink}
                            onClick={() => onQuoteClick(shortId)}
                            onMouseEnter={() => setHoveredPostId(shortId)}
                            onMouseLeave={() => setHoveredPostId(null)}
                        >
                            {part}

                            {isHovered && quotedMsg && (
                                <div className={styles.quotePopup}>
                                    <div className={styles.popupMeta}>{shortId} {quotedMsg.author?.username}</div>
                                    <div className={styles.popupText}>{quotedMsg.cipherText}</div>
                                </div>
                            )}
                        </span>
                    );
                }

                return <span key={i}>{part}</span>;
            })}
        </div>
    );
};