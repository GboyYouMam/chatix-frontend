import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Rooms } from './pages/Rooms/Rooms';
import { Profile } from "./pages/Profile/Profile";
import { EditProfile } from './pages/Profile/EditProfile';
import { ProtectedRoute } from "./components/ProtectedRouter";
import { Room } from "./pages/Rooms/Room";
import { JoinRoom } from "./pages/Rooms/JoinRoom";
import { PATH } from "./utils/pathList.ts"

const router = createBrowserRouter([
    { path: PATH.root.home, element: <Navigate to={PATH.rooms.rooms} replace /> },
    { path: PATH.authAndUser.login, element: <Login /> },
    { path: PATH.authAndUser.register, element: <Register /> },
    { path: PATH.authAndUser.profile, element: <Profile /> },
    { path: PATH.rooms.rooms, element: <Rooms /> },

    {
        element: <ProtectedRoute />,
        children: [
            { path: PATH.rooms.room, element: <Room /> },
            { path: PATH.rooms.joinRoom, element: <JoinRoom /> },
            { path: PATH.authAndUser.editProfile, element: <EditProfile /> },
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
