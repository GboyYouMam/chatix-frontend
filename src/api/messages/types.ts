import type {UserData} from "../auth/types.ts";
export interface MessageData {
    id: string;
    cipherText?: string;
    ipAddress?: string;
    createdAt: string | Date;
    author?: UserData;
}