import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import { ProtectedRoute, AdminRoute, GuestRoute } from './routes/Guards'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import SearchPage from './pages/SearchPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Guest only (login/register) */}
            <Route element={<GuestRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Route>

            {/* Protected  */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/documents/:id" element={<DocumentDetailPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            {/* Admin only */}
            <Route element={<AdminRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/admin" element={<AdminPage />} />
                </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
