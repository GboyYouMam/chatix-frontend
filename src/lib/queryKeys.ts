export const queryKeys = {
    rooms: (publicity?: string) => ['rooms', publicity] as const,
    room: (id?: string) => ['room', id] as const,
    myRooms: () => ['myRooms'] as const,
    messages: (roomId?: string) => ['messages', roomId] as const,
    profile: (username?: string) => ['profile', username] as const,
};
