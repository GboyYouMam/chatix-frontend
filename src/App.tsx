import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import {ProtectedRoute} from "./components/ProtectedRouter.tsx";
import { Rooms } from './pages/Rooms/Rooms';
import { PATH } from "./utils/pathList.ts"

const router = createBrowserRouter([
    { path: PATH.root.home, element: <Navigate to={PATH.rooms.rooms} replace /> },
    {
        path: PATH.authAndUser.login,
        lazy: async () => {
            const { Login } = await import('./pages/Auth/Login.tsx');
            return { Component: Login };
        },
    },
    {
        path: PATH.authAndUser.register,
        lazy: async () => {
            const { Register } = await import('./pages/Auth/Register.tsx');
            return { Component: Register };
        },
    },
    {
        path: PATH.authAndUser.profile,
        lazy: async () => {
            const { Profile } = await import('./pages/Profile/Profile.tsx');
            return { Component: Profile };
        },
    },
    { path: PATH.rooms.rooms, element: <Rooms /> },

    {
        element: <ProtectedRoute />,
        children: [
            {
                path: PATH.rooms.room,
                lazy: async () => {
                    const { Room } = await import('./pages/Rooms/Room.tsx');
                    return { Component: Room };
                },
            },
            {
                path: PATH.rooms.joinRoom,
                lazy: async () => {
                    const { JoinRoom } = await import('./pages/Rooms/JoinRoom.tsx');
                    return { Component: JoinRoom };
                },
            },
            {
                path: PATH.authAndUser.editProfile,
                lazy: async () => {
                    const { EditProfile } = await import('./pages/Profile/EditProfile.tsx');
                    return { Component: EditProfile };
                },
            },
        ]
    },
    {
        element: <ProtectedRoute requireAdmin />,
        children: [
            {
                path: PATH.admin.adminDashboard,
                lazy: async () => {
                    const { AdminDashboard } = await import('./pages/Admin/AdminDashboard.tsx');
                    return { Component: AdminDashboard };
                }
            },
            {
                path: PATH.admin.adminUserPanel,
                lazy: async () => {
                    const { AdminUserPage } = await import('./pages/Admin/AdminUserPage.tsx');
                    return { Component: AdminUserPage };
                }
            },
            {
                path:  PATH.admin.adminRoomPanel,
                lazy: async () => {
                    const { AdminRoomPage } = await import('./pages/Admin/AdminRoomPage.tsx');
                    return { Component: AdminRoomPage };
                }
            },
            {
                path:  PATH.admin.adminMessagePanel,
                lazy: async () => {
                    const { AdminMessagesPage } = await import('./pages/Admin/AdminMessagesPage.tsx');
                    return { Component: AdminMessagesPage };
                }
            },
        ],
    },

    { path: PATH.root.notFound, element: <Navigate to={PATH.rooms.rooms} replace /> }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;