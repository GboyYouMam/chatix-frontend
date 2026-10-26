export const createTripleClickDetector = (windowMs = 1500, count = 3) => {
    let firstClickAt: number | null = null;
    let clicks = 0;

    return (now: number) => {
        if (firstClickAt === null || now - firstClickAt > windowMs) {
            firstClickAt = now;
            clicks = 1;
            return false;
        }

        clicks += 1;
        if (clicks < count) return false;
        firstClickAt = null;
        clicks = 0;
        return true;
    };
};

export const isSecretQuery = (query: string) => query.trim().toLowerCase() === 'first rule';
