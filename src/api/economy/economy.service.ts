import { api } from '../client.ts';
import type { LeaderboardResponse, LeaderboardWeek, StimulusResponse } from './types.ts';

export const economyApi = {
    claimStimulus: async (): Promise<StimulusResponse> =>
        (await api.post('/economy/stimulus')).data,

    getLeaderboard: async (week: LeaderboardWeek): Promise<LeaderboardResponse> =>
        (await api.get('/economy/leaderboard', { params: { week } })).data,
};
