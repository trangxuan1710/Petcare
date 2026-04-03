import { authApi } from "./baseApi";

const STATUS_MAP = {
    pending: 'WAITING_EXECUTION',
    waiting_execution: 'WAITING_EXECUTION',
    in_progress: 'IN_PROGRESS',
    waiting_conclusion: 'WAITING_CONCLUSION',
    waiting_payment: 'WAITING_PAYMENT',
    completed: 'PAID',
    paid: 'PAID',
    'đã tiếp đón': 'WAITING_EXECUTION',
    'chờ thực hiện': 'WAITING_EXECUTION',
    'đang thực hiện': 'IN_PROGRESS',
    'chờ kết luận': 'WAITING_CONCLUSION',
    'chờ thanh toán': 'WAITING_PAYMENT',
    'đã thanh toán': 'PAID',
};

const normalizeStatus = (status) => {
    if (!status) return status;
    const normalizedKey = String(status).trim().toLowerCase();
    return STATUS_MAP[normalizedKey] || status;
};

const normalizeParams = (params = {}) => {
    const next = { ...params };
    if (next.status) {
        next.status = normalizeStatus(next.status);
    }
    return next;
};

const getApiData = (response) => response?.data?.data;

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const receptionService = {
    async getReceptions(params) {
        const response = await authApi.get('/reception-slips', { params: normalizeParams(params) });
        return { ...response, normalizedData: toArray(getApiData(response)) };
    },
    async getReceptionsByStates(states = [], params = {}) {
        const normalizedStates = states
            .filter(Boolean)
            .map((state) => normalizeStatus(state));

        const response = await authApi.get('/reception-slips/by-state', {
            params: {
                ...params,
                states: normalizedStates,
            },
        });
        return { ...response, normalizedData: toArray(getApiData(response)) };
    },
    async createReception(payload) {
        return authApi.post('/reception-slips', payload);
    },
    async getReceptionById(receptionId) {
        const response = await authApi.get(`/reception-slips/${receptionId}`);
        return { ...response, normalizedData: getApiData(response) };
    },
    async getAssignedServices(receptionId) {
        const response = await authApi.get(`/reception-slips/${receptionId}/services`);
        return { ...response, normalizedData: toArray(getApiData(response)) };
    },
    initDefaultClinicalService(receptionId) {
        return authApi.post(`/reception-slips/${receptionId}/services/default-clinical`);
    },
    patchReceptionById(receptionId, payload) {
        return authApi.patch(`/reception-slips/${receptionId}`, payload);
    },
    searchParaclinicalServices(params = {}) {
        return authApi.get('/paraclinical-services/search', {
            params: {
                keyword: params?.keyword,
                limit: params?.limit || 50,
            },
        });
    },
    searchTechnicians(params = {}) {
        return authApi.get('/technicians/search', {
            params: {
                keyword: params?.keyword,
                limit: params?.limit || 50,
            },
        });
    },
    async getSelectedParaclinicalServices(receptionId) {
        const response = await authApi.get(`/reception-slips/${receptionId}/paraclinical-services`);
        return { ...response, normalizedData: toArray(getApiData(response)) };
    },
    saveSelectedParaclinicalServices(receptionId, payload) {
        return authApi.post(`/reception-slips/${receptionId}/paraclinical-services`, payload);
    },
    async getDoctorsWithWaitingCases() {
        const response = await authApi.get('/doctors/waiting-cases');
        return { ...response, normalizedData: toArray(getApiData(response)) };
    },
    async getMyDoctorReceptions(params = {}) {
        const response = await authApi.get('/doctors/me/reception-slips', {
            params: normalizeParams(params),
        });
        return { ...response, normalizedData: toArray(getApiData(response)) };
    }
}

export default receptionService;