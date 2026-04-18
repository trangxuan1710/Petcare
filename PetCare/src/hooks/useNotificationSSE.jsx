import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { authApi } from '../api/baseApi';
import notificationService from '../api/notificationService';

const UNREAD_KEY = 'notification_unread_count';
const NOTIFICATION_TOAST_DURATION_MS = 2500;
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
let moduleNavigate = null;

const toSafeNumber = (value) => {
    const parsed = Number(value);   
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const normalizeRoleText = (value) => {
    if (!value) return '';
    let role = String(value).trim().toUpperCase();
    if (role.startsWith('ROLE_')) {
        role = role.replace('ROLE_', '');
    }
    // Standardize STAFF to RECEPTIONIST if needed, as per earlier patterns
    if (role === 'STAFF') return 'RECEPTIONIST';
    return role;
};

const getCurrentUserRole = () => normalizeRoleText(localStorage.getItem('user_role'));

const getCurrentUserId = () => {
    try {
        const info = JSON.parse(localStorage.getItem('user_info') || '{}');
        return info.id || null;
    } catch {
        return null;
    }
};

const decodeUtf8 = (str) => {
    if (!str || typeof str !== 'string') return str;
    try {
        // Attempt to fix UTF-8 strings that were misinterpreted as ISO-8859-1
        // This is a common pattern for "ChÃ o báº¡n" style mangling
        return decodeURIComponent(escape(str));
    } catch {
        return str;
    }
};

const parseNotificationData = (raw) => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            // Recurse or fix top-level strings
            if (typeof parsed.title === 'string') parsed.title = decodeUtf8(parsed.title);
            if (typeof parsed.message === 'string') parsed.message = decodeUtf8(parsed.message);
            if (typeof parsed.content === 'string') parsed.content = decodeUtf8(parsed.content);
        }
        return parsed;
    } catch {
        return { message: decodeUtf8(String(raw)) };
    }
};

const canCurrentUserReceive = (payload) => {
    if (!payload || typeof payload !== 'object') return true;

    // 1. Check if it's for a specific user
    const targetUserId = payload.targetUserId || payload.userId;
    const currentUserId = getCurrentUserId();
    if (targetUserId != null && currentUserId != null) {
        if (String(targetUserId) !== String(currentUserId)) return false;
    }

    // 2. Check Role
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
        const link = payload?.link || '';
        
        // Use mapping-like logic to find the best ID for navigation
        const extractId = (l) => {
            if (!l || typeof l !== 'string') return null;
            const patterns = [
                /\/(?:tickets|reception-slips|reception-records|receptions|medical-records|records|payment|details|clinical|prescriptions)\/(\d+)/i,
                /\/(\d+)\/?$/,
                /id=(\d+)/i,
            ];
            for (const p of patterns) {
                const m = l.match(p);
                if (m) return m[1];
            }
            return null;
        };
        const receptionId = payload?.receptionId || payload?.ticketId || payload?.receptionRecordId || payload?.recordId || payload?.targetId || extractId(link);

        toast.custom((t) => (
            <div 
                className={`notif-toast-card ${t.visible ? 'animate-enter' : 'animate-leave'}`}
                style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    width: 'min(420px, calc(100vw - 32px))',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    border: '1px solid #e5e7eb',
                    alignItems: 'flex-start',
                    pointerEvents: 'auto'
                }}
                onClick={() => {
                    toast.dismiss(t.id);
                    if (moduleNavigate) {
                        const currentRole = getCurrentUserRole();
                        if (receptionId) {
                            if (currentRole === 'DOCTOR') {
                                moduleNavigate('/doctors/tickets/' + receptionId);
                            } else if (currentRole === 'RECEPTIONIST' || currentRole === 'STAFF') {
                                moduleNavigate('/receptionists/payment', { state: { receptionId } });
                            } else if (currentRole === 'TECHNICIAN') {
                                moduleNavigate('/techs/record-result/' + receptionId);
                            } else {
                                moduleNavigate('/doctors/tickets/' + receptionId);
                            }
                        } else if (link && !link.startsWith('http')) {
                            moduleNavigate(link);
                        } else {
                            if (currentRole === 'RECEPTIONIST' || currentRole === 'STAFF') {
                                moduleNavigate('/receptionists/notifications');
                            } else if (currentRole === 'TECHNICIAN') {
                                moduleNavigate('/techs/notifications');
                            } else {
                                moduleNavigate('/doctors/notifications');
                            }
                        }
                    }
                }}
            >
                <div style={{ background: '#f0fdfa', borderRadius: '50%', padding: '8px', marginTop: '2px' }}>
                    <Bell size={20} color="#24C7A9" fill="#24C7A9" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{title}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Vừa xong</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: 1.4 }}>
                        {message}
                    </p>
                </div>
            </div>
        ), { id: payload?.id != null ? `notif-${payload.id}` : undefined, duration: NOTIFICATION_TOAST_DURATION_MS });

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
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(() => toSafeNumber(getStoredUnread()));

    useEffect(() => {
        moduleNavigate = navigate;
    }, [navigate]);

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
