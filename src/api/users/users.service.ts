import { api } from "../client.ts";
import type {
    CreateProfileCommentResponse,
    ProfileComment,
    ProfileData,
    RespectProfileResponse,
} from "./types.ts";

export const usersApi = {
    getProfile: async (username: string): Promise<ProfileData> => {
        const response = await api.get(`/users/profile/${username}`);
        return response.data;
    },

    farmAura: async (): Promise<{ aura: number }> => {
        const response = await api.post("/users/farm-aura");
        return response.data;
    },

    payDebt: async (): Promise<{ debt: number }> => {
        const response = await api.post("/users/pay-debt");
        return response.data;
    },

    respectProfile: async (username: string): Promise<RespectProfileResponse> => {
        const response = await api.post(`/users/profile/${username}/respect`);
        return response.data;
    },

    getProfileComments: async (username: string): Promise<ProfileComment[]> => {
        const response = await api.get(`/users/profile/${username}/comments`);
        return response.data;
    },

    createProfileComment: async (
        username: string,
        body: string,
    ): Promise<CreateProfileCommentResponse> => {
        const response = await api.post(`/users/profile/${username}/comments`, { body });
        return response.data;
    },
};
