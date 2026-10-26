export const adminKeys = {
    all: ['admin'] as const,
    users: (params?: unknown) => ['admin', 'users', 'list', params] as const,
    user: (id?: string) => ['admin', 'users', 'detail', id] as const,
    rooms: (params?: unknown) => ['admin', 'rooms', 'list', params] as const,
    room: (id?: string) => ['admin', 'rooms', 'detail', id] as const,
    messages: (params?: unknown) => ['admin', 'messages', 'list', params] as const,
    auditLogs: (params?: unknown) => ['admin', 'audit-logs', 'list', params] as const,
    warnings: (userId?: string | null, params?: unknown) =>
        ['admin', 'warnings', userId, params] as const,
};
