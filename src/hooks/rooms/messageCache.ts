import type { InfiniteData } from '@tanstack/react-query';
import type { MessageData, MessagePage } from '../../api/messages/types.ts';

export const DELETED_MESSAGE = 'GOT DELETED LMAO CRY ABOUT IT';

export const appendMessageToPages = (
    old: InfiniteData<MessagePage, string | null> | undefined,
    message: MessageData,
) => {
    if (!old || old.pages.some((page) => page.items.some((item) => item.id === message.id)))
        return old;
    const pages = old.pages.length
        ? [{ ...old.pages[0], items: [...old.pages[0].items, message] }, ...old.pages.slice(1)]
        : [{ items: [message], nextCursor: null }];
    return { ...old, pages };
};

export const markMessageDeleted = (
    old: InfiniteData<MessagePage, string | null> | undefined,
    id: string,
) =>
    old && {
        ...old,
        pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((message) =>
                message.id === id
                    ? { ...message, isDeleted: true, cipherText: DELETED_MESSAGE }
                    : message,
            ),
        })),
    };
