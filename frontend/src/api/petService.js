import {authApi} from './baseApi';

const petService = {
    createPet(payload) {
        return authApi.post('/pets', payload);
    }
}

export default petService;