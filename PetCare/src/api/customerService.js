import {authApi} from './baseApi';

const getApiData = (response) => response?.data?.data;

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const normalizeClientPayload = (payload = {}) => ({
    name: payload?.name || payload?.fullName || '',
    phone: payload?.phone || payload?.phoneNumber || '',
});

const customerService = {
    async getCustomers(params) {
        const response = await authApi.get('/clients/search', {params});
        return { ...response, data: toArray(getApiData(response)) };
    },
    async findCustomerByPhone(phone) {
        const response = await authApi.get('/clients', { params: { phone } });
        return { ...response, data: getApiData(response) || null };
    },
    createCustomers(payload) {
        return authApi.post('/clients', normalizeClientPayload(payload));
    },
    createCustomer(payload) {
        return authApi.post('/clients', normalizeClientPayload(payload));
    },
    async getCustomerPets(customerId) {
        const response = await authApi.get(`/clients/${customerId}/pets`);
        return { ...response, data: toArray(getApiData(response)) };
    }
}

export default customerService;