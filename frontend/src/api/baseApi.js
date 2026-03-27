import axios from 'axios';
import dotenv from 'dotenv';

export const authApi = axios.create({
    baseUrl: dotenv.config().parsed.API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const publicApi = axios.create({
    baseUrl: dotenv.config().parsed.API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

authApi.interceptors.request.use(
    (config) => {
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
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
}


authApi.interceptors.response.use(
    (response) => response,
    handleResponseError
)

publicApi.interceptors.response.use(
    (response) => response,
    handleResponseError
)