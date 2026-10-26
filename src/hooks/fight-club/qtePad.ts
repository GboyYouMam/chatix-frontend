export const buildPadKeys = (correct: string, random: () => number, size = 6): string[] => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((key) => key !== correct);
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const keys = [correct, ...letters.slice(0, size - 1)];
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    return keys;
};
