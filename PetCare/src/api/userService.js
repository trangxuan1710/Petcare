import {authApi} from './baseApi';

const getApiData = (response) => response?.data?.data;

const userService = {
    async getUsers(params) {
        const response = await authApi.get('/users/me', {params});
        return { ...response, data: getApiData(response) || null };
    },
    getUserAvatarById(userId) {
        return authApi.get(`/users/avatar/${userId}`);
    }
}

export default userService;