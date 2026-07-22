import { href } from "react-router-dom";

const PATH_PATTERNS = {
    root: {
        home: "/",
        notFound: "*",
    },
    authAndUser: {
        login: "/login",
        register: "/register",
        chat: "/chat",
        profile: "/profile/:username",
        editProfile: "/settings",
    },
    rooms: {
        rooms: "/rooms",
        room: "/room/:id",
        joinRoom: "/room/:id/join",
    },
    admin: {
        adminDashboard: "/admin",
        adminUserPanel: "/admin/users/:userId",
        adminRoomPanel: "/admin/rooms/:roomId",
        adminMessagePanel: "/admin/messages",
    },
} as const;

export const PATH = {
    ...PATH_PATTERNS,
    authAndUser: {
        ...PATH_PATTERNS.authAndUser,
        href: {
            profile: (username: string) => href(PATH_PATTERNS.authAndUser.profile, { username }),
        },
    },
    rooms: {
        ...PATH_PATTERNS.rooms,
        href: {
            room: (id: string | number) => href(PATH_PATTERNS.rooms.room, { id: String(id) }),
            joinRoom: (id: string | number) => href(PATH_PATTERNS.rooms.joinRoom, { id: String(id) }),
        },
    },
    admin: {
        ...PATH_PATTERNS.admin,
        href: {
            userPanel: (userId: string | number) =>
                href(PATH_PATTERNS.admin.adminUserPanel, { userId: String(userId) }),
            roomPanel: (roomId: string | number) =>
                href(PATH_PATTERNS.admin.adminRoomPanel, { roomId: String(roomId) }),
        },
    },
} as const;
