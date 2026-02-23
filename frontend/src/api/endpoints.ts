import api from './client'

// ── Auth ──────────────────────────────────────────
export const authApi = {
    register: (data: { email: string; password: string; full_name?: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    refresh: (refresh_token: string) =>
        api.post('/auth/refresh', { refresh_token }),
    me: () => api.get('/auth/me'),
}

// ── Documents ─────────────────────────────────────
export const documentsApi = {
    upload: (formData: FormData) =>
        api.post('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    list: (params?: {
        page?: number
        size?: number
        file_type?: string
        tag?: string
        title?: string
    }) => api.get('/documents', { params }),
    get: (id: string) => api.get(`/documents/${id}`),
    update: (id: string, data: { title?: string; tags?: string[] }) =>
        api.put(`/documents/${id}`, data),
    delete: (id: string) => api.delete(`/documents/${id}`),
}

// ── Search ────────────────────────────────────────
export const searchApi = {
    search: (params: { q: string; page?: number; size?: number }) =>
        api.get('/search', { params }),
}

// ── AI Q&A ────────────────────────────────────────
export const qaApi = {
    ask: (documentId: string, question: string) =>
        api.post(`/qa/${documentId}`, { question }),
}

// ── Admin ─────────────────────────────────────────
export const adminApi = {
    getUsers: () => api.get('/admin/users'),
    getStats: () => api.get('/admin/stats'),
    deleteDocument: (id: string) => api.delete(`/admin/documents/${id}`),
}
