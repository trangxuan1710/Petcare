import {authApi} from './baseApi';
import { toTitleCase } from '../utils/textFormat';

const normalizePetPayload = (payload = {}) => ({
    ...payload,
    name: toTitleCase(payload?.name || ''),
    species: toTitleCase(payload?.species || ''),
    breed: toTitleCase(payload?.breed || ''),
});

const petService = {
    createPet(payload) {
        return authApi.post('/pets', normalizePetPayload(payload));
    },
    getExamHistory(petId) {
        return authApi.get(`/pets/${petId}/exam-history`);
    }
}

export default petService;
