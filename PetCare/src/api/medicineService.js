import { authApi } from './baseApi';

const getPriceNumber = (item) => {
    const rawPrice = item?.price
        ?? item?.unitPrice
        ?? item?.sellingPrice
        ?? item?.retailPrice
        ?? item?.cost
        ?? item?.amount;

    if (rawPrice == null || rawPrice === '') return 0;
    if (typeof rawPrice === 'number') return rawPrice;

    const normalized = String(rawPrice).replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const getStockValue = (item) => {
    const rawStock = item?.stock
        ?? item?.stockQuantity
        ?? item?.quantity
        ?? item?.inventory
        ?? item?.availableStock
        ?? item?.remainingQuantity
        ?? item?.inStock;
    if (rawStock == null || rawStock === '') return '--';
    return Number.isNaN(Number(rawStock)) ? rawStock : Number(rawStock);
};

const mapMedicineItem = (item) => ({
    id: item?.id,
    name: item?.name || 'Thuoc vat tu',
    desc: item?.description || item?.type || '',
    price: formatVnd(getPriceNumber(item)),
    unitPrice: getPriceNumber({ price: item?.unitPrice ?? item?.price }),
    boxPrice: getPriceNumber({ price: item?.boxPrice ?? item?.price }),
    unit: item?.unit ? `/${item.unit}` : '/don vi',
    stock: getStockValue(item),
    image: item?.imageUrl || 'https://placehold.co/80x80/f4f4f5/a1a1aa?text=Med',
    selected: false,
    qty: 1,
    selectedUnit: item?.unit || 'Don vi',
    expanded: false,
    dosage: {
        morning: 1,
        noon: 1,
        afternoon: 1,
        evening: 1,
        note: '',
    },
});

const medicineService = {
    async listMedicines(params = {}) {
        const response = await authApi.get('/medicines/search', {
            params: {
                keyword: params?.keyword,
                limit: params?.limit || 50,
            },
        });
        const items = response?.data?.data || [];
        return { ...response, data: items.map(mapMedicineItem) };
    },
    async saveSelection(payload) {
        // Selection is persisted together with exam result submission.
        return Promise.resolve({ data: payload });
    },
};

export default medicineService;
