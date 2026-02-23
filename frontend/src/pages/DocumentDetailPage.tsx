import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi, qaApi } from '../api/endpoints'
import toast from 'react-hot-toast'
import {
    HiOutlineTrash,
    HiOutlinePencil,
    HiOutlineChat,
    HiOutlineDocumentText,
    HiOutlineArrowLeft,
} from 'react-icons/hi'

export default function DocumentDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [question, setQuestion] = useState('')
    const [qaMessages, setQaMessages] = useState<any[]>([])
    const [editing, setEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['document', id],
        queryFn: () => documentsApi.get(id!),
        enabled: !!id,
    })

    const doc = data?.data

    const deleteMutation = useMutation({
        mutationFn: () => documentsApi.delete(id!),
        onSuccess: () => {
            toast.success('Document deleted')
            queryClient.invalidateQueries({ queryKey: ['documents'] })
            navigate('/documents')
        },
    })

    const updateMutation = useMutation({
        mutationFn: (title: string) => documentsApi.update(id!, { title }),
        onSuccess: () => {
            toast.success('Title updated')
            setEditing(false)
            queryClient.invalidateQueries({ queryKey: ['document', id] })
        },
    })

    const askMutation = useMutation({
        mutationFn: (q: string) => qaApi.ask(id!, q),
        onSuccess: (res) => {
            setQaMessages(res.data.messages || [])
            setQuestion('')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.detail || 'Failed to get answer')
        },
    })

    if (isLoading) {
        return (
            <div className="animate-fade-in space-y-4">
                <div className="skeleton rounded-xl h-10 w-48" />
                <div className="skeleton rounded-2xl h-96" />
            </div>
        )
    }

    if (!doc) {
        return (
            <div className="text-center py-20">
                <p className="text-surface-200/50 text-lg">Document not found</p>
            </div>
        )
    }

    const isImage = ['jpg', 'jpeg', 'png'].includes(doc.file_type)

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-surface-200/60 hover:text-white mb-6 transition-colors"
            >
                <HiOutlineArrowLeft className="w-5 h-5" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Preview & text */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Preview */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-surface-700/30 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Preview</h2>
                        </div>
                        <div className="p-4">
                            {isImage ? (
                                <img
                                    src={`/${doc.file_path}`}
                                    alt={doc.title}
                                    className="w-full max-h-[500px] object-contain rounded-xl"
                                />
                            ) : (
                                <div className="bg-surface-900/50 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
                                    <div className="text-center">
                                        <HiOutlineDocumentText className="w-16 h-16 text-surface-200/20 mx-auto mb-3" />
                                        <p className="text-surface-200/40">PDF preview</p>
                                        <a
                                            href={`/${doc.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-3 px-4 py-2 btn-gradient text-white text-sm rounded-lg"
                                        >
                                            Open PDF
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Extracted text */}
                    <div className="glass rounded-2xl">
                        <div className="p-4 border-b border-surface-700/30">
                            <h2 className="text-lg font-semibold text-white">Extracted Text</h2>
                        </div>
                        <div className="p-4">
                            {doc.extracted_text ? (
                                <pre className="text-sm text-surface-200/70 whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                                    {doc.extracted_text}
                                </pre>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-pulse-soft">
                                        <p className="text-surface-200/40">OCR processing in progress...</p>
                                        <p className="text-xs text-surface-200/25 mt-1">Refresh the page in a moment.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Q&A */}
                    <div className="glass rounded-2xl">
                        <div className="p-4 border-b border-surface-700/30 flex items-center gap-2">
                            <HiOutlineChat className="w-5 h-5 text-brand-400" />
                            <h2 className="text-lg font-semibold text-white">Ask AI</h2>
                        </div>
                        <div className="p-4">
                            {qaMessages.length > 0 && (
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {qaMessages.map((msg: any, i: number) => (
                                        <div
                                            key={i}
                                            className={`p-3 rounded-xl text-sm ${msg.role === 'user'
                                                    ? 'bg-brand-500/10 text-brand-200 ml-8'
                                                    : 'bg-surface-800/50 text-surface-200/80 mr-8'
                                                }`}
                                        >
                                            <p className="text-xs font-medium text-surface-200/40 mb-1">
                                                {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                            </p>
                                            {msg.content}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    if (question.trim()) askMutation.mutate(question)
                                }}
                                className="flex gap-3"
                            >
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Ask a question about this document..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
                                    disabled={!doc.extracted_text}
                                />
                                <button
                                    type="submit"
                                    disabled={askMutation.isPending || !question.trim() || !doc.extracted_text}
                                    className="px-6 py-3 btn-gradient text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {askMutation.isPending ? 'Thinking...' : 'Ask'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right: Metadata */}
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            {editing ? (
                                <div className="flex-1">
                                    <input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-700/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => updateMutation.mutate(editTitle)}
                                            className="px-3 py-1.5 btn-gradient text-white text-xs rounded-lg"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditing(false)}
                                            className="px-3 py-1.5 glass text-surface-200 text-xs rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <h2 className="text-xl font-semibold text-white flex-1 break-words">
                                    {doc.title}
                                </h2>
                            )}
                        </div>

                        <div className="space-y-3 text-sm">
                            <InfoRow label="Type" value={doc.file_type.toUpperCase()} />
                            <InfoRow label="Size" value={`${(doc.file_size / 1024).toFixed(1)} KB`} />
                            <InfoRow label="Uploaded" value={new Date(doc.created_at).toLocaleString()} />
                            <InfoRow label="Owner" value={doc.owner_email || '—'} />
                            {doc.tags?.length > 0 && (
                                <div>
                                    <p className="text-surface-200/40 mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {doc.tags.map((t: any) => (
                                            <span key={t.id} className="px-2 py-1 text-xs rounded-full bg-brand-500/10 text-brand-300">
                                                {t.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t border-surface-700/30">
                            <button
                                onClick={() => { setEditing(true); setEditTitle(doc.title) }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 glass rounded-lg text-sm text-surface-200 hover:bg-surface-800/50 transition-all"
                            >
                                <HiOutlinePencil className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Delete this document?')) deleteMutation.mutate()
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
                            >
                                <HiOutlineTrash className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-surface-200/40">{label}</span>
            <span className="text-surface-200/80">{value}</span>
        </div>
    )
}
