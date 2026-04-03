import {authApi} from './baseApi';

const getApiData = (response) => response?.data?.data;

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const paymentService = {
    createInvoice(payload){
        return authApi.post('/invoices', payload);
    },
    async getInvoiceById(invoiceId){
        const response = await authApi.get(`/invoices/${invoiceId}`);
        return { ...response, data: getApiData(response) };
    },
    patchInvoiceById(invoiceId, payload){
        return authApi.patch(`/invoices/${invoiceId}`, payload);
    },
    async getInvoicePreview(receptionSlipId){
        try {
            const response = await authApi.get(`/reception-slips/${receptionSlipId}/invoice`);
            return { ...response, data: getApiData(response), notFound: false };
        } catch (error) {
            if (error?.response?.status === 404) {
                return { data: null, notFound: true };
            }
            throw error;
        }
    },
    async getPaymentMethods(){
        const response = await authApi.get('/payment-methods');
        return { ...response, data: toArray(getApiData(response)) };
    },
    buildInvoicePayload({ medicalRecordId, paymentMethodId, totalAmount, receptionistId, note }) {
        return {
            medicalRecord: { id: Number(medicalRecordId) },
            paymentMethod: { id: Number(paymentMethodId) },
            receptionist: receptionistId ? { id: Number(receptionistId) } : undefined,
            totalAmount: Number(totalAmount),
            status: 'PAID',
            note: note || 'Thanh toán tại quầy',
        };
    },
}

export default paymentService;