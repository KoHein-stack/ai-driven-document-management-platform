import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

// Request interceptor – attach JWT token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor – handle 401 and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            const refreshToken = useAuthStore.getState().refreshToken
            if (refreshToken) {
                try {
                    const res = await axios.post('/api/auth/refresh', {
                        refresh_token: refreshToken,
                    })
                    const { access_token } = res.data
                    useAuthStore.getState().setTokens(access_token, refreshToken)
                    original.headers.Authorization = `Bearer ${access_token}`
                    return api(original)
                } catch {
                    useAuthStore.getState().logout()
                }
            } else {
                useAuthStore.getState().logout()
            }
        }
        return Promise.reject(error)
    }
)

export default api
