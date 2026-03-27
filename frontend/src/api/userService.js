import {authApi} from './baseApi';

const userService = {
    getUsers(params) {
        return authApi.get('/users/me', {params});
    },
    getUserAvatarById(userId) {
        return authApi.get(`/users/avatar/${userId}`);
    }
}

export default userService;