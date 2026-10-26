import { useEffect, useState } from 'react';
import { pickTagline } from './martQuotes.ts';

const ROTATE_MS = 6000;

interface RotatingTaglineProps {
    className?: string;
}

export const RotatingTagline = ({ className }: RotatingTaglineProps) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const id = window.setInterval(() => setIndex((current) => current + 1), ROTATE_MS);
        return () => window.clearInterval(id);
    }, []);

    return <p className={className}>{pickTagline(index)}</p>;
};
