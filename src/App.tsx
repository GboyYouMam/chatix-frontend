import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import {ProtectedRoute} from "./components/ProtectedRouter.tsx";

const router = createBrowserRouter([
    {
        path: "/login",
        lazy: async () => {
            const { Login } = await import('./pages/Auth/Login');
            return { Component: Login };
        }
    },
    {
        path: "/register",
        lazy: async () => {
            const { Register } = await import('./pages/Auth/Register.tsx');
            return { Component: Register };
        }
    },
    {
        path: "/profile/:username",
        lazy: async () => {
            const { Profile } = await import('./pages/Profile/Profile.tsx');
            return { Component: Profile };
        }
    },
    {
        path: "/rooms",
        lazy: async () => {
            const { Rooms } = await import('./pages/Rooms/Rooms.tsx');
            return { Component: Rooms };
        }
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/room/:id",
                lazy: async () => {
                    const { Room } = await import('./pages/Rooms/Room.tsx');
                    return { Component: Room };
                }
            },
            {
                path: "/room/:id/join",
                lazy: async () => {
                    const { JoinRoom } = await import('./pages/Rooms/JoinRoom.tsx');
                    return { Component: JoinRoom };
                }
            },
            {
                path: "/settings",
                lazy: async () => {
                    const { EditProfile } = await import('./pages/Profile/EditProfile.tsx');
                    return { Component: EditProfile };
                }
            },
            {
                path: "/admin",
                lazy: async () => {
                    const { AdminPanel } = await import('./pages/Admin/AdminPanel.tsx');
                    return { Component: AdminPanel };
                }
            },
        ]
    },

    { path: "*", element: <Navigate to="/rooms" replace /> }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;