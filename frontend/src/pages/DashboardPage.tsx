import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { documentsApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import {
    HiOutlineDocumentText,
    HiOutlineUpload,
    HiOutlineClock,
    HiOutlineSearch,
} from 'react-icons/hi'

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { data, isLoading } = useQuery({
        queryKey: ['documents', { page: 1, size: 5 }],
        queryFn: () => documentsApi.list({ page: 1, size: 5 }),
    })

    const docs = data?.data
    const recentDocs = docs?.items || []

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, <span className="gradient-text">{user?.full_name || user?.email?.split('@')[0]}</span>
                </h1>
                <p className="text-surface-200/60">Here's an overview of your document workspace.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    {
                        label: 'Total Documents',
                        value: docs?.total ?? '—',
                        icon: HiOutlineDocumentText,
                        color: 'from-brand-500 to-blue-600',
                    },
                    {
                        label: 'Recent Uploads',
                        value: recentDocs.length,
                        icon: HiOutlineUpload,
                        color: 'from-emerald-500 to-green-600',
                    },
                    {
                        label: 'Processing',
                        value: 0,
                        icon: HiOutlineClock,
                        color: 'from-amber-500 to-orange-600',
                    },
                    {
                        label: 'Quick Search',
                        value: '→',
                        icon: HiOutlineSearch,
                        color: 'from-purple-500 to-violet-600',
                        link: '/search',
                    },
                ].map((stat) => (
                    <div key={stat.label} className="glass rounded-2xl p-6 hover-glow">
                        {stat.link ? (
                            <Link to={stat.link} className="block">
                                <StatContent stat={stat} />
                            </Link>
                        ) : (
                            <StatContent stat={stat} />
                        )}
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-4 mb-10">
                <Link
                    to="/upload"
                    className="flex items-center gap-2 px-6 py-3 btn-gradient text-white font-medium rounded-xl hover-glow"
                >
                    <HiOutlineUpload className="w-5 h-5" />
                    Upload Document
                </Link>
                <Link
                    to="/documents"
                    className="flex items-center gap-2 px-6 py-3 glass text-surface-200 font-medium rounded-xl hover:bg-surface-800/50 transition-all"
                >
                    <HiOutlineDocumentText className="w-5 h-5" />
                    View All Documents
                </Link>
            </div>

            {/* Recent documents */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Recent Documents</h2>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton rounded-xl h-16" />
                        ))}
                    </div>
                ) : recentDocs.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <HiOutlineDocumentText className="w-12 h-12 text-surface-200/30 mx-auto mb-3" />
                        <p className="text-surface-200/50">No documents yet. Upload your first document!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentDocs.map((doc: any) => (
                            <Link
                                key={doc.id}
                                to={`/documents/${doc.id}`}
                                className="flex items-center gap-4 glass rounded-xl px-5 py-4 hover-glow"
                            >
                                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-brand-400 uppercase">
                                        {doc.file_type}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                                    <p className="text-xs text-surface-200/50">
                                        {new Date(doc.created_at).toLocaleDateString()} · {(doc.file_size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                {doc.tags?.length > 0 && (
                                    <div className="flex gap-1">
                                        {doc.tags.slice(0, 3).map((tag: any) => (
                                            <span
                                                key={tag.id}
                                                className="px-2 py-1 text-xs rounded-full bg-brand-500/10 text-brand-300"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatContent({ stat }: { stat: any }) {
    return (
        <>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-surface-200/50 mt-1">{stat.label}</p>
        </>
    )
}
