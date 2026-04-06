import {authApi} from './baseApi';

const treatmentService = {
    createTreatmentSlip(payload) {
        return authApi.post('/treatment-slips', payload);
    },
    getTreatmentSlipsByReceptionId(receptionId) {
        return authApi.get(`/treatment-slips/reception/${receptionId}`);
    },
    getTreatmentSlipById(treatmentSlipId) {
        return authApi.get(`/treatment-slips/${treatmentSlipId}`);
    },
    async getTreatmentDetailFlexible(receptionOrSlipId) {
        try {
            return await this.getTreatmentSlipById(receptionOrSlipId);
        } catch (error) {
            if (error?.response?.status === 404 || error?.response?.status === 500) {
                return { data: { data: null } };
            }
            throw error;
        }
    },
    patchTreatmentSlipById(treatmentSlipId, payload) {
        return authApi.patch(`/treatment-slips/${treatmentSlipId}`, payload);
    },
    recordExamResult(receptionId, payload, images = []) {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload || {}));
        images.forEach((file) => {
            formData.append('images', file);
        });

        return authApi.post(`/reception-slips/${receptionId}/exam-results`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getPrescriptionAutofill(receptionId) {
        return authApi.get(`/reception-slips/${receptionId}/prescription-autofill`);
    }
}

export default treatmentService;