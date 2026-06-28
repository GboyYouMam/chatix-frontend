import type { User } from "../auth/types.ts";
import type { AdminWarning } from "../admin/types.ts";

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

export interface ProfileData extends User {
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
}

export interface RespectProfileResponse {
    message?: string;
    respected: boolean;
    respectCount: number;
    alreadyRespected?: boolean;
}

export interface CreateProfileCommentResponse {
    message?: string;
    comment: ProfileComment;
}
