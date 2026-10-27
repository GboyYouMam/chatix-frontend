import { Modal } from '../ui/Modal.tsx';
import type { AchievementCatalogItem } from '../../api/achievements/types.ts';
import { MedalIcon } from './MedalIcon.tsx';
import styles from './MedalBook.module.css';

const categories = ['aura', 'debt', 'fight', 'rooms', 'social', 'moderation', 'secret'] as const;

export function MedalBook({
    isOpen,
    onClose,
    catalog,
    unlockedKeys,
}: {
    isOpen: boolean;
    onClose: () => void;
    catalog: AchievementCatalogItem[];
    unlockedKeys: string[];
}) {
    const unlocked = new Set(unlockedKeys);
    return (
        <Modal isOpen={isOpen} onClose={onClose} label="medal book">
            <div className={styles.book}>
                <header className={styles.header}>
                    <h2>MEDAL BOOK</h2>
                    <button onClick={onClose} aria-label="close medal book">
                        ×
                    </button>
                </header>
                {categories.map((category) => {
                    const medals = catalog.filter((medal) => medal.category === category);
                    if (!medals.length) return null;
                    return (
                        <section className={styles.category} key={category}>
                            <h3>{category.replace('_', ' ')}</h3>
                            <div className={styles.grid}>
                                {medals.map((medal) => {
                                    const earned = unlocked.has(medal.key);
                                    const secret = !earned && medal.tier === 'secret';
                                    return (
                                        <article
                                            className={`${styles.medal} ${earned ? '' : styles.locked}`}
                                            key={medal.key}
                                        >
                                            <span className={styles.icon}>
                                                <MedalIcon
                                                    def={medal}
                                                    earned={earned}
                                                    width={40}
                                                    height={64}
                                                />
                                            </span>
                                            <div>
                                                <strong>
                                                    {earned || !secret ? medal.name : '???'}
                                                </strong>
                                                <p>
                                                    {secret
                                                        ? 'secret. go find it.'
                                                        : medal.description}
                                                </p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </Modal>
    );
}
