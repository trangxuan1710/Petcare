import {authApi} from './baseApi';

const petService = {
    createPet(payload) {
        return authApi.post('/pets', payload);
    },
    getExamHistory(petId) {
        return authApi.get(`/pets/${petId}/exam-history`);
    }
}

export default petService;