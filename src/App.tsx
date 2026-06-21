import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Rooms } from './pages/Rooms/Rooms.tsx';
import { Profile } from "./pages/Profile/Profile.tsx";
import { EditProfile } from './pages/Profile/EditProfile.tsx';
import { ProtectedRoute } from "./components/ProtectedRouter.tsx";
import { Room } from "./pages/Rooms/Room.tsx";
import { JoinRoom } from "./pages/Rooms/JoinRoom.tsx";

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

    { path: "*", element: <Navigate to="/rooms" replace /> }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;