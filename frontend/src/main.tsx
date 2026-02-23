import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1e293b',
                            color: '#e2e8f0',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                        },
                    }}
                />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
)
