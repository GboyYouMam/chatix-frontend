export interface ApiError {
    status: number | null;
    code: string | null;
    message: string;
    bannedUntil: string | null;
    banReason: string | null;
}

export function parseApiError(err: unknown): ApiError {
    const value = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
    const response =
        value.response && typeof value.response === 'object'
            ? (value.response as Record<string, unknown>)
            : null;
    const data =
        response?.data && typeof response.data === 'object'
            ? (response.data as Record<string, unknown>)
            : {};
    const message =
        typeof data.message === 'string'
            ? data.message
            : Array.isArray(data.message)
              ? data.message.join('; ')
              : !response && value.message
                ? 'server is cooked. try again later.'
                : 'something broke. not ur fault (probably).';
    return {
        status: typeof response?.status === 'number' ? response.status : null,
        code: typeof data.code === 'string' ? data.code : null,
        message,
        bannedUntil: typeof data.bannedUntil === 'string' ? data.bannedUntil : null,
        banReason: typeof data.banReason === 'string' ? data.banReason : null,
    };
}
