import type { AdminAuditLog } from '../../api/admin/types.ts';

export function auditSentence(item: AdminAuditLog) {
    const actor = item.admin?.username ?? 'unknown admin';
    const target = item.targetLabel ?? item.targetType ?? 'something';
    const action = item.actionKey ?? item.action;
    const details = item.details ?? {};
    const before = details.before as Record<string, unknown> | undefined;
    const after = details.after as Record<string, unknown> | undefined;
    let verb = 'did something to';
    let detail: string | null = null;

    switch (action) {
        case 'user.ban':
            verb = 'banned';
            break;
        case 'user.unban':
            verb = 'unbanned';
            break;
        case 'user.warn':
            verb = 'warned';
            detail = typeof details.reason === 'string' ? `“${details.reason}”` : null;
            break;
        case 'user.warn_revoke':
            verb = 'revoked a warning for';
            break;
        case 'user.modifiers': {
            verb = 'changed';
            const auraBefore = before?.aura as number | undefined;
            const auraAfter = after?.aura as number | undefined;
            if (auraBefore !== undefined && auraAfter !== undefined)
                detail = `aura ${auraBefore} → ${auraAfter}`;
            break;
        }
        case 'user.vaporize':
            verb = 'vaporized';
            break;
        case 'room.approve':
            verb = 'approved';
            break;
        case 'room.reject':
            verb = 'rejected';
            detail = typeof details.reason === 'string' ? `“${details.reason}”` : null;
            break;
        case 'room.quarantine':
            verb = 'quarantined';
            detail = typeof details.reason === 'string' ? `“${details.reason}”` : null;
            break;
        case 'room.unquarantine':
            verb = 'unquarantined';
            break;
        case 'room.status':
            verb = 'changed the status of';
            break;
        case 'message.delete':
            verb = 'deleted';
            break;
    }

    return { actor, verb, target, detail };
}
