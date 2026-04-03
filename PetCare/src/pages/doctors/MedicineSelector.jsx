import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, SlidersHorizontal, Minus, Plus, ChevronDown } from 'lucide-react';
import MedicineCard from '../../components/doctor/MedicineCard';
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

    const normalized = String(rawPrice).replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const normalizeMedicine = (item) => ({
    ...item,
    desc: item?.desc || item?.description || item?.type || '',
    price: typeof item?.price === 'string' && item.price.includes('đ')
        ? item.price
        : formatVnd(getPriceNumber(item)),
    unit: item?.unit
        ? (String(item.unit).startsWith('/') ? item.unit : `/${item.unit}`)
        : '/đơn vị',
    stock: item?.stock ?? item?.stockQuantity ?? item?.availableStock ?? '--',
    qty: Number(item?.qty ?? item?.quantity ?? 0),
    selectedUnit: item?.selectedUnit || item?.unit || 'Đơn vị',
    dosage: {
        morning: Number(item?.dosage?.morning || 0),
        noon: Number(item?.dosage?.noon || 0),
        afternoon: Number(item?.dosage?.afternoon || 0),
        evening: Number(item?.dosage?.evening || 0),
        note: item?.dosage?.note || item?.note || '',
    },
});

const MedicineSelector = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedFromState = useMemo(
        () => toArray(location.state?.selectedMedicines).map(normalizeMedicine),
        [location.state?.selectedMedicines]
    );
    const returnPath = location.state?.returnPath;
    const treatmentSlipId = location.state?.treatmentSlipId;
    const receptionId = location.state?.receptionId;
    const [showDosageModal, setShowDosageModal] = useState(false);
    const [activeDosageMedId, setActiveDosageMedId] = useState(null);
    const [dosageDraft, setDosageDraft] = useState({
        morning: 0,
        noon: 0,
        afternoon: 0,
        evening: 0,
        note: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [medsList, setMedsList] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchMedicines = async () => {
            const response = await medicineService.listMedicines();
            if (!isMounted) return;
            const apiMedicines = toArray(response?.data || []).map(normalizeMedicine);
            if (selectedFromState.length === 0) {
                setMedsList(apiMedicines);
                return;
            }

            const selectedById = new Map(selectedFromState.map((item) => [item.id, item]));
            const merged = apiMedicines.map((med) => {
                const selected = selectedById.get(med.id);
                if (!selected) return med;
                return {
                    ...med,
                    ...selected,
                    selected: true,
                };
            });

            const newSelectedNotInSearch = selectedFromState.filter(
                (selectedMed) => !merged.some((apiMed) => apiMed.id === selectedMed.id)
            );

            setMedsList([...merged, ...newSelectedNotInSearch]);
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
                    ? {
                        ...med,
                        selected: !med.selected,
                        expanded: med.selected ? false : med.expanded
                    }
                    : med
            )
        );
    };

    const updateQty = (id, delta) => {
        setMedsList(prevList => 
            prevList.map(med => {
                if (med.id === id) {
                    const newQty = med.qty + delta;
                    return { ...med, qty: newQty < 0 ? 0 : newQty };
                }
                return med;
            })
        );
    };

    const toggleExpand = (id) => {
        setMedsList((prevList) =>
            prevList.map((med) => {
                if (med.id === id) {
                    return { ...med, expanded: !med.expanded, selected: true };
                }
                return { ...med, expanded: false };
            })
        );
    };

    const openDosageModal = (id) => {
        const target = medsList.find((med) => med.id === id);
        if (!target) return;
        setActiveDosageMedId(id);
        setDosageDraft({ ...target.dosage });
        setShowDosageModal(true);
    };

    const updateDosageValue = (field, delta) => {
        setDosageDraft((prev) => ({
            ...prev,
            [field]: Math.max(0, prev[field] + delta)
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

    const handleConfirm = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const selectedMedicines = medsList.filter((med) => med.selected);
            await medicineService.saveSelection(selectedMedicines);
            if (returnPath) {
                navigate(returnPath, {
                    state: {
                        receptionId,
                        treatmentSlipId,
                        selectedMedicines,
                    },
                });
                return;
            }
            navigate(-1);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="med-selector-page">
            {/* Header */}
            <header className="ms-header">
                <button className="ms-btn-icon" onClick={() => navigate(-1)}><ChevronLeft size={24} color="#1a1a1a" /></button>
                <h1 className="ms-title">Thuốc & Vật tư đi kèm</h1>
                <div style={{ width: 32 }}></div>
            </header>

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
                        <MedicineCard
                            key={med.id}
                            med={med}
                            onToggleSelection={toggleSelection}
                            onToggleExpand={toggleExpand}
                            onUpdateQty={updateQty}
                            onOpenDosageModal={openDosageModal}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="ms-bottom-actions">
                <button className="ms-btn-skip" onClick={() => navigate(-1)}>Bỏ qua</button>
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
