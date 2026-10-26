const channel = (value: number): number => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (hex: string): number => {
    const bare = hex.replace('#', '');
    const full =
        bare.length === 3
            ? bare
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : bare;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

// WCAG contrast ratio between two HEX colours, from 1 to 21.
export const contrastRatio = (hexA: string, hexB: string): number => {
    const a = relativeLuminance(hexA);
    const b = relativeLuminance(hexB);
    const [light, dark] = a > b ? [a, b] : [b, a];
    return (light + 0.05) / (dark + 0.05);
};
