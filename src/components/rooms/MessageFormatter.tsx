import { useMemo, useState } from 'react';
import type { MessageData } from '../../api/messages/types.ts';
import styles from './MessageFormatter.module.css';

interface MessageFormatterProps {
    text: string;
    allMessages: MessageData[];
    onQuoteClick: (shortId: string) => void;
}

interface QuotePartProps {
    part: string;
    shortId: string;
    quotedMsg?: MessageData;
    isHovered: boolean;
    onQuoteClick: (shortId: string) => void;
    onHoverChange: (shortId: string | null) => void;
}

const QuotePart = ({
    part,
    shortId,
    quotedMsg,
    isHovered,
    onQuoteClick,
    onHoverChange,
}: QuotePartProps) => {
    return (
        <span
            className={styles.quoteLink}
            onClick={() => onQuoteClick(shortId)}
            onMouseEnter={() => onHoverChange(shortId)}
            onMouseLeave={() => onHoverChange(null)}
        >
            {part}

            {isHovered && quotedMsg && (
                <div className={styles.quotePopup}>
                    <div className={styles.popupMeta}>в„–{shortId} {quotedMsg.author?.username}</div>
                    <div className={styles.popupText}>{quotedMsg.cipherText}</div>
                </div>
            )}
        </span>
    );
};

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

                    return (
                        <QuotePart
                            key={i}
                            part={part}
                            shortId={shortId}
                            quotedMsg={messagesByShortId.get(shortId)}
                            isHovered={hoveredPostId === shortId}
                            onQuoteClick={onQuoteClick}
                            onHoverChange={setHoveredPostId}
                        />
                    );
                }

                return <span key={i}>{part}</span>;
            })}
        </div>
    );
};
