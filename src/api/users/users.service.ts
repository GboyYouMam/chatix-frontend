import { api } from '../client.ts';
import type {
    CreateProfileCommentResponse,
    ProfileComment,
    ProfileData,
    ProfileExtrasInput,
    RespectProfileResponse,
} from './types.ts';

export const usersApi = {
    getProfile: async (username: string): Promise<ProfileData> =>
        (await api.get(`/users/profile/${encodeURIComponent(username)}`)).data,

    farmAura: async (): Promise<{ aura: number }> => (await api.post('/users/farm-aura')).data,

    payDebt: async (): Promise<{ debt: number }> => (await api.post('/users/pay-debt')).data,

    respectProfile: async (username: string): Promise<RespectProfileResponse> =>
        (await api.post(`/users/profile/${encodeURIComponent(username)}/respect`)).data,

    getProfileComments: async (username: string): Promise<ProfileComment[]> =>
        (await api.get(`/users/profile/${encodeURIComponent(username)}/comments`)).data,

    createProfileComment: async (
        username: string,
        body: string,
    ): Promise<CreateProfileCommentResponse> =>
        (await api.post(`/users/profile/${encodeURIComponent(username)}/comments`, { body })).data,

    updateWidgets: async (layout: string[]): Promise<{ layout: string[] }> =>
        (await api.patch('/users/me/widgets', { layout })).data,

    updateProfileExtras: async (input: ProfileExtrasInput): Promise<unknown> =>
        (await api.patch('/users/me/profile-extras', input)).data,
};
