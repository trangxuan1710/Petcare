import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Minus, Plus } from 'lucide-react';
import './MedicineSelector.css';
import medicineService from '../../api/medicineService';

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const getPriceNumber = (item) => {
    const rawPrice = item?.price
        ?? item?.unitPrice
        ?? item?.sellingPrice
        ?? item?.retailPrice
        ?? item?.cost
        ?? item?.amount;

    if (rawPrice == null || rawPrice === '') return 0;
    if (typeof rawPrice === 'number') return rawPrice;

    const rawText = String(rawPrice).trim();
    if (!rawText) return 0;

    const digitsAndSeparators = rawText.replace(/[^\d,.-]/g, '');
    if (!digitsAndSeparators) return 0;

    // Handle common VN currency formatting, e.g. 12.000 or 12.000,50.
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(digitsAndSeparators)) {
        const normalizedVn = digitsAndSeparators.replace(/\./g, '').replace(',', '.');
        const parsedVn = Number(normalizedVn);
        return Number.isFinite(parsedVn) ? parsedVn : 0;
    }

    // Handle EN-style grouping, e.g. 12,000 or 12,000.50.
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(digitsAndSeparators)) {
        const normalizedEn = digitsAndSeparators.replace(/,/g, '');
        const parsedEn = Number(normalizedEn);
        return Number.isFinite(parsedEn) ? parsedEn : 0;
    }

    const normalized = digitsAndSeparators.replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const formatStock = (value) => {
    if (value == null || value === '') return '--';
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return String(value);
    return parsed.toLocaleString('vi-VN');
};

const UNIT_LABEL_MAP = {
    tablet: 'viên',
    tablets: 'viên',
    pill: 'viên',
    pills: 'viên',
    capsule: 'viên nang',
    capsules: 'viên nang',
    cap: 'viên nang',
    vial: 'lọ',
    bottle: 'chai',
    box: 'hộp',
    pack: 'gói',
    packet: 'gói',
    sachet: 'gói',
    tube: 'tuýp',
    ampoule: 'ống',
    ampule: 'ống',
    bag: 'túi',
    ml: 'ml',
    l: 'lít',
    liter: 'lít',
    litre: 'lít',
    mg: 'mg',
    g: 'g',
    kg: 'kg',
    unit: 'đơn vị',
};

