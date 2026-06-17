import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Rooms } from './pages/Rooms/Room';
import {Profile} from "./pages/Profile/Profile.tsx";
import { EditProfile } from './pages/Profile/EditProfile.tsx';
import {ProtectedRoute} from "./components/ProtectedRouter.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/profile/:username" element={<Profile />} />

                <Route path="/rooms" element={<Rooms />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/settings" element={<EditProfile />} />
                </Route>

                <Route path="*" element={<Navigate to="/rooms" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;