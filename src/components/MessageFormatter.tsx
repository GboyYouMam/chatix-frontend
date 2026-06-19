import { useState } from 'react';
import styles from '../pages/Rooms/Room.module.css';

export const MessageFormatter = ({ text, allMessages }: { text: string, allMessages: any[] }) => {
    const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);

    const handleScroll = (shortId: string) => {
        const element = document.getElementById(`post-${shortId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add(styles.highlighted);
            setTimeout(() => element.classList.remove(styles.highlighted), 2000);
        }
    };

    const parts = text.split(/(>>[a-zA-Z0-9]+)/g);

    return (
        <div className={styles.formattedText}>
            {parts.map((part, i) => {
                if (part.startsWith('>>')) {
                    const shortId = part.slice(2);

                    const quotedMsg = allMessages.find(m => m.id.endsWith(shortId));

                    return (
                        <span
                            key={i}
                            className={styles.quoteLink}
                            onClick={() => handleScroll(shortId)}
                            onMouseEnter={() => setHoveredPostId(shortId)}
                            onMouseLeave={() => setHoveredPostId(null)}
                        >
                            {part}

                            {hoveredPostId === shortId && quotedMsg && (
                                <div className={styles.quotePopup}>
                                    <div className={styles.popupMeta}>№{shortId} {quotedMsg.author.username}</div>
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