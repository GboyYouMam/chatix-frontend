export interface User {
    id: string;
    username: string;
    role: string;
    description?: string;
    vibe?: string;
    pfp_url?: string;
    aura: number;
    debt: number;
    isClown: boolean;
    adminGlazeMode: boolean;
    canChangeProfile: boolean;
    ageConfirmed: boolean;
    bannedUntil?: string;
    yapCooldown?: string;
    upper_banner_url?: string | null;
    left_banner_url?: string | null;
    right_banner_url?: string | null;
    featuredAchievements?: string[];
}

export interface UserData {
    id?: string;
    username: string;
    isMogged?: boolean;
    is_mogged?: boolean;
    forcedTitle?: string;
    featuredAchievements?: string[];
}

export interface AuthResponse {
    access_token: string;
}
