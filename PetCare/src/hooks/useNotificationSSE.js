import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/baseApi';
import notificationService from '../api/notificationService';

const UNREAD_KEY = 'notification_unread_count';
const listeners = new Set();

const getStoredUnread = () => {
    try {
        return Number(localStorage.getItem(UNREAD_KEY) || 0);
    } catch {
        return 0;
    }
};

let sharedUnread = getStoredUnread();
let sharedEventSource = null;
let subscriberCount = 0;

const toSafeNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const normalizeRoleText = (value) => {
    if (!value) return '';
    return String(value).trim().toUpperCase();
};

const getCurrentUserRole = () => normalizeRoleText(localStorage.getItem('user_role'));

const parseNotificationData = (raw) => {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return { message: String(raw) };
    }
};

const canCurrentUserReceive = (payload) => {
    if (!payload || typeof payload !== 'object') return true;

    const targetRole = normalizeRoleText(payload.targetRole);
    if (!targetRole) return true;

    const currentRole = getCurrentUserRole();
    return targetRole === currentRole;
};

const persistUnread = (nextValue) => {
    sharedUnread = toSafeNumber(nextValue);
    try {
        localStorage.setItem(UNREAD_KEY, String(sharedUnread));
    } catch {
        // Ignore storage write issues.
    }
};

const notifyUnreadChanged = () => {
    listeners.forEach((setValue) => setValue(sharedUnread));
    window.dispatchEvent(new CustomEvent('notification-unread-changed', { detail: { unreadCount: sharedUnread } }));
};

const updateUnread = (nextValue) => {
    persistUnread(nextValue);
    notifyUnreadChanged();
};

const getSseUrl = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    if (!token) return null;

    const baseUrl = authApi?.defaults?.baseURL || `${window.location.origin}/api`;
    const parsed = new URL(baseUrl, window.location.origin);
    let basePath = String(parsed.pathname || '').replace(/\/+$/, '');

    // Backend servlet context-path is /api, strip optional /v1 suffix from client baseURL.
    if (/\/v1$/i.test(basePath)) {
        basePath = basePath.replace(/\/v1$/i, '');
    }
    if (!basePath) {
        basePath = '/api';
    }

    return `${parsed.origin}${basePath}/notifications/subscribe?token=${encodeURIComponent(token)}`;
};

const syncUnreadFromServer = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const response = await authApi.get('/notifications/unread-count');
        const unreadFromServer = Number(response?.data?.data?.unreadCount || 0);
        updateUnread(unreadFromServer);
    } catch {
        // Keep local unread count if the API fails.
    }
};

const startSharedConnection = () => {
    if (sharedEventSource) return;

    const url = getSseUrl();
    if (!url) return;

    sharedEventSource = new EventSource(url);

    const handleIncoming = (event) => {
        const payload = parseNotificationData(event?.data);
        if (!canCurrentUserReceive(payload)) return;

        const title = payload?.title || 'Thông báo mới';
        const message = payload?.message || payload?.content || '';
        const toastText = message || title;
        const toastId = payload?.id != null ? `notification-${payload.id}` : undefined;

        toast(toastText, {
            id: toastId,
            duration: 2800,
            position: 'top-center',
            icon: null,
            style: {
                width: 'min(420px, calc(100vw - 32px))',
                background: '#1f9f86',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: 1.35,
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)',
            },
            ariaProps: {
                role: 'status',
                'aria-live': 'polite',
            },
        });

        updateUnread(sharedUnread + 1);

        window.dispatchEvent(new CustomEvent('new-notification', { detail: payload || event?.data }));
    };

    sharedEventSource.addEventListener('notification', handleIncoming);
    sharedEventSource.onmessage = handleIncoming;

    sharedEventSource.onerror = () => {
        // Keep connection for browser auto-reconnect.
        // Do not close manually here.
    };
};

const stopSharedConnection = () => {
    if (!sharedEventSource) return;
    sharedEventSource.close();
    sharedEventSource = null;
};

export const useNotificationSSE = () => {
    const [unreadCount, setUnreadCount] = useState(() => toSafeNumber(getStoredUnread()));

    useEffect(() => {
        listeners.add(setUnreadCount);
        subscriberCount += 1;

        setUnreadCount(sharedUnread);

        const token = localStorage.getItem('access_token');
        if (token) {
            startSharedConnection();
            syncUnreadFromServer();
        }

        return () => {
            listeners.delete(setUnreadCount);
            subscriberCount = Math.max(0, subscriberCount - 1);
            if (subscriberCount === 0) {
                stopSharedConnection();
            }
        };
    }, []);

    const clearUnread = useCallback(async () => {
        updateUnread(0);
        try {
            await notificationService.markAllAsRead();
        } catch {
            // Ignore if marking on server fails
        }
    }, []);

    return { unreadCount, clearUnread };
};
