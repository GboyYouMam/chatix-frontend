import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Rooms } from './pages/Rooms/Rooms';
import { Profile } from "./pages/Profile/Profile";
import { EditProfile } from './pages/Profile/EditProfile';
import { ProtectedRoute } from "./components/ProtectedRouter";
import { Room } from "./pages/Rooms/Room";
import { JoinRoom } from "./pages/Rooms/JoinRoom";

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/profile/:username", element: <Profile /> },
    { path: "/rooms", element: <Rooms /> },

    {
        element: <ProtectedRoute />,
        children: [
            { path: "/room/:id", element: <Room /> },
            { path: "/room/:id/join", element: <JoinRoom /> },
            { path: "/settings", element: <EditProfile /> },
        ]
    },
    {
        element: <ProtectedRoute requireAdmin />,
        children: [
            {
                path: "/admin",
                lazy: async () => {
                    const { AdminDashboard } = await import('./pages/Admin/AdminDashboard.tsx');
                    return { Component: AdminDashboard };
                }
            },
            {
                path: "/admin/users/:userId",
                lazy: async () => {
                    const { AdminUserPage } = await import('./pages/Admin/AdminUserPage.tsx');
                    return { Component: AdminUserPage };
                }
            },
            {
                path: "/admin/rooms/:roomId",
                lazy: async () => {
                    const { AdminRoomPage } = await import('./pages/Admin/AdminRoomPage.tsx');
                    return { Component: AdminRoomPage };
                }
            },
            {
                path: "/admin/messages",
                lazy: async () => {
                    const { AdminMessagesPage } = await import('./pages/Admin/AdminMessagesPage.tsx');
                    return { Component: AdminMessagesPage };
                }
            },
        ],
    },

    { path: "*", element: <Navigate to="/rooms" replace /> }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
