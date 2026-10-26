import { useEffect, useState } from 'react';

// Re-renders the caller every `intervalMs` so countdowns stay live. Disabled when `active` is false.
export const useNow = (intervalMs = 1000, active = true): number => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!active) return;
        const id = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [intervalMs, active]);
    return now;
};
