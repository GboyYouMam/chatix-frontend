import assert from 'node:assert/strict';
import test from 'node:test';
import { auditSentence } from '../src/components/admin/auditSentence.ts';
import type { AdminAuditLog } from '../src/api/admin/types.ts';

const item = (overrides: Partial<AdminAuditLog>): AdminAuditLog => ({
    id: 'log-id',
    action: 'legacy.action',
    method: 'PATCH',
    path: '/admin/users',
    statusCode: 200,
    success: true,
    durationMs: 10,
    createdAt: '2026-10-26T00:00:00Z',
    admin: { username: 'jes95us' } as AdminAuditLog['admin'],
    ...overrides,
});

test('formats contract audit actions without exposing ids', () => {
    assert.deepEqual(
        auditSentence(
            item({
                actionKey: 'user.ban',
                targetLabel: 'tester777',
                details: {
                    before: { bannedUntil: '2026-10-26T01:00:00Z' },
                    after: { bannedUntil: '2026-10-26T01:03:00Z', banReason: 'ur eyeline' },
                },
            }),
        ),
        {
            actor: 'jes95us',
            verb: 'banned',
            target: 'tester777',
            detail: 'for 3 min — “ur eyeline”',
        },
    );
    assert.equal(
        auditSentence(
            item({
                actionKey: 'user.warn',
                targetLabel: 'chud123',
                details: { reason: 'yap less' },
            }),
        ).detail,
        '“yap less”',
    );
    assert.equal(
        auditSentence(
            item({
                actionKey: 'user.modifiers',
                targetLabel: 'chud123',
                details: { before: { aura: 1000 }, after: { aura: 950 } },
            }),
        ).detail,
        'aura 1000 → 950',
    );
    assert.deepEqual(
        auditSentence(
            item({
                actionKey: 'room.reject',
                targetLabel: 'basement',
                details: { reason: 'nope' },
            }),
        ),
        {
            actor: 'jes95us',
            verb: 'rejected',
            target: 'basement',
            detail: '“nope”',
        },
    );
    assert.equal(
        auditSentence(item({ targetType: 'room', targetId: 'raw-uuid' })).verb,
        'did something to',
    );
    assert.notEqual(
        auditSentence(item({ targetType: 'room', targetId: 'raw-uuid' })).target,
        'raw-uuid',
    );
});
