import { api } from "../client.ts";
import type {
    CreateProfileCommentResponse,
    ProfileComment,
    ProfileData,
    RespectProfileResponse,
} from "./types.ts";

export const usersApi = {
    getProfile: async (username: string): Promise<ProfileData> =>
        (await api.get(`/users/profile/${username}`)).data,

    farmAura: async (): Promise<{ aura: number }> => (await api.post("/users/farm-aura")).data,

    payDebt: async (): Promise<{ debt: number }> => (await api.post("/users/pay-debt")).data,

    respectProfile: async (username: string): Promise<RespectProfileResponse> =>
        (await api.post(`/users/profile/${username}/respect`)).data,

    getProfileComments: async (username: string): Promise<ProfileComment[]> =>
        (await api.get(`/users/profile/${username}/comments`)).data,

    createProfileComment: async (
        username: string,
        body: string,
    ): Promise<CreateProfileCommentResponse> =>
        (await api.post(`/users/profile/${username}/comments`, { body })).data,
};
