import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { documentsApi } from '../api/endpoints'
import toast from 'react-hot-toast'
import { HiOutlineUpload, HiOutlineDocumentText, HiOutlineX } from 'react-icons/hi'

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [tags, setTags] = useState('')
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const navigate = useNavigate()

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted.length > 0) {
            const f = accepted[0]
            setFile(f)
            if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
        }
    }, [title])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        maxSize: 10 * 1024 * 1024,
        multiple: false,
        onDropRejected: (rejections) => {
            const error = rejections[0]?.errors[0]
            toast.error(error?.message || 'File not accepted')
        },
    })

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            toast.error('Please select a file')
            return
        }
        setUploading(true)
        setProgress(0)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', title || file.name)
        formData.append('tags', tags)

        try {
            await documentsApi.upload(formData)
            toast.success('Document uploaded! OCR processing started.')
            navigate('/documents')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Document</h1>
            <p className="text-surface-200/60 mb-8">Upload a PDF or image to extract text and metadata.</p>

            <form onSubmit={handleUpload} className="space-y-6">
                {/* Drop zone */}
                <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive
                            ? 'border-brand-400 bg-brand-500/10'
                            : file
                                ? 'border-green-500/50 bg-green-500/5'
                                : 'border-surface-700/30 hover:border-brand-500/30 hover:bg-surface-800/30'
                        }`}
                >
                    <input {...getInputProps()} />
                    {file ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <HiOutlineDocumentText className="w-7 h-7 text-green-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">{file.name}</p>
                                <p className="text-sm text-surface-200/50">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setFile(null)
                                }}
                                className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-200/50 hover:text-red-400 transition-all"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <HiOutlineUpload className="w-12 h-12 text-surface-200/30 mx-auto mb-4" />
                            <p className="text-white font-medium mb-1">
                                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                            </p>
                            <p className="text-sm text-surface-200/40">
                                or click to browse · PDF, JPG, PNG · max 10MB
                            </p>
                        </>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-surface-200/80 mb-2">
                        Document Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                        placeholder="Enter a descriptive title"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-surface-200/80 mb-2">
                        Tags <span className="text-surface-200/30">(comma-separated)</span>
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/30 text-white placeholder-surface-200/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                        placeholder="invoice, finance, 2024"
                    />
                </div>

                {/* Upload button */}
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full py-4 btn-gradient text-white font-semibold rounded-xl hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                >
                    {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                            </svg>
                            Uploading...
                        </span>
                    ) : (
                        'Upload Document'
                    )}
                </button>
            </form>
        </div>
    )
}
