import { useMemo, useState } from 'react';
import type { MessageData } from '../../api/messages/types.ts';
import styles from './MessageFormatter.module.css';

interface MessageFormatterProps {
    text: string;
    allMessages: MessageData[];
    onQuoteClick: (shortId: string) => void;
    quoteStyle?: string | null;
}

const quoteStyleClass = (value: string | null | undefined): string | undefined => {
    switch (value?.replace(/^quote_/, '')) {
        case 'neon':
            return styles.quoteNeon;
        case 'greentext':
            return styles.quoteGreentext;
        case 'redacted':
            return styles.quoteRedacted;
        default:
            return undefined;
    }
};

export const MessageFormatter = ({
    text,
    allMessages,
    onQuoteClick,
    quoteStyle,
}: MessageFormatterProps) => {
    const styleClass = quoteStyleClass(quoteStyle);
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
                            className={`${styles.quoteLink} ${styleClass ?? ''} ${isHovered ? styles.quoteLinkExpanded : ''}`}
                            onClick={() => {
                                setHoveredPostId((current) =>
                                    current === shortId ? null : shortId,
                                );
                                onQuoteClick(shortId);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setHoveredPostId((current) =>
                                        current === shortId ? null : shortId,
                                    );
                                    onQuoteClick(shortId);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-expanded={isHovered}
                            onMouseEnter={() => setHoveredPostId(shortId)}
                            onMouseLeave={() => setHoveredPostId(null)}
                        >
                            {part}

                            {isHovered && quotedMsg && (
                                <div className={styles.quotePopup}>
                                    <div className={styles.popupMeta}>
                                        {shortId} {quotedMsg.author?.username}
                                    </div>
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
