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

const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}d`;

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

const normalizeUnit = (value) => String(value || '').replace(/^\//, '').trim();

const mapMedicineItem = (item) => {
    const itemType = String(item?.type || 'THUOC').toUpperCase().trim();

    const unitPrice = getPriceNumber({ price: item?.unitPrice ?? item?.price });
    const quantityPerBox = Math.max(1, Number(item?.quantityPerBox ?? item?.boxQuantity ?? 1));
    const boxPrice = getPriceNumber({ price: item?.boxPrice }) || (unitPrice * quantityPerBox);

    const selectedUnit = normalizeUnit(item?.unit || item?.dosageUnit || 'don v?');
    const normalizedUnit = selectedUnit.toLowerCase();
    const isBoxUnit = normalizedUnit === 'h?p' || normalizedUnit === 'hop' || normalizedUnit === 'box';
    const displayPrice = isBoxUnit ? boxPrice : unitPrice;

    return {
        id: item?.id,
        name: item?.name || 'Thu?c v?t tu',
        desc: item?.description || item?.desc || itemType || '',
        type: itemType,
        speciesCodes: Array.isArray(item?.speciesCodes) ? item.speciesCodes : [],
        speciesLabels: Array.isArray(item?.speciesLabels) ? item.speciesLabels : [],
        price: formatVnd(displayPrice),
        unitPrice,
        quantityPerBox,
        boxPrice,
        unit: `/${selectedUnit}`,
        stock: getStockValue(item),
        image: item?.imageUrl || 'https://placehold.co/80x80/f4f4f5/a1a1aa?text=Med',
        selected: false,
        qty: 1,
        selectedUnit,
        expanded: false,
        dosage: {
            morning: 1,
            noon: 1,
            afternoon: 1,
            evening: 1,
            note: '',
        },
    };
};

const medicineService = {
    async listMedicines(params = {}) {
        const response = await authApi.get('/medicines/search', {
            params: {
                keyword: params?.keyword,
                type: params?.type,
                species: params?.species || params?.objective,
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
