import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { searchApi } from '../api/endpoints'
import { HiOutlineSearch, HiOutlineDocumentText } from 'react-icons/hi'

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['search', searchTerm, page],
        queryFn: () => searchApi.search({ q: searchTerm, page, size: 20 }),
        enabled: !!searchTerm,
    })

    const results = data?.data
    const items = results?.items || []

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchTerm(query)
        setPage(1)
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Search Documents</h1>
            <p className="text-surface-200/60 mb-8">Search by title or content inside documents.</p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-200/30" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search documents..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!query.trim()}
                        className="px-8 py-3.5 btn-gradient text-white font-medium rounded-xl hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Results */}
            {searchTerm && (
                <div>
                    <p className="text-sm text-surface-200/50 mb-4">
                        {isLoading ? 'Searching...' : `${results?.total || 0} results for "${searchTerm}"`}
                    </p>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton rounded-xl h-20" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center">
                            <HiOutlineSearch className="w-12 h-12 text-surface-200/20 mx-auto mb-3" />
                            <p className="text-surface-200/50">No results found for "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((doc: any) => (
                                <Link
                                    key={doc.id}
                                    to={`/documents/${doc.id}`}
                                    className="flex items-center gap-4 glass rounded-xl px-5 py-4 hover-glow"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-brand-400 uppercase">
                                            {doc.file_type}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{doc.title}</p>
                                        <p className="text-xs text-surface-200/40">
                                            {new Date(doc.created_at).toLocaleDateString()} · {(doc.file_size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    {doc.tags?.length > 0 && (
                                        <div className="flex gap-1 flex-shrink-0">
                                            {doc.tags.slice(0, 2).map((tag: any) => (
                                                <span key={tag.id} className="px-2 py-0.5 text-xs rounded-full bg-brand-500/10 text-brand-300">
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
                    {results && results.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg glass text-sm text-surface-200 disabled:opacity-30 hover:bg-surface-800/50 transition-all"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm text-surface-200/50">
                                Page {page} of {results.pages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(results.pages, page + 1))}
                                disabled={page === results.pages}
                                className="px-4 py-2 rounded-lg glass text-sm text-surface-200 disabled:opacity-30 hover:bg-surface-800/50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
