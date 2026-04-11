import { authApi } from './baseApi';

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const mapTaskStatus = (status) => {
    const normalized = String(status || '').trim().toUpperCase();
    if (normalized === 'IN_PROGRESS') return 'processing';
    if (normalized === 'COMPLETED') return 'done';
    return 'queued';
};

const mapTaskItem = (item) => ({
    id: Number(item?.serviceOrderId || 0),
    serviceOrderId: Number(item?.serviceOrderId || 0),
    serviceId: Number(item?.serviceId || 0),
    title: item?.serviceName || 'Dịch vụ',
    requester: item?.prescribedByDoctorName || '--',
    petName: item?.petName || '--',
    petId: item?.petId ?? null,
    status: mapTaskStatus(item?.status),
    backendStatus: item?.status || 'WAITING_EXECUTION',
    startTime: item?.startTime || null,
    endTime: item?.endTime || null,
});

const mapMedicineItem = (item) => ({
    medicineId: Number(item?.medicineId || 0),
    medicineName: item?.medicineName || 'Thuốc/Vật tư',
    description: item?.description || item?.desc || '',
    quantity: Number(item?.quantity || 0),
    dosageUnit: item?.dosageUnit || '',
    instruction: item?.instruction || '',
});

const mapDetail = (item) => ({
    ...mapTaskItem(item),
    result: item?.result || '',
    evidencePaths: toArray(item?.evidencePaths),
    medicines: toArray(item?.medicines).map(mapMedicineItem),
});

const buildStorageUrl = (filePath) => {
    const raw = String(filePath || '').trim();
    if (!raw) return '';
    if (/^(blob:|data:|https?:\/\/)/i.test(raw)) return raw;

    const normalizedPath = raw.replace(/\\/g, '/').replace(/^\.\//, '/');

    let baseUrl = '';
    try {
        const parsed = new URL(authApi.defaults.baseURL || window.location.origin);
        const basePath = parsed.pathname.replace(/\/+$/, '');
        baseUrl = `${parsed.origin}${basePath}`;
    } catch {
        baseUrl = window.location.origin;
    }

    if (normalizedPath.startsWith('/storage/')) {
        return `${baseUrl}${normalizedPath}`;
    }

    if (/^storage\//i.test(normalizedPath)) {
        return `${baseUrl}/${normalizedPath}`;
    }

    if (/^tech-result-.*\.(png|jpe?g|gif|webp|bmp|svg|pdf|docx?|xlsx?|txt)$/i.test(normalizedPath)) {
        return `${baseUrl}/storage/tech-results/${normalizedPath}`;
    }

    if (/^exam-result-.*\.(png|jpe?g|gif|webp|bmp|svg|pdf|docx?|xlsx?|txt)$/i.test(normalizedPath)) {
        return `${baseUrl}/storage/exam-results/${normalizedPath}`;
    }

    return `${baseUrl}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
};

const techService = {
    async getMyAssignedServices(params = {}) {
        const response = await authApi.get('/technicians/me/assigned-services', { params });
        const payload = response?.data?.data || {};
        return {
            ...response,
            data: {
                technicianId: payload?.technicianId || null,
                waitingCount: Number(payload?.waitingCount || 0),
                inProgressCount: Number(payload?.inProgressCount || 0),
                completedCount: Number(payload?.completedCount || 0),
                totalCount: Number(payload?.totalCount || 0),
                items: toArray(payload?.items).map(mapTaskItem),
            },
        };
    },

    async getMyAssignedServiceDetail(serviceOrderId) {
        const response = await authApi.get(`/technicians/me/assigned-services/${serviceOrderId}`);
        return {
            ...response,
            data: mapDetail(response?.data?.data || {}),
        };
    },

    async startMyAssignedService(serviceOrderId) {
        const response = await authApi.patch(`/technicians/me/assigned-services/${serviceOrderId}/start`);
        return {
            ...response,
            data: mapDetail(response?.data?.data || {}),
        };
    },

    async recordMyAssignedServiceResult(serviceOrderId, payload, images = []) {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload || {}));
        images.forEach((file) => {
            formData.append('images', file);
        });

        const response = await authApi.post(`/technicians/me/assigned-services/${serviceOrderId}/result`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return {
            ...response,
            data: mapDetail(response?.data?.data || {}),
        };
    },

    buildStorageUrl,
};

export default techService;
