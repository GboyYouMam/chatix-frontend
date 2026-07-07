import { isAxiosError } from 'axios';
import { api } from '../api/client.ts';
import type {
    PaginatedResponse,
    PaginationMeta,
} from '../api/admin/types.ts';

export interface AdminListOptions {
    page: number;
    limit?: number;
    search: string;
    enabled?: boolean;
}

export interface AdminWarningListOptions {
    selectedUserId?: string | null;
    page: number;
    limit?: number;
    search: string;
    enabled?: boolean;
}

export interface QueryParams {
    page: number;
    limit: number;
    search?: string;
}

export const EMPTY_PAGINATION: PaginationMeta = {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
};

export function getErrorMessage(error: unknown, fallback: string) {
    if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (Array.isArray(message)) return message[0] ?? fallback;
        if (typeof message === 'string') return message;
    }

    return fallback;
}

export function cleanParams({ page, limit, search }: QueryParams) {
    const normalizedSearch = search?.trim() ?? '';

    return normalizedSearch
        ? { page, limit, search: normalizedSearch }
        : { page, limit };
}

export async function getPaginated<T>(path: string, params: QueryParams) {
    const response = await api.get<PaginatedResponse<T>>(path, {
        params: cleanParams(params),
    });

    return response.data;
}
