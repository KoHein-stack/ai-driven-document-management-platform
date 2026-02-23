import { Link } from 'react-router-dom'
import { HiOutlineDocumentText, HiOutlineSearch, HiOutlineLightningBolt, HiOutlineShieldCheck } from 'react-icons/hi'

const features = [
    {
        icon: HiOutlineDocumentText,
        title: 'Smart Upload',
        desc: 'Upload PDFs and images with automatic OCR text extraction.',
    },
    {
        icon: HiOutlineSearch,
        title: 'Full-Text Search',
        desc: 'Search inside your documents by content, title, or tags.',
    },
    {
        icon: HiOutlineLightningBolt,
        title: 'AI-Powered Q&A',
        desc: 'Ask questions about your documents and get instant answers.',
    },
    {
        icon: HiOutlineShieldCheck,
        title: 'Secure Access',
        desc: 'Role-based access control with JWT authentication.',
    },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-surface-950 relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center text-white font-bold text-lg">
                        S
                    </div>
                    <span className="text-xl font-bold text-white">SmartArchive</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="px-5 py-2.5 text-sm font-medium text-surface-200 hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="px-5 py-2.5 text-sm font-medium text-white btn-gradient rounded-xl hover-glow"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
                <div className="animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-brand-300 mb-8">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        AI-Powered Document Intelligence
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                        Your Documents,{' '}
                        <span className="gradient-text">Supercharged</span>
                    </h1>
                    <p className="text-xl text-surface-200/70 max-w-2xl mx-auto mb-10">
                        Upload, extract, search, and ask questions — all powered by AI.
                        SmartArchive transforms how you manage documents.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="px-8 py-4 text-lg font-semibold text-white btn-gradient rounded-2xl hover-glow shadow-lg shadow-brand-500/25"
                        >
                            Start Free →
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 text-lg font-semibold text-surface-200 glass rounded-2xl hover:bg-surface-800/50 transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className="glass rounded-2xl p-6 text-left hover-glow animate-slide-up"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                                <f.icon className="w-6 h-6 text-brand-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-surface-200/60">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-surface-700/30 py-8 text-center text-sm text-surface-200/40">
                © 2024 SmartArchive. Built with FastAPI & React.
            </footer>
        </div>
    )
}
