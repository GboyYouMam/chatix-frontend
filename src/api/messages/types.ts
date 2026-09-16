import type {UserData} from "../auth/types.ts";

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
    ipAddress?: string;
    createdAt: string | Date;
    author?: UserData;
    attachments?: MessageAttachment[];
}
