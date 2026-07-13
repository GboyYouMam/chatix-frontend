import type { MessageData } from '../../api/messages/types.ts';
import styles from '../../pages/Rooms/Room.module.css';

export const MessageFormatter = ({
    text,
    allMessages,
}: {
    text: string;
    allMessages: MessageData[];
}) => {
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
                    const quotedMsg = allMessages.find((message) => message.id.endsWith(shortId));
                    const scrollToQuotedMessage = () => handleScroll(shortId);

                    return (
                        <span
                            key={i}
                            className={styles.quoteLink}
                            onClick={scrollToQuotedMessage}
                            onKeyDown={(event) => {
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                scrollToQuotedMessage();
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            {part}

                            {quotedMsg && (
                                <div className={styles.quotePopup}>
                                    <div className={styles.popupMeta}>
                                        No.{shortId} {quotedMsg.author?.username ?? 'Anon'}
                                    </div>
                                    <div className={styles.popupText}>
                                        {quotedMsg.cipherText ?? '[empty message]'}
                                    </div>
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
