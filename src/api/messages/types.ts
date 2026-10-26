import type { UserData } from '../auth/types.ts';

export interface MessageAttachment {
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
}

export interface MessageData {
    id: string;
    cipherText?: string;
    ipTag?: string;
    isDeleted?: boolean;
    createdAt: string | Date;
    author?: UserData & { featuredAchievements?: string[] };
    attachments?: MessageAttachment[];
    authorId?: string;
}

export interface MessagePage {
    items: MessageData[];
    nextCursor: string | null;
}
