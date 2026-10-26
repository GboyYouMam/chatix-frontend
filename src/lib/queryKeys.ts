export const queryKeys = {
    rooms: (publicity?: string) =>
        publicity ? (['rooms', publicity] as const) : (['rooms'] as const),
    room: (id?: string) => ['room', id] as const,
    myRooms: () => ['myRooms'] as const,
    messages: (roomId?: string) => ['messages', roomId] as const,
    profile: (username?: string) => ['profile', username] as const,
    shopCatalog: () => ['shop', 'catalog'] as const,
    shopMe: () => ['shop', 'me'] as const,
};
