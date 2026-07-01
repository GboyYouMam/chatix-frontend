import type { User, UserData } from '../auth/types.ts';
import type { MessageData } from '../messages/types.ts';
import type { RoomDetails } from '../rooms/types.ts';

export const AdminRoomStatus = {active: "active", checkout: "checkout", banned: "banned", quarantined: "quarantined" } as const;
export type AdminRoomStatus = keyof typeof[keyof AdminRoomStatus]

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}

export interface AdminUser extends User {
    createdAt?: string | Date;
    created_at?: string | Date;
    warnsCount?: number;
    warns_count?: number;
    forcedTitle?: string | null;
    isMogged?: boolean;
    is_mogged?: boolean;
    admin_glaze_mode?: boolean;
    can_change_profile?: boolean;
}

export interface AdminRoom extends RoomDetails {
    status?: AdminRoomStatus;
    quarantineReason?: string | null;
    quarantinedUntil?: string | Date | null;
}

export interface AdminMessage extends MessageData {
    room?: Pick<AdminRoom, 'id' | 'title'>;
}

export interface AdminWarning {
    id: string;
    userId: string;
    adminId?: string | null;
    reason: string;
    createdAt: string | Date;
    revokedAt?: string | Date | null;
    admin?: UserData;
}

export interface AdminAuditLog {
    id: string;
    adminId?: string | null;
    action: string;
    method: string;
    path: string;
    targetType?: string | null;
    targetId?: string | null;
    statusCode: number;
    success: boolean;
    durationMs: number;
    details?: Record<string, unknown>;
    createdAt: string | Date;
    admin?: UserData;
}

export interface UpdateModifiersPayload {
    isClown?: boolean;
    isMogged?: boolean;
    adminGlazeMode?: boolean;
    canChangeProfile?: boolean;
    bannedUntil?: string | null;
    yapCooldown?: string | null;
    forcedTitle?: string | null;
    aura?: number;
    debt?: number;
}
