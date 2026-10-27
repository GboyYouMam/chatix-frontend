import { useId } from 'react';
import type { AchievementDef } from './ribbons.ts';
import { medalStyle, neutralPalette, shadeHex, type MedalShape } from './medalStyle.ts';

// One coordinate system for every size: 36 wide, 60 tall. Ribbon on top, medal disc centred at (18, 38).
const CX = 18;
const CY = 38;
const MEDAL_R = 16;

const round = (value: number) => Math.round(value * 100) / 100;

function starPath(outer: number, inner: number): string {
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = ((-90 + i * 36) * Math.PI) / 180;
        points.push(
            `${round(CX + radius * Math.cos(angle))} ${round(CY + radius * Math.sin(angle))}`,
        );
    }
    return `M${points.join(' L')} Z`;
}

// Laurel leaves sit on a ring; the wreath opens at top and bottom. Right side mirrors the left.
const LAUREL_LEAVES = [115, 140, 165, 195, 220, 245].flatMap((angle) =>
    [angle, 180 - angle].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return {
            cx: round(CX + 10.5 * Math.cos(rad)),
            cy: round(CY + 10.5 * Math.sin(rad)),
            rotate: round(deg + 90),
        };
    }),
);

const GLYPHS: Record<Exclude<MedalShape, 'laurel' | 'broken' | 'blank'>, string> = {
    star: starPath(9.5, 4),
    shield: 'M18 29 L25 31.5 V37 C25 42.5 22 46 18 48 C14 46 11 42.5 11 37 V31.5 Z',
    cross: 'M15.4 29 H20.6 V35.4 H27 V40.6 H20.6 V47 H15.4 V40.6 H9 V35.4 H15.4 Z',
    heart: 'M18 45 C11 40 8.5 36.5 8.5 33.5 C8.5 31 10.5 29.5 12.5 29.5 C15 29.5 17 31 18 32.8 C19 31 21 29.5 23.5 29.5 C25.5 29.5 27.5 31 27.5 33.5 C27.5 36.5 25 40 18 45 Z',
    eye: 'M8 38 Q18 27 28 38 Q18 49 8 38 Z',
};

interface MedalIconProps {
    def: Pick<AchievementDef, 'category' | 'tier' | 'icon'>;
    earned?: boolean;
    width: number;
    height: number;
    className?: string;
}

export function MedalIcon({ def, earned = true, width, height, className }: MedalIconProps) {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const style = earned
        ? medalStyle(def)
        : { ribbonStripes: neutralPalette, metal: '#3f3f46', shape: 'blank' as const, holo: false };
    const { ribbonStripes, metal, shape, holo } = style;
    const stripeWidth = 22 / ribbonStripes.length;
    const glyphFill = holo ? '#2e1065' : shadeHex(metal, -0.35);
    const bevelLight = shadeHex(metal, 0.5);

    return (
        <svg
            className={className}
            viewBox="0 0 36 60"
            width={width}
            height={height}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <radialGradient id={`${id}-metal`} cx="35%" cy="30%" r="75%">
                    <stop offset="0" stopColor={bevelLight} />
                    <stop offset="0.45" stopColor={metal} />
                    <stop offset="1" stopColor={shadeHex(metal, -0.45)} />
                </radialGradient>
                <linearGradient id={`${id}-holo`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fa4d98" />
                    <stop offset="0.35" stopColor="#c084fc" />
                    <stop offset="0.65" stopColor="#67e8f9" />
                    <stop offset="1" stopColor="#fa4d98" />
                </linearGradient>
            </defs>

            {ribbonStripes.map((color, index) => (
                <rect
                    key={`${color}-${index}`}
                    x={7 + index * stripeWidth}
                    y={0}
                    width={stripeWidth}
                    height={30}
                    fill={color}
                />
            ))}
            <rect
                x={7}
                y={0}
                width={22}
                height={30}
                fill="none"
                stroke="#000"
                strokeOpacity={0.55}
                strokeWidth={0.8}
            />

            <circle
                cx={CX}
                cy={CY}
                r={MEDAL_R}
                fill={holo ? `url(#${id}-holo)` : `url(#${id}-metal)`}
            />
            <circle
                cx={CX}
                cy={CY}
                r={MEDAL_R}
                fill="none"
                stroke="#000"
                strokeOpacity={0.5}
                strokeWidth={1}
            />
            <circle
                cx={CX}
                cy={CY}
                r={13.5}
                fill="none"
                stroke="#fff"
                strokeOpacity={0.35}
                strokeWidth={0.6}
            />

            {shape === 'laurel' &&
                LAUREL_LEAVES.map((leaf) => (
                    <ellipse
                        key={`${leaf.cx}-${leaf.cy}`}
                        cx={leaf.cx}
                        cy={leaf.cy}
                        rx={3.4}
                        ry={1.5}
                        fill={glyphFill}
                        transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                    />
                ))}

            {shape !== 'laurel' && shape !== 'broken' && shape !== 'blank' && (
                <path d={GLYPHS[shape]} fill={glyphFill} stroke={bevelLight} strokeWidth={0.4} />
            )}

            {shape === 'eye' && (
                <circle cx={CX} cy={CY} r={3.4} fill={holo ? '#18181b' : glyphFill} />
            )}

            {shape === 'broken' && (
                <>
                    <polyline
                        points="16 22 19 30 15 37 20 45 17 54"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth={1.2}
                        strokeLinejoin="round"
                    />
                    <polyline points="20 30 25 33" fill="none" stroke="#ef4444" strokeWidth={0.7} />
                </>
            )}
        </svg>
    );
}
