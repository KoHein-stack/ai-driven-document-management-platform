import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
            {/* Animated background gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl btn-gradient mb-4 shadow-lg shadow-brand-500/30">
                        <span className="text-2xl font-bold text-white">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">SmartArchive</h1>
                    <p className="text-surface-200/60 text-sm mt-1">AI-Driven Document Management</p>
                </div>

                {/* Form container */}
                <div className="glass rounded-2xl p-8 animate-slide-up shadow-xl shadow-black/20">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
