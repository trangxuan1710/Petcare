import { authApi } from './baseApi';

const getApiData = (response) => response?.data?.data;

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const notificationService = {
    async listDoctorNotifications() {
        const response = await authApi.get('/doctors/waiting-cases');
        const records = toArray(getApiData(response));
        const mapped = records.map((record, index) => ({
            id: record?.doctorId || record?.id || index + 1,
            title: 'Có phiếu khám mới cần thực hiện!',
            petName: record?.petName || 'Thú cưng',
            customerName: record?.clientName || record?.doctorName || 'Khách hàng',
            message: 'đang chờ bác sĩ xử lý.',
            time: record?.updatedAt || '',
            receptionId: record?.receptionSlipId || record?.receptionId || record?.id,
        }));

        return { data: mapped };
    },
    async listReceptionistNotifications(params = {}) {
        const response = await authApi.get('/reception-slips/by-state', {
            params: {
                states: ['chờ thanh toán'],
                ...params,
            },
        });

        const records = toArray(getApiData(response));
        const mapped = records.map((record) => ({
            id: record?.id,
            title: 'Thực hiện thanh toán!',
            time: record?.receptionTime || '',
            orderCode: `REC${record?.id || ''}`,
            customerName: record?.client?.fullName || 'Khách hàng',
            receptionId: record?.id,
        }));

        return { data: mapped };
    },
    async markAsRead(notificationId) {
        return Promise.resolve({ data: { id: notificationId, read: true } });
    },
};

export default notificationService;
