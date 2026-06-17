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
    bannedUntil?: string;
    yapCooldown?: string;
}

export interface AuthResponse {
    access_token: string;
}