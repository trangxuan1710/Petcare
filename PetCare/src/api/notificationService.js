import { authApi } from './baseApi';

const getApiData = (response) => response?.data?.data;

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const formatNotificationTime = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffHours < 48) return 'Hôm qua';

    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).replace(',', ' -');
};

const extractReceptionIdFromLink = (link) => {
    if (!link || typeof link !== 'string') return null;
    
    // Support various path formats from backend links
    const patterns = [
        /\/(?:tickets|reception-slips|reception-records|receptions|medical-records|records|payment|details|clinical|prescriptions)\/(\d+)/i,
        /\/(\d+)\/?$/, // Trailing ID
        /id=(\d+)/i,   // Query param
    ];

    for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match) return Number(match[1]);
    }

    return null;
};

const normalizeInternalLink = (link) => {
    if (!link || typeof link !== 'string') return '';
    if (!link.startsWith('http')) return link;

    try {
        const url = new URL(link);
        let path = url.pathname;
        // Strip backend prefixes if present (e.g. /api/v1)
        path = path.replace(/^\/api(\/v\d+)?/i, '');
        return path + url.search + url.hash;
    } catch {
        return link;
    }
};

const decodeUtf8 = (str) => {
    if (!str || typeof str !== 'string') return str;
    try {
        // Fix mangled Vietnamese characters (UTF-8 interpreted as ISO-8859-1)
        return decodeURIComponent(escape(str));
    } catch {
        return str;
    }
};

const mapNotification = (item) => {
    const rawLink = item?.link || item?.url || '';
    const normalizedLink = normalizeInternalLink(rawLink);
    
    // Check all possible ID fields from various backend notifications
    const receptionId = item?.receptionId 
        || item?.ticketId 
        || item?.receptionRecordId 
        || item?.recordId 
        || item?.targetId 
        || extractReceptionIdFromLink(normalizedLink);
    
    return {
        id: item?.id,
        title: decodeUtf8(item?.title || 'Thông báo'),
        message: decodeUtf8(item?.message || item?.content || ''),
        type: item?.type || '',
        link: normalizedLink,
        receptionId: receptionId,
        createdAt: item?.createdAt,
        time: formatNotificationTime(item?.createdAt),
        isRead: Boolean(item?.read ?? item?.isRead),
    };
};

const notificationService = {
    async listMyNotifications() {
        const response = await authApi.get('/notifications/my');
        const records = toArray(getApiData(response));
        return { data: records.map(mapNotification) };
    },

    async listDoctorNotifications() {
        return this.listMyNotifications();
    },

    async listReceptionistNotifications(params = {}) {
        void params;
        return this.listMyNotifications();
    },

    async listTechNotifications() {
        return this.listMyNotifications();
    },

    async getUnreadCount() {
        const response = await authApi.get('/notifications/unread-count');
        const payload = getApiData(response) || {};
        return { data: { unreadCount: Number(payload?.unreadCount || 0) } };
    },

    async markAsRead(notificationId) {
        const response = await authApi.patch(`/notifications/${notificationId}/read`);
        return { data: getApiData(response) };
    },

    async markAllAsRead() {
        const response = await authApi.patch('/notifications/read-all');
        return { data: getApiData(response) };
    },
};

export default notificationService;
