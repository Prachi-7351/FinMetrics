

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LandingPage from "./LandingPage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import RiskRadar from "./pages/RiskRadar";
import StressSimulator from "./pages/StressSimulator";
import AIRecommendations from "./pages/AIRecommendations";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Layout from "./Layouts/Layout";
import PublicLayout from "./Layouts/PublicLayout";
import AuthLayout from "./Layouts/AuthLayout";
import { AuthProvider } from "./context/AuthContext";
import Onboarding from "./pages/Onboarding";
import Data from "./pages/Data";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route path="/" element={<LandingPage />} />
                    {/* Landing (no navbar) */}
                    <Route element={<AuthLayout />} >
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/app/onboarding" element={<Onboarding />} />
                    </Route>
                    {/* All pages with navbar */}
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/risk-radar" element={<ProtectedRoute><RiskRadar /></ProtectedRoute>} />
                        <Route path="/stress-simulator" element={<ProtectedRoute><StressSimulator /></ProtectedRoute>} />
                        <Route path="/ai-recommendations" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} />
                        <Route path="/data" element={<ProtectedRoute><Data /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    </Route>

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}