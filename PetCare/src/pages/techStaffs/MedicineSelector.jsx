import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Minus, Plus } from 'lucide-react';
import medicineService from '../../api/medicineService';
import './MedicineSelector.css';

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const normalizeUnit = (value) => String(value || '').replace(/^\//, '').trim();

const formatStock = (value) => {
    if (value == null || value === '') return '--';
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return String(value);
    return parsed.toLocaleString('vi-VN');
};

const getUnitOptions = (item) => {
    if (Array.isArray(item?.unitOptions) && item.unitOptions.length > 0) {
        return item.unitOptions.map(normalizeUnit).filter(Boolean);
    }

    const oneUnit = normalizeUnit(item?.selectedUnit || item?.unit || 'đơn vị');
    return oneUnit ? [oneUnit] : ['đơn vị'];
};

const mapMedicine = (item, selectedMap) => {
    const selected = selectedMap.get(Number(item?.id || 0));
    const unitOptions = getUnitOptions(item);
    const selectedUnit = normalizeUnit(selected?.selectedUnit || selected?.dosageUnit || item?.selectedUnit || item?.unit || unitOptions[0]);

    return {
        id: Number(item?.id || 0),
        name: item?.name || 'Thuốc/Vật tư',
        desc: item?.description || item?.desc || '',
        image: item?.image || 'https://placehold.co/84x84/f4f4f5/a1a1aa?text=Med',
        stock: item?.stock ?? '--',
        price: item?.price || '0đ',
        selected: Boolean(selected),
        qty: Math.max(Number(selected?.quantity || 1), 1),
        instruction: selected?.instruction || '',
        selectedUnit: selectedUnit || unitOptions[0] || 'đơn vị',
        unitOptions: unitOptions.length > 0 ? unitOptions : ['đơn vị'],
    };
};

const TechMedicineSelector = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const selectedFromState = useMemo(
        () => toArray(location.state?.selectedMedicines),
        [location.state?.selectedMedicines]
    );
    const selectedImagesDraft = toArray(location.state?.selectedImagesDraft);
    const returnPath = location.state?.returnPath;
    const recordDraft = location.state?.recordDraft;

    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [medicineList, setMedicineList] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchMedicines = async () => {
            setIsLoading(true);
            try {
                const response = await medicineService.listMedicines({ limit: 200 });
                if (!isMounted) return;

                const selectedMap = new Map(
                    selectedFromState
                        .filter((item) => Number(item?.medicineId || 0) > 0)
                        .map((item) => [
                            Number(item.medicineId),
                            {
                                quantity: Number(item.quantity || 1),
                                instruction: item.instruction || '',
                                selectedUnit: item.selectedUnit || item.dosageUnit || item.unit,
                                dosageUnit: item.dosageUnit,
                            },
                        ])
                );

                const normalized = toArray(response?.data).map((item) => mapMedicine(item, selectedMap));
                setMedicineList(normalized);
            } catch {
                if (!isMounted) return;
                setMedicineList([]);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMedicines();

        return () => {
            isMounted = false;
        };
    }, [selectedFromState]);

    const filteredMedicines = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return medicineList;
        return medicineList.filter((medicine) => `${medicine.name} ${medicine.desc}`.toLowerCase().includes(keyword));
    }, [searchTerm, medicineList]);

    const selectedMedicines = useMemo(
        () => medicineList
            .filter((medicine) => medicine.selected)
            .map((medicine) => ({
                medicineId: medicine.id,
                medicineName: medicine.name,
                quantity: medicine.qty,
                instruction: medicine.instruction || '',
                dosageUnit: medicine.selectedUnit || undefined,
                selectedUnit: medicine.selectedUnit || undefined,
                unitOptions: medicine.unitOptions || [medicine.selectedUnit || 'đơn vị'],
                image: medicine.image,
                desc: medicine.desc,
                stock: medicine.stock,
                price: medicine.price,
            })),
        [medicineList]
    );

    const handleToggle = (medicineId) => {
        setMedicineList((prev) => prev.map((medicine) => (
            medicine.id === medicineId
                ? { ...medicine, selected: !medicine.selected }
                : medicine
        )));
    };

    const updateQuantity = (medicineId, delta) => {
        setMedicineList((prev) => prev.map((medicine) => {
            if (medicine.id !== medicineId) return medicine;
            const nextQty = Math.max(1, Number(medicine.qty || 1) + delta);
            return { ...medicine, qty: nextQty, selected: true };
        }));
    };

    const updateInstruction = (medicineId, instruction) => {
        setMedicineList((prev) => prev.map((medicine) => (
            medicine.id === medicineId
                ? { ...medicine, instruction, selected: true }
                : medicine
        )));
    };

    const updateUnit = (medicineId, unit) => {
        const normalizedUnit = normalizeUnit(unit);
        setMedicineList((prev) => prev.map((medicine) => (
            medicine.id === medicineId
                ? { ...medicine, selectedUnit: normalizedUnit, selected: true }
                : medicine
        )));
    };

    const navigateBack = (confirmed) => {
        if (!returnPath) {
            navigate(-1);
            return;
        }

        navigate(returnPath, {
            state: {
                selectedMedicines: confirmed ? selectedMedicines : selectedFromState,
                selectedImagesDraft,
                recordDraft,
            },
        });
    };

    return (
        <div className="tms-page">
            <header className="tms-header">
                <button type="button" className="tms-icon-btn" onClick={() => navigateBack(false)} aria-label="Quay lại">
                    <ChevronLeft size={22} />
                </button>
                <h1>Chọn thuốc & vật tư</h1>
            </header>

            <div className="tms-search-box">
                <Search size={18} color="#14957d" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm thuốc hoặc vật tư"
                />
            </div>

            <main className="tms-content">
                {isLoading && <div className="tms-empty">Đang tải danh sách...</div>}
                {!isLoading && filteredMedicines.length === 0 && <div className="tms-empty">Không tìm thấy thuốc/vật tư phù hợp.</div>}

                {!isLoading && filteredMedicines.map((medicine) => (
                    <article key={medicine.id} className={`tms-card ${medicine.selected ? 'is-selected' : ''}`}>
                        <div className="tms-item-head">
                            <label className="tms-check" aria-label={`Chọn ${medicine.name}`}>
                                <input type="checkbox" checked={medicine.selected} onChange={() => handleToggle(medicine.id)} />
                            </label>

                            <img src={medicine.image} alt={medicine.name} className="tms-thumb" />

                            <div className="tms-item-main">
                                <div className="tms-main-row">
                                    <strong className="tms-name">{medicine.name}</strong>
                                    <strong>{medicine.price}</strong>
                                </div>

                                {medicine.desc ? <p className="tms-desc">{medicine.desc}</p> : null}

                                <div className="tms-meta-row">
                                    <span>Dự kiến: {medicine.qty}{medicine.selectedUnit ? ` ${medicine.selectedUnit}` : ''}</span>
                                    <span>Tồn: {formatStock(medicine.stock)}</span>
                                </div>
                            </div>
                        </div>

                        {medicine.selected && (
                            <div className="tms-controls">
                                <div className="tms-stepper">
                                    <button type="button" onClick={() => updateQuantity(medicine.id, -1)}>
                                        <Minus size={14} />
                                    </button>
                                    <span>{medicine.qty}</span>
                                    <button type="button" onClick={() => updateQuantity(medicine.id, 1)}>
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <select
                                    className="tms-unit-select"
                                    value={medicine.selectedUnit || ''}
                                    onChange={(event) => updateUnit(medicine.id, event.target.value)}
                                >
                                    {(medicine.unitOptions || [medicine.selectedUnit || 'đơn vị']).map((unitOption) => (
                                        <option key={`${medicine.id}-${unitOption}`} value={unitOption}>
                                            {unitOption}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {medicine.selected && (
                            <input
                                type="text"
                                className="tms-note"
                                value={medicine.instruction}
                                onChange={(event) => updateInstruction(medicine.id, event.target.value)}
                                placeholder="Ghi chú dùng thuốc (tuỳ chọn)"
                            />
                        )}
                    </article>
                ))}
            </main>

            <footer className="tms-footer">
                <button type="button" className="tms-btn-outline" onClick={() => navigateBack(false)}>
                    Hủy
                </button>
                <button type="button" className="tms-btn-primary" onClick={() => navigateBack(true)}>
                    Xác nhận
                </button>
            </footer>
        </div>
    );
};

export default TechMedicineSelector;