const toVietnameseUnit = (rawUnit) => {
    const normalizedRaw = String(rawUnit || '')
        .trim()
        .toLowerCase()
        .replace(/^\//, '');

    if (!normalizedRaw) return 'đơn vị';
    return UNIT_LABEL_MAP[normalizedRaw] || normalizedRaw;
};

const isMaterialType = (type) => {
    const normalized = String(type || '').trim().toUpperCase();
    return normalized === 'VAT_TU' || normalized === 'MATERIAL' || normalized === 'SUPPLY';
};

const normalizeDoseValue = (rawValue) => {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
};

const resolvePriceBySelectedUnit = (item, selectedUnit) => {
    const boxPrice = Number(item?.boxPrice ?? item?.rawBoxPrice ?? 0);
    const unitPrice = Number(item?.unitPrice ?? item?.rawUnitPrice ?? getPriceNumber(item));
    const normalizedUnit = String(selectedUnit || '').trim().toLowerCase();

    if (normalizedUnit === 'hộp' || normalizedUnit === 'hop' || normalizedUnit === 'box') {
        if (Number.isFinite(boxPrice) && boxPrice > 0) {
            return boxPrice;
        }
    }
    return Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : 0;
};

const normalizeMedicine = (item) => {
    const baseUnit = item?.unit || item?.selectedUnit || '';
    const normalizedSelectedUnit = toVietnameseUnit(baseUnit);
    const selectedUnit = normalizedSelectedUnit || 'đơn vị';
    const rawUnitPrice = Number(item?.unitPrice ?? item?.rawUnitPrice ?? getPriceNumber(item));
    const quantityPerBox = Math.max(1, Number(item?.quantityPerBox ?? item?.boxQuantity ?? 1) || 1);
    const rawBoxPrice = Number(item?.boxPrice ?? item?.rawBoxPrice ?? 0) || rawUnitPrice * quantityPerBox;

    const type = String(item?.type || 'THUOC').toUpperCase().trim();
    return {
        ...item,
        type,
        desc: item?.desc || item?.description || type || '',
        rawUnitPrice,
        rawBoxPrice,
        quantityPerBox,
        price: formatVnd(rawBoxPrice),
        unit: `/${selectedUnit}`,
        stock: item?.stock ?? item?.stockQuantity ?? item?.availableStock ?? '--',
        qty: Math.max(1, Number(item?.qty ?? item?.quantity ?? 1)),
        selectedUnit,
        dosage: {
            morning: normalizeDoseValue(item?.dosage?.morning),
            noon: normalizeDoseValue(item?.dosage?.noon),
            afternoon: normalizeDoseValue(item?.dosage?.afternoon),
            evening: normalizeDoseValue(item?.dosage?.evening),
            note: item?.dosage?.note || item?.note || '',
        },
    };
};

const mergeMedicinesBySelected = (apiMedicines, selectedMedicines) => {
    if (!Array.isArray(apiMedicines) || apiMedicines.length === 0) {
        return Array.isArray(selectedMedicines) ? selectedMedicines : [];
    }

    if (!Array.isArray(selectedMedicines) || selectedMedicines.length === 0) {
        return apiMedicines;
    }

    const selectedById = new Map(selectedMedicines.map((item) => [item.id, item]));
    const merged = apiMedicines.map((med) => {
        const selected = selectedById.get(med.id);
        if (!selected) return med;
        return {
            ...med,
            ...selected,
            id: med.id,
            name: med.name,
            type: med.type,
            desc: med.desc,
            unit: med.unit,
            unitOptions: med.unitOptions,
            selected: true,
        };
    });

    const selectedOnly = selectedMedicines.filter(
        (selectedMed) => !merged.some((apiMed) => apiMed.id === selectedMed.id)
    );

    return [...merged, ...selectedOnly];
};

const TechMedicineSelector = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedFromState = useMemo(
        () => toArray(location.state?.selectedMedicines)
            .map(normalizeMedicine)
            .filter((item) => isMaterialType(item?.type))
            .filter((item) => Boolean(item?.selected)),
        [location.state?.selectedMedicines]
    );
    const returnPath = location.state?.returnPath;
    const selectedImagesDraft = location.state?.selectedImagesDraft;
    const recordDraft = location.state?.recordDraft;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [medsList, setMedsList] = useState([]);
    const [autofillByMedicineId, setAutofillByMedicineId] = useState({});

    const applyAutofillIfAvailable = (medicine) => {
        if (!medicine) return medicine;

        const autofill = autofillByMedicineId[medicine.id];
        if (!autofill) {
            return medicine;
        }

        const selectedUnit = autofill.selectedUnit || medicine.selectedUnit;
        const mergedMedicine = {
            ...medicine,
            qty: Math.max(1, Number(autofill.qty ?? medicine.qty ?? 1)),
            selectedUnit,
            dosage: {
                morning: normalizeDoseValue(autofill?.dosage?.morning ?? medicine?.dosage?.morning),
                noon: normalizeDoseValue(autofill?.dosage?.noon ?? medicine?.dosage?.noon),
                afternoon: normalizeDoseValue(autofill?.dosage?.afternoon ?? medicine?.dosage?.afternoon),
                evening: normalizeDoseValue(autofill?.dosage?.evening ?? medicine?.dosage?.evening),
                note: autofill?.dosage?.note ?? medicine?.dosage?.note ?? '',
            },
        };

        return {
            ...mergedMedicine,
            price: formatVnd(mergedMedicine.rawBoxPrice || resolvePriceBySelectedUnit(mergedMedicine, 'hộp')),
            unit: `/${selectedUnit}`,
        };
    };

    useEffect(() => {
        let isMounted = true;
        const fetchMedicines = async () => {
            const response = await medicineService.listMedicines({ type: 'VAT_TU', limit: 100 });
            if (!isMounted) return;
            const apiMedicines = toArray(response?.data || [])
                .map(normalizeMedicine)
                .filter((medicine) => isMaterialType(medicine.type));
            setAutofillByMedicineId({});

            if (selectedFromState.length > 0) {
                setMedsList(mergeMedicinesBySelected(apiMedicines, selectedFromState));
                return;
            }

            // Autofill is not applicable for tech staff logic
            setMedsList(apiMedicines);
        };
        fetchMedicines();
        return () => {
            isMounted = false;
        };
    }, [selectedFromState]);

    const toggleSelection = (id) => {
        setMedsList(prevList =>
            prevList.map(med =>
                med.id === id
                    ? (() => {
                        const isSelecting = !med.selected;
                        const selectedMed = isSelecting ? applyAutofillIfAvailable(med) : med;
                        return {
                            ...selectedMed,
                            selected: isSelecting,
                            expanded: isSelecting ? selectedMed.expanded : false,
                            qty: Math.max(1, Number(selectedMed.qty || 0)),
                        };
                    })()
                    : med
            )
        );
    };

    const updateQty = (id, delta) => {
        setMedsList(prevList =>
            prevList.map(med => {
                if (med.id === id) {
                    const newQty = med.qty + delta;
                    return { ...med, qty: newQty < 1 ? 1 : newQty };
                }
                return med;
            })
        );
    };

    const filteredMeds = medsList.filter((med) => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return true;
        return `${med.name} ${med.desc}`.toLowerCase().includes(keyword);
    });

    const getSelectedMedicines = () => medsList.filter((med) => med.selected);

    const navigateBackToRecordResult = (selectedMedicines) => {
        if (!returnPath) {
            navigate(-1);
            return;
        }

        navigate(returnPath, {
            state: {
                selectedMedicines: selectedMedicines.map(med => ({
                    medicineId: med.id,
                    medicineName: med.name,
                    quantity: med.qty,
                    instruction: med.dosage?.note || '',
                    dosageUnit: med.selectedUnit,
                    selectedUnit: med.selectedUnit,
                    unitOptions: med.unitOptions,
                    image: med.image,
                    desc: med.desc,
                    stock: med.stock,
                    price: med.price,
                    type: med.type,
                    morning: med.dosage?.morning || 1,
                    noon: med.dosage?.noon || 1,
                    afternoon: med.dosage?.afternoon || 1,
                    evening: med.dosage?.evening || 1,
                })),
                selectedImagesDraft,
                recordDraft,
            },
        });
    };

    const handleConfirm = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const selectedMedicines = getSelectedMedicines();
            await medicineService.saveSelection(selectedMedicines);
            navigateBackToRecordResult(selectedMedicines);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="med-selector-page">
            {/* Header */}
            <div className="ms-header">
                <button className="ms-btn-icon" onClick={() => navigateBackToRecordResult(getSelectedMedicines())}><ChevronLeft size={24} color="#1a1a1a" /></button>
                <h1 className="ms-title">Vật tư đi kèm</h1>
                <div style={{ width: 32 }}></div>
            </div>

            {/* Search Bar */}
            <div className="ms-search-container">
                <div className="ms-search-box">
                    <Search size={20} color="#209D80" className="ms-search-icon" />
                    <input type="text" placeholder="Search" className="ms-search-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                </div>
                {/* <button className="ms-filter-btn">
                    <SlidersHorizontal size={20} color="#209D80" />
                </button> */}
            </div>

            {/* Meds List */}
            <div className="ms-content">
                <div className="ms-meds-list">
                    {filteredMeds.map(med => (
                        <article key={med.id} className={`ms-lite-card ${med.selected ? 'selected' : ''}`}>
                            <div className="ms-lite-head">
                                <label className="ms-lite-check" aria-label={`Chọn ${med.name}`}>
                                    <input
                                        type="checkbox"
                                        checked={med.selected}
                                        onChange={() => toggleSelection(med.id)}
                                    />
                                </label>

                                <img src={med.image} alt={med.name} className="ms-lite-thumb" />

                                <div className="ms-lite-main">
                                    <div className="ms-lite-top">
                                        <strong className="ms-lite-name">{med.name}</strong>
                                        <strong>{med.price}</strong>
                                    </div>

                                    {med.desc ? <p className="ms-lite-desc">{med.desc}</p> : null}

                                    <div className="ms-lite-meta">
                                        {/* <span>Dự kiến: {med.qty} {med.selectedUnit}</span> */}
                                        <span>Tồn: {formatStock(med.stock)}</span>
                                    </div>
                                </div>
                            </div>

                            {med.selected && (
                                <>
                                    <div className="ms-lite-controls">
                                        <div className="ms-lite-stepper">
                                            <button onClick={() => updateQty(med.id, -1)} type="button">
                                                <Minus size={16} />
                                            </button>
                                            <span>{med.qty}</span>
                                            <button onClick={() => updateQty(med.id, 1)} type="button">
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <div className="ms-lite-unit-text">
                                            {med.selectedUnit}
                                        </div>

                                    </div>
                                </>
                            )}
                        </article>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="ms-bottom-actions">
                <button className="ms-btn-skip" onClick={() => navigateBackToRecordResult(getSelectedMedicines())}>Bỏ qua</button>
                <button className="ms-btn-confirm" onClick={handleConfirm}>{isSubmitting ? 'Đang lưu...' : 'Xác nhận'}</button>
            </div>

        </div>
    );
};

export default TechMedicineSelector;
