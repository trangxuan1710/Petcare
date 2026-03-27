import {publicApi, authApi} from './baseApi';

const authService = {
    login(payload){
        const response = publicApi.post('/auth/public/login', payload);
        response.then(res => {
            const accessToken = res.data.token;
            const userRole = res.data.user.role;
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('user_role', userRole);
        });
        return response;
    },
    logout(){
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        return authApi.delete('/auth/logout');
    }   
}

export default authService;