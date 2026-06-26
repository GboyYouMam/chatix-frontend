import type {
    AdminAuditLog,
    AdminMessage,
    AdminRoom,
    AdminUser,
} from '../../api/admin/types.ts';
import type { AdminTabKey } from './adminPanelTypes.ts';

export function formatDate(value?: string | Date | null) {
    if (!value) return 'n/a';
    return new Date(value).toLocaleString('uk-UA');
}

export function getWarnCount(user: AdminUser) {
    return user.warnsCount ?? user.warns_count ?? 0;
}

export function getAdminGlazeMode(user: AdminUser) {
    return user.adminGlazeMode ?? user.admin_glaze_mode ?? false;
}

export function getCanChangeProfile(user: AdminUser) {
    return user.canChangeProfile ?? user.can_change_profile ?? false;
}

export function getEntityLabel(
    tab: AdminTabKey,
    entity: AdminUser | AdminRoom | AdminMessage | AdminAuditLog,
) {
    switch (tab) {
        case 'users': {
            const user = entity as AdminUser;
            return `[WARN ${getWarnCount(user)}] ${user.username}`;
        }
        case 'rooms': {
            const room = entity as AdminRoom;
            return `[${room.status?.toUpperCase() ?? room.publicity.toUpperCase()}] ${room.title}`;
        }
        case 'messages': {
            const message = entity as AdminMessage;
            const authorName = message.author?.username ?? 'Anon';
            const preview = message.cipherText?.slice(0, 42) ?? '[empty]';
            return `[${authorName}] ${preview}`;
        }
        case 'audit-logs': {
            const log = entity as AdminAuditLog;
            const status = log.success ? 'OK' : 'ERR';
            return `[${status}] ${log.method} ${log.path}`;
        }
    }
}

export function getLogSummary(log: AdminAuditLog) {
    const target = [log.targetType, log.targetId].filter(Boolean).join(':');
    const actor = log.admin?.username ?? log.adminId ?? 'unknown';
    return `${log.action} ${target ? `target=${target} ` : ''}admin=${actor}`;
}

export function addDuration(amount: number, unit: 'minutes' | 'hours' | 'days') {
    const value = Number.isFinite(amount) ? amount : 0;
    const now = Date.now();
    const msPerUnit = {
        minutes: 60_000,
        hours: 3_600_000,
        days: 86_400_000,
    }[unit];

    return new Date(now + Math.max(value, 0) * msPerUnit).toISOString();
}
