import { useAuthStore } from '../store/authStore'
import { HiOutlineMail, HiOutlineUser, HiOutlineShieldCheck, HiOutlineClock } from 'react-icons/hi'

export default function ProfilePage() {
    const { user } = useAuthStore()

    if (!user) return null

    return (
        <div className="max-w-xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

            <div className="glass rounded-2xl p-8">
                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8 pb-6 border-b border-surface-700/30">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20">
                        {user.email[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {user.full_name || user.email.split('@')[0]}
                        </h2>
                        <p className="text-surface-200/50 text-sm mt-1">{user.email}</p>
                        <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${user.role === 'ADMIN'
                                ? 'bg-amber-500/10 text-amber-300'
                                : 'bg-brand-500/10 text-brand-300'
                            }`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-5">
                    <ProfileRow
                        icon={HiOutlineMail}
                        label="Email"
                        value={user.email}
                    />
                    <ProfileRow
                        icon={HiOutlineUser}
                        label="Full Name"
                        value={user.full_name || 'Not set'}
                    />
                    <ProfileRow
                        icon={HiOutlineShieldCheck}
                        label="Role"
                        value={user.role}
                    />
                    <ProfileRow
                        icon={HiOutlineClock}
                        label="Member Since"
                        value={new Date(user.created_at).toLocaleDateString()}
                    />
                </div>
            </div>
        </div>
    )
}

function ProfileRow({
    icon: Icon,
    label,
    value,
}: {
    icon: any
    label: string
    value: string
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-800/50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-surface-200/40" />
            </div>
            <div>
                <p className="text-xs text-surface-200/40">{label}</p>
                <p className="text-sm text-white">{value}</p>
            </div>
        </div>
    )
}
