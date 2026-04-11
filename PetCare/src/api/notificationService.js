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
    const match = link.match(/\/(?:tickets|reception-slips|payment)\/(\d+)/i);
    return match ? Number(match[1]) : null;
};

const mapNotification = (item) => ({
    id: item?.id,
    title: item?.title || 'Thông báo',
    message: item?.message || '',
    type: item?.type || '',
    link: item?.link || '',
    createdAt: item?.createdAt,
    time: formatNotificationTime(item?.createdAt),
    isRead: Boolean(item?.read ?? item?.isRead),
    receptionId: extractReceptionIdFromLink(item?.link),
});

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
