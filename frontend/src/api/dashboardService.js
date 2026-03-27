import {authApi} from './baseApi';

const dashboardService = {
    getDoctorSummary(params) {
        return authApi.get('/dashboard/doctor-summary', {params});
    }
}

export default dashboardService;