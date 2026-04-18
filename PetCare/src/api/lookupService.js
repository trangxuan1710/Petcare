import { authApi } from './baseApi';

const getItems = (response) => {
    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
};

const toOption = (item) => ({
    id: item?.id,
    value: item?.value || item?.code || item?.name || '',
    code: item?.code || item?.value || '',
    label: item?.name || item?.label || item?.value || '',
    parentCode: item?.parentCode || '',
});

const lookupService = {
    async listPetSpecies() {
        const response = await authApi.get('/lookups/pet-species');
        return getItems(response).map(toOption);
    },
    async listPetBreeds(species) {
        const response = await authApi.get('/lookups/pet-breeds', {
            params: species ? { species } : undefined,
        });
        return getItems(response).map(toOption);
    },
    async listExamTypes() {
        const response = await authApi.get('/lookups/exam-types');
        return getItems(response).map(toOption);
    },
    async listMedicineObjectives() {
        const response = await authApi.get('/lookups/medicine-species');
        return getItems(response).map(toOption);
    },
    async listMedicineSpecies() {
        const response = await authApi.get('/lookups/medicine-species');
        return getItems(response).map(toOption);
    },
};

export default lookupService;
