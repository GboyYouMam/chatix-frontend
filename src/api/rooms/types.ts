import type { UserData } from '../auth/types.ts';

export interface CreateRoomDTO {
    title: string;
    topic?: string;
    description?: string;
    publicity?: string;
}

export type UpdateRoomDTO = Partial<CreateRoomDTO>;

export type RoomStatus = 'active' | 'checkout' | 'quarantined' | 'banned' | 'rejected';

export interface RoomDetails {
    id: string;
    title: string;
    topic?: string | null;
    description?: string | null;
    publicity: 'public' | 'private';
    hasPassword: boolean;
    status?: RoomStatus;
    statusReason?: string | null;
    createdAt: string | Date;
    creator: UserData;
}
