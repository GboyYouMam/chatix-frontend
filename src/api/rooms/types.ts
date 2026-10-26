import type { UserData } from '../auth/types.ts';

export interface CreateRoomDTO {
    title: string;
    topic?: string;
    description?: string;
    publicity?: string;
}

export type UpdateRoomDTO = Partial<CreateRoomDTO>;

export interface RoomDetails {
    id: string;
    title: string;
    topic?: string | null;
    description?: string | null;
    publicity: 'public' | 'private';
    hasPassword: boolean;
    createdAt: string | Date;
    creator: UserData;
}
