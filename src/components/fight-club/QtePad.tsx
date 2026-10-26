import { useEffect, useState } from 'react';
import { buildPadKeys } from '../../hooks/fight-club/qtePad.ts';
import styles from '../../pages/Fight-Club/Duel.module.css';

interface QtePadProps {
    promptId: string | null;
    correct: string | null;
    disabled: boolean;
    onPress: (key: string) => void;
}

export const QtePad = ({ promptId, correct, disabled, onPress }: QtePadProps) => {
    const [isCoarse, setIsCoarse] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    );
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        const query = window.matchMedia('(pointer: coarse)');
        const update = () => setIsCoarse(query.matches);
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        setKeys(promptId && correct ? buildPadKeys(correct, Math.random) : []);
    }, [correct, promptId]);

    if (!isCoarse) return null;

    return (
        <div className={styles.qtePad} aria-label="touch controls">
            <p>tap the matching key. fast.</p>
            <div>
                {keys.map((key) => (
                    <button key={key} type="button" disabled={disabled} onClick={() => onPress(key)}>
                        {key}
                    </button>
                ))}
            </div>
        </div>
    );
};
