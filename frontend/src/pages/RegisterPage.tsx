import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        setLoading(true)
        try {
            const { data: tokens } = await authApi.register({
                email,
                password,
                full_name: fullName || undefined,
            })
            // Fetch user info with the new token
            useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
            const { data: user } = await authApi.me()
            login(user, tokens.access_token, tokens.refresh_token)
            toast.success('Account created successfully!')
            navigate('/dashboard')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
            <p className="text-surface-200/60 text-sm mb-8">Start managing your documents</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-surface-200/80 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-200/80 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-200/80 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 btn-gradient text-white font-semibold rounded-xl hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                            </svg>
                            Creating account...
                        </span>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-surface-200/50">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
