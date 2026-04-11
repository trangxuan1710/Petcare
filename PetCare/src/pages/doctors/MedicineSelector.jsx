import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Minus, Plus, ChevronDown, PencilLine } from 'lucide-react';
import './MedicineSelector.css';
import medicineService from '../../api/medicineService';
import treatmentService from '../../api/treatmentService';

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

const TABLET_UNIT_OPTIONS = ['hộp', 'vỉ'];
const BOX_ONLY_UNIT_OPTIONS = ['hộp'];

const TABLET_UNIT_KEYS = new Set(['tablet', 'tablets', 'pill', 'pills', 'capsule', 'capsules', 'cap', 'vien', 'viên', 'vien nang', 'viên nang']);
const LIQUID_UNIT_KEYS = new Set(['ml', 'bottle', 'vial', 'ampoule', 'ampule', 'drop', 'liquid', 'syrup', 'lọ', 'chai']);

const toVietnameseUnit = (rawUnit) => {
    const normalizedRaw = String(rawUnit || '')
        .trim()
        .toLowerCase()
        .replace(/^\//, '');

    if (!normalizedRaw) return 'đơn vị';
    return UNIT_LABEL_MAP[normalizedRaw] || normalizedRaw;
};

const normalizeUnitKey = (rawUnit) => String(rawUnit || '').trim().toLowerCase().replace(/^\//, '');

const resolveUnitOptions = (rawUnit) => {
    const normalized = normalizeUnitKey(rawUnit);
    if (TABLET_UNIT_KEYS.has(normalized)) {
        return TABLET_UNIT_OPTIONS;
    }
    if (LIQUID_UNIT_KEYS.has(normalized)) {
        return BOX_ONLY_UNIT_OPTIONS;
    }
    return BOX_ONLY_UNIT_OPTIONS;
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

    const type = String(item?.type || 'THUOC').toUpperCase().trim();
    return {
        ...item,
        type,
        desc: item?.desc || item?.description || type || '',
        rawUnitPrice: Number(item?.unitPrice ?? item?.rawUnitPrice ?? getPriceNumber(item)),
        rawBoxPrice: Number(item?.boxPrice ?? item?.rawBoxPrice ?? getPriceNumber(item)),
        price: formatVnd(resolvePriceBySelectedUnit(item, selectedUnit)),
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

const MedicineSelector = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedFromState = useMemo(
        () => toArray(location.state?.selectedMedicines)
            .map(normalizeMedicine)
            .filter((item) => Boolean(item?.selected)),
        [location.state?.selectedMedicines]
    );
    const returnPath = location.state?.returnPath;
    const treatmentSlipId = location.state?.treatmentSlipId;
    const receptionId = location.state?.receptionId;
    const recordResultDraft = location.state?.recordResultDraft;
    const [showDosageModal, setShowDosageModal] = useState(false);
    const [activeDosageMedId, setActiveDosageMedId] = useState(null);
    const [dosageDraft, setDosageDraft] = useState({
        morning: 1,
        noon: 1,
        afternoon: 1,
        evening: 1,
        note: ''
    });
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
            price: formatVnd(resolvePriceBySelectedUnit(mergedMedicine, selectedUnit)),
            unit: `/${selectedUnit}`,
        };
    };

    useEffect(() => {
        let isMounted = true;
        const fetchMedicines = async () => {
            const response = await medicineService.listMedicines();
            if (!isMounted) return;
            const apiMedicines = toArray(response?.data || []).map(normalizeMedicine);
            setAutofillByMedicineId({});

            if (selectedFromState.length > 0) {
                setMedsList(mergeMedicinesBySelected(apiMedicines, selectedFromState));
                return;
            }

            if (!receptionId) {
                setMedsList(apiMedicines);
                return;
            }

            try {
                const autofillResponse = await treatmentService.getPrescriptionAutofill(receptionId);
                if (!isMounted) return;

                const autofillMedicines = toArray(autofillResponse?.data?.data?.medicines)
                    .map((item) => normalizeMedicine({
                        ...item,
                        qty: Math.max(Number(item?.quantity || 0), 1),
                    }));

                if (autofillMedicines.length > 0) {
                    const cache = autofillMedicines.reduce((acc, medicine) => {
                        acc[medicine.id] = {
                            qty: medicine.qty,
                            selectedUnit: medicine.selectedUnit,
                            dosage: medicine.dosage,
                        };
                        return acc;
                    }, {});
                    setAutofillByMedicineId(cache);
                }
            } catch {
                // Fallback to manual selection list if autofill endpoint is unavailable.
                if (isMounted) {
                    setAutofillByMedicineId({});
                }
            }

            setMedsList(apiMedicines);
        };
        fetchMedicines();
        return () => {
            isMounted = false;
        };
    }, [selectedFromState, receptionId]);

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

    const updateSelectedUnit = (id, newUnit) => {
        setMedsList((prevList) =>
            prevList.map((med) => {
                if (med.id !== id) return med;
                return {
                    ...med,
                    selectedUnit: newUnit,
                    price: formatVnd(resolvePriceBySelectedUnit(med, newUnit)),
                    unit: `/${newUnit}`,
                    selected: true,
                };
            })
        );
    };

    const openDosageModal = (id) => {
        const target = medsList.find((med) => med.id === id);
        if (!target) return;
        setActiveDosageMedId(id);
        setDosageDraft({
            morning: normalizeDoseValue(target?.dosage?.morning),
            noon: normalizeDoseValue(target?.dosage?.noon),
            afternoon: normalizeDoseValue(target?.dosage?.afternoon),
            evening: normalizeDoseValue(target?.dosage?.evening),
            note: target?.dosage?.note || '',
        });
        setShowDosageModal(true);
    };

    const updateDosageValue = (field, delta) => {
        setDosageDraft((prev) => ({
            ...prev,
            [field]: Math.max(0, Number(prev?.[field] ?? 1) + delta)
        }));
    };

    const saveDosage = () => {
        if (!activeDosageMedId) return;
        setMedsList((prevList) =>
            prevList.map((med) =>
                med.id === activeDosageMedId
                    ? { ...med, dosage: { ...dosageDraft }, expanded: true, selected: true }
                    : med
            )
        );
        setShowDosageModal(false);
        setActiveDosageMedId(null);
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
                receptionId,
                treatmentSlipId,
                selectedMedicines,
                recordResultDraft: {
                    ...(recordResultDraft || {}),
                    medsList: selectedMedicines,
                },
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
                <h1 className="ms-title">Thuốc & Vật tư đi kèm</h1>
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

                                    {/* {med.desc ? <p className="ms-lite-desc">{med.desc}</p> : null} */}

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
                                            {med.type === 'THUOC' ? 'hộp' : med.selectedUnit}
                                        </div>

                                        {med.type === 'THUOC' && (
                                            <button className="ms-lite-dosage" type="button" onClick={() => openDosageModal(med.id)}>
                                                <PencilLine size={14} /> Chỉnh liều
                                            </button>
                                        )}
                                    </div>

                                    {med.type === 'THUOC' && (
                                        <div className="ms-lite-dosage-summary">
                                            <div className="ms-lite-dosage-row">
                                                <span>Sáng</span>
                                                <span>{med?.dosage?.morning || 0} {med.selectedUnit}</span>
                                            </div>
                                            <div className="ms-lite-dosage-row">
                                                <span>Trưa</span>
                                                <span>{med?.dosage?.noon || 0} {med.selectedUnit}</span>
                                            </div>
                                            <div className="ms-lite-dosage-row">
                                                <span>Chiều</span>
                                                <span>{med?.dosage?.afternoon || 0} {med.selectedUnit}</span>
                                            </div>
                                            <div className="ms-lite-dosage-row">
                                                <span>Tối</span>
                                                <span>{med?.dosage?.evening || 0} {med.selectedUnit}</span>
                                            </div>
                                            <div className="ms-lite-dosage-row note">
                                                <span>Chỉ định khác</span>
                                                <span>{med?.dosage?.note || '--'}</span>
                                            </div>
                                        </div>
                                    )}
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

            {/* Dosage Modal Bottom Sheet */}
            {showDosageModal && (
                <>
                    <div className="dosage-modal-overlay" onClick={() => setShowDosageModal(false)}></div>
                    <div className="dosage-modal-content">
                        <div className="dosage-modal-handle"></div>
                        <h2 className="dosage-modal-title">Liều dùng</h2>

                        <div className="dosage-main-area">
                            {['Sáng', 'Trưa', 'Chiều', 'Tối'].map((time, idx) => (
                                <div key={time} className="dosage-row">
                                    <span className="dosage-label">{time}</span>
                                    <div className="dosage-controls">
                                        <div className="dosage-stepper">
                                            <button
                                                className="dosage-step-btn"
                                                type="button"
                                                onClick={() => updateDosageValue(
                                                    idx === 0 ? 'morning' : idx === 1 ? 'noon' : idx === 2 ? 'afternoon' : 'evening',
                                                    -1
                                                )}
                                            >
                                                <Minus size={16} color="#666" />
                                            </button>
                                            <span className="dosage-step-val">
                                                {idx === 0
                                                    ? dosageDraft.morning
                                                    : idx === 1
                                                        ? dosageDraft.noon
                                                        : idx === 2
                                                            ? dosageDraft.afternoon
                                                            : dosageDraft.evening}
                                            </span>
                                            <button
                                                className="dosage-step-btn"
                                                type="button"
                                                onClick={() => updateDosageValue(
                                                    idx === 0 ? 'morning' : idx === 1 ? 'noon' : idx === 2 ? 'afternoon' : 'evening',
                                                    1
                                                )}
                                            >
                                                <Plus size={16} color="#666" />
                                            </button>
                                        </div>
                                        <div className="dosage-unit">
                                            <span>Viên</span>
                                            <ChevronDown size={16} color="#888" />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="dosage-note-row">
                                <span className="dosage-label">Chỉ định khác</span>
                                <div className="dosage-textarea-box">
                                    <textarea
                                        className="dosage-textarea"
                                        value={dosageDraft.note}
                                        onChange={(event) => setDosageDraft((prev) => ({ ...prev, note: event.target.value }))}
                                    ></textarea>
                                    <span className="dosage-char-count">2000</span>
                                </div>
                            </div>
                        </div>

                        <div className="dosage-bottom-action">
                            <button className="dosage-btn-confirm-final" onClick={saveDosage}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MedicineSelector;
