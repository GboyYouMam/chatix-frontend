import { api } from '../client.ts';
import type { AchievementCatalogItem } from './types.ts';

export const achievementsApi = {
    getCatalog: async (): Promise<AchievementCatalogItem[]> =>
        (await api.get('/achievements/catalog')).data,
    setFeatured: async (keys: string[]): Promise<void> => {
        await api.patch('/users/me/featured-achievements', { keys });
    },
    discover: async (key: string): Promise<void> => {
        await api.post('/achievements/discover', { key });
    },
};
