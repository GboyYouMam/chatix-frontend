import type { User } from '../auth/types.ts';
import type { AdminWarning } from '../admin/types.ts';

export interface ProfileCommentAuthor {
    id: string;
    username: string;
    pfp_url?: string | null;
}

export interface ProfileComment {
    id: string;
    profileUserId?: string;
    authorId?: string;
    body: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
    author?: ProfileCommentAuthor;
}

export interface ProfileEffect {
    kind: 'clown_stamp' | 'rename_curse';
    expiresAt: string;
    appliedBy: { username: string };
}

export interface ProfileData extends User {
    effects?: ProfileEffect[];
    cosmetics?: ProfileCosmetics | null;
    achievements?: Array<{ key: string; unlockedAt: string }>;
    featuredAchievements?: string[];
    fightTitle?: string | null;
    activeWarnings?: { reason: string; createdAt: string }[];
    created_at: string;
    admin_glaze_mode?: boolean;
    is_clown?: boolean;
    isMogged?: boolean;
    forcedTitle?: string | null;
    respectCount?: number;
    respect_count?: number;
    hasRespected?: boolean;
    comments?: ProfileComment[];
    warnsCount?: number;
    warns_count?: number;
    bannedUntill?: string | null;
    warnings?: Array<AdminWarning | string>;
    warns?: Array<AdminWarning | string>;
    warningReasons?: string[];
    widgets?: ProfileWidgets;
}

export interface RespectProfileResponse {
    message?: string;
    respected: boolean;
    respectCount: number;
    alreadyRespected?: boolean;
}

export interface ProfileCommentsPage {
    items: ProfileComment[];
    page: number;
    limit: number;
    total: number;
}

export interface CreateProfileCommentResponse {
    message?: string;
    comment_id: string;
}

export interface ProfileCosmetics {
    accent?: string | null;
    background?: string | null;
    title?: string | null;
    nameColor?: string | null;
    nameIcon?: string | null;
    quoteStyle?: string | null;
    verified?: boolean;
    vineBoom?: boolean;
}

export interface RapSheetEntry {
    reason: string;
    at?: string | null;
}

export interface ProfileWidgetData {
    nowPlaying: { provider: 'spotify' | 'soundcloud'; embedUrl: string; url: string } | null;
    auraChart: Array<{ day: string; aura: number | string }>;
    fightRecord: {
        wins: number;
        losses: number;
        streak: number;
        last: { opponent: string; won: boolean; at: string } | null;
    };
    topGlazers: Array<{ username: string; pfp_url?: string | null }>;
    debt: number;
    yapStats: {
        messages: number;
        topRooms: Array<{ title: string; count: number }>;
        mostCookedTake: { excerpt: string; replies: number } | null;
    };
    status: { text: string; setAt: string } | null;
    rapSheet: { warns: RapSheetEntry[]; bans: RapSheetEntry[] };
    hitCount: number;
}

export interface ProfileWidgets {
    layout: string[];
    data: ProfileWidgetData;
}

export interface ProfileExtrasInput {
    trackUrl?: string | null;
    statusText?: string | null;
}
