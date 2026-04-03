import {authApi} from './baseApi';

const dashboardService = {
    getDoctorSummary(params) {
        return authApi.get('/doctors/me/dashboard-summary', { params });
    }
}

export default dashboardService;