import {authApi} from './baseApi';

const treatmentService = {
    createTreatmentSlip(payload) {
        return authApi.post('/treatment-slips', payload);
    },
    getTreatmentSlipsById(receptionId) {
        return authApi.get(`/treatment-slips/reception/${receptionId}`);
    },
    patchTreatmentSlipById(treatmentSlipId, payload) {
        return authApi.patch(`/treatment-slips/${treatmentSlipId}`, payload);
    }
}

export default treatmentService;