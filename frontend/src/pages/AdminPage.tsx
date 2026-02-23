import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/endpoints'
import toast from 'react-hot-toast'
import {
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineTrash,
    HiOutlineCalendar,
} from 'react-icons/hi'

export default function AdminPage() {
    const queryClient = useQueryClient()

    const { data: statsData } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminApi.getStats(),
    })

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminApi.getUsers(),
    })

    const stats = statsData?.data
    const users = usersData?.data || []

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteDocument(id),
        onSuccess: () => {
            toast.success('Document deleted')
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
        },
    })

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-surface-200/60 mb-8">Manage users and monitor platform statistics.</p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    {
                        label: 'Total Users',
                        value: stats?.total_users ?? '—',
                        icon: HiOutlineUsers,
                        color: 'from-blue-500 to-cyan-500',
                    },
                    {
                        label: 'Documents',
                        value: stats?.total_documents ?? '—',
                        icon: HiOutlineDocumentText,
                        color: 'from-emerald-500 to-green-500',
                    },
                    {
                        label: 'Deleted',
                        value: stats?.total_deleted_documents ?? '—',
                        icon: HiOutlineTrash,
                        color: 'from-red-500 to-rose-500',
                    },
                    {
                        label: 'Uploads Today',
                        value: stats?.uploads_today ?? '—',
                        icon: HiOutlineCalendar,
                        color: 'from-amber-500 to-orange-500',
                    },
                ].map((s) => (
                    <div key={s.label} className="glass rounded-2xl p-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}>
                            <s.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-sm text-surface-200/50 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Users table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-surface-700/30">
                    <h2 className="text-lg font-semibold text-white">All Users</h2>
                </div>
                {usersLoading ? (
                    <div className="p-5 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton rounded-lg h-12" />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-700/30">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-surface-200/40 uppercase">User</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-surface-200/40 uppercase">Role</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-surface-200/40 uppercase">Docs</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-surface-200/40 uppercase">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u: any) => (
                                    <tr
                                        key={u.id}
                                        className="border-b border-surface-700/10 hover:bg-surface-800/30 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                                    {u.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">{u.full_name || u.email}</p>
                                                    <p className="text-xs text-surface-200/40">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${u.role === 'ADMIN'
                                                    ? 'bg-amber-500/10 text-amber-300'
                                                    : 'bg-brand-500/10 text-brand-300'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-surface-200/60">
                                            {u.document_count}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-surface-200/40">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
