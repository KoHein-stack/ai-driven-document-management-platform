import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
    HiOutlineDocumentText,
    HiOutlineSearch,
    HiOutlineUpload,
    HiOutlineHome,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineShieldCheck,
} from 'react-icons/hi'

export default function AppLayout() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const navItems = [
        { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        { to: '/documents', icon: HiOutlineDocumentText, label: 'Documents' },
        { to: '/upload', icon: HiOutlineUpload, label: 'Upload' },
        { to: '/search', icon: HiOutlineSearch, label: 'Search' },
    ]

    if (user?.role === 'ADMIN') {
        navItems.push({ to: '/admin', icon: HiOutlineShieldCheck, label: 'Admin' })
    }

    return (
        <div className="flex h-screen bg-surface-950">
            {/* Sidebar */}
            <aside className="w-64 glass flex flex-col border-r border-surface-700/30">
                {/* Logo */}
                <div className="p-6 border-b border-surface-700/30">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center text-white font-bold text-lg">
                            S
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">SmartArchive</h1>
                            <p className="text-xs text-surface-200/60">Document AI Platform</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-200/80 hover:text-white hover:bg-surface-800/50 transition-all duration-200 group"
                        >
                            <Icon className="w-5 h-5 group-hover:text-brand-400 transition-colors" />
                            <span className="text-sm font-medium">{label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-surface-700/30">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.full_name || user?.email}
                            </p>
                            <p className="text-xs text-surface-200/50 capitalize">
                                {user?.role?.toLowerCase()}
                            </p>
                        </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                        <Link
                            to="/profile"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs text-surface-200/60 hover:text-white rounded-lg hover:bg-surface-800/50 transition-all"
                        >
                            <HiOutlineCog className="w-4 h-4" />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                            <HiOutlineLogout className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
