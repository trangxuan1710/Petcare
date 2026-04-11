import axios from 'axios';
const API_BASE_URL = globalThis.__API_BASE_URL__ || 'https://api.daidq.io.vn/api';

export const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const publicApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

authApi.interceptors.request.use(
    (config) => {
        if (typeof window === 'undefined') return config;
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

const handleResponseError = (error) => {
    if (error?.response?.status === 401) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_info');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
}


authApi.interceptors.response.use(
    (response) => response,
    handleResponseError
)

publicApi.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
)