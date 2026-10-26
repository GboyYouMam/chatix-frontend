import { useQuery } from '@tanstack/react-query';
import { achievementsApi } from '../../api/achievements/achievements.service.ts';
import styles from './FeaturedMedals.module.css';

export function FeaturedMedals({ keys = [] }: { keys?: string[] }) {
    const { data: catalog = [] } = useQuery({
        queryKey: ['achievementCatalog'],
        queryFn: achievementsApi.getCatalog,
        staleTime: Infinity,
    });
    if (!keys.length) return null;
    return (
        <span className={styles.featured} aria-label="featured medals">
            {keys.slice(0, 3).map((key) => {
                const medal = catalog.find((item) => item.key === key);
                return (
                    <span key={key} title={medal?.name ?? 'medal'}>
                        {medal?.icon || '✦'}
                    </span>
                );
            })}
        </span>
    );
}
