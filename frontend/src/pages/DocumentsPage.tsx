import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { documentsApi } from '../api/endpoints'
import { HiOutlineDocumentText, HiOutlineFilter } from 'react-icons/hi'

export default function DocumentsPage() {
    const [page, setPage] = useState(1)
    const [fileType, setFileType] = useState('')
    const [titleSearch, setTitleSearch] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['documents', { page, fileType, titleSearch }],
        queryFn: () =>
            documentsApi.list({
                page,
                size: 12,
                file_type: fileType || undefined,
                title: titleSearch || undefined,
            }),
    })

    const docs = data?.data
    const items = docs?.items || []

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Documents</h1>
                    <p className="text-surface-200/60 mt-1">
                        {docs?.total ?? 0} documents total
                    </p>
                </div>
                <Link
                    to="/upload"
                    className="px-5 py-2.5 btn-gradient text-white rounded-xl text-sm font-medium hover-glow"
                >
                    + Upload
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={titleSearch}
                    onChange={(e) => { setTitleSearch(e.target.value); setPage(1) }}
                    placeholder="Search by title..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
                />
                <select
                    value={fileType}
                    onChange={(e) => { setFileType(e.target.value); setPage(1) }}
                    className="px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
                >
                    <option value="">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                </select>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton rounded-2xl h-40" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center">
                    <HiOutlineDocumentText className="w-16 h-16 text-surface-200/20 mx-auto mb-4" />
                    <p className="text-surface-200/50 text-lg">No documents found</p>
                    <p className="text-surface-200/30 text-sm mt-1">Try adjusting your filters or upload a new document.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((doc: any) => (
                        <Link
                            key={doc.id}
                            to={`/documents/${doc.id}`}
                            className="glass rounded-2xl p-5 hover-glow group"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-brand-400 uppercase">
                                        {doc.file_type}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate group-hover:text-brand-300 transition-colors">
                                        {doc.title}
                                    </p>
                                    <p className="text-xs text-surface-200/40 mt-0.5">
                                        {new Date(doc.created_at).toLocaleDateString()} · {(doc.file_size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            {doc.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {doc.tags.map((tag: any) => (
                                        <span
                                            key={tag.id}
                                            className="px-2 py-0.5 text-xs rounded-full bg-brand-500/10 text-brand-300"
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

            {/* Pagination */}
            {docs && docs.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg glass text-sm text-surface-200 disabled:opacity-30 hover:bg-surface-800/50 transition-all"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-surface-200/50">
                        Page {page} of {docs.pages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(docs.pages, page + 1))}
                        disabled={page === docs.pages}
                        className="px-4 py-2 rounded-lg glass text-sm text-surface-200 disabled:opacity-30 hover:bg-surface-800/50 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
