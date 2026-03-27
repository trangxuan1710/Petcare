import { authApi } from "./baseApi";

const receptionService = {
    getReceptions(params) {
        return authApi.get('/reception-slips', { params });
    },
    createReception(payload) {
        return authApi.post('/reception-slips', payload);
    },
    getReceptionById(receptionId) {
        return authApi.get(`/reception-slips/${receptionId}`);
    },
    patchReceptionById(receptionId, payload) {
        return authApi.patch(`/reception-slips/${receptionId}`, payload);
    }
}

export default receptionService;