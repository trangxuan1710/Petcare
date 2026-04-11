import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronUp, Plus, Minus, Camera } from 'lucide-react';
import { TECH_PATHS, buildTechRecordResultPath } from '../../routes/techPaths';
import techService from '../../api/techService';
import './RecordResult.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';

const STATUS_LABEL = {
    queued: 'Chờ thực hiện',
    processing: 'Đang thực hiện',
    done: 'Đã hoàn thành',
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeUnit = (value, fallback = 'đơn vị') => {
    const unit = String(value || '').replace(/^\//, '').trim();
    return unit || fallback;
};

const formatStock = (value) => {
    if (value == null || value === '') return '--';
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return String(value);
    return parsed.toLocaleString('vi-VN');
};

const isImageFilePath = (path) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(path || ''));

const toUploadDraftItems = (items) => (Array.isArray(items) ? items : [])
    .map((item, index) => {
        const file = item?.file || item;
        if (!(file instanceof File)) return null;
        return {
            key: `${Date.now()}-${index}-${file.name}-${Math.random()}`,
            file,
            previewUrl: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
            fileName: item?.fileName || file.name,
        };
    })
    .filter(Boolean);

const serializeUploadDraftItems = (items) => (Array.isArray(items) ? items : [])
    .map((item) => {
        const file = item?.file || item;
        if (!(file instanceof File)) return null;
        return {
            file,
            fileName: item?.fileName || file.name,
        };
    })
    .filter(Boolean);

const normalizeSelectedMedicine = (item) => {
    const unit = normalizeUnit(item?.selectedUnit || item?.dosageUnit || item?.unit);
    const unitOptions = Array.isArray(item?.unitOptions) && item.unitOptions.length > 0
        ? item.unitOptions.map((value) => normalizeUnit(value)).filter(Boolean)
        : [unit];

    return {
        medicineId: Number(item?.medicineId || 0),
        medicineName: item?.medicineName || item?.name || 'Thuốc/Vật tư',
        quantity: Math.max(1, toNumber(item?.quantity, 1)),
        instruction: item?.instruction || '',
        selectedUnit: unit,
        dosageUnit: unit,
        unitOptions: Array.from(new Set(unitOptions.length > 0 ? unitOptions : [unit])),
        image: item?.image || 'https://placehold.co/84x84/f4f4f5/a1a1aa?text=Med',
        desc: item?.description || item?.desc || '',
        stock: item?.stock ?? '--',
    };
};

const TechRecordResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const selectedMedicinesFromState = useMemo(
        () => (Array.isArray(location.state?.selectedMedicines)
            ? location.state.selectedMedicines.map(normalizeSelectedMedicine)
            : null),
        [location.state?.selectedMedicines]
    );
    const recordDraft = location.state?.recordDraft || null;
    const selectedImagesFromState = useMemo(
        () => toUploadDraftItems(location.state?.selectedImagesDraft),
        [location.state?.selectedImagesDraft]
    );

    const [taskDetail, setTaskDetail] = useState(null);
    const [summary, setSummary] = useState(recordDraft?.summary || '');
    const [selectedMedicines, setSelectedMedicines] = useState(selectedMedicinesFromState || []);
    const [selectedImages, setSelectedImages] = useState(selectedImagesFromState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (typeof recordDraft?.summary === 'string') {
            setSummary(recordDraft.summary);
        }
        if (selectedMedicinesFromState) {
            setSelectedMedicines(selectedMedicinesFromState);
        }
    }, [recordDraft?.summary, selectedMedicinesFromState]);

    useEffect(() => {
        let isMounted = true;

        const fetchTaskDetail = async () => {
            setIsLoading(true);
            setErrorMessage('');
            try {
                const detailRes = await techService.getMyAssignedServiceDetail(id);

                if (!isMounted) return;

                const detail = detailRes?.data || null;
                setTaskDetail(detail);

                if (recordDraft?.summary == null) {
                    setSummary(detail?.result || '');
                }

                if (!selectedMedicinesFromState) {
                    if (Array.isArray(detail?.medicines) && detail.medicines.length > 0) {
                        setSelectedMedicines(detail.medicines.map((medicine) => normalizeSelectedMedicine({
                            medicineId: Number(medicine.medicineId || 0),
                            medicineName: medicine.medicineName || 'Thuốc/Vật tư',
                            description: medicine.description || '',
                            quantity: Number(medicine.quantity || 1),
                            instruction: medicine.instruction || '',
                            dosageUnit: medicine.dosageUnit || '',
                        })));
                    } else {
                        setSelectedMedicines([]);
                    }
                }
            } catch {
                if (!isMounted) return;
                setTaskDetail(null);
                setErrorMessage('Không thể tải dữ liệu công việc.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchTaskDetail();

        return () => {
            isMounted = false;
        };
    }, [id, recordDraft?.summary, selectedMedicinesFromState]);

    useEffect(() => () => {
        selectedImages.forEach((image) => {
            if (image?.previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(image.previewUrl);
            }
        });
    }, [selectedImages]);

    const existingEvidence = useMemo(
        () => (taskDetail?.evidencePaths || []).map((path, index) => ({
            id: `existing-${index}`,
            url: techService.buildStorageUrl(path),
            name: String(path || '').split('/').pop() || `evidence-${index + 1}`,
        })),
        [taskDetail]
    );

    const existingImageEvidence = useMemo(
        () => existingEvidence.filter((item) => isImageFilePath(item?.url)),
        [existingEvidence]
    );

    const existingDocumentEvidence = useMemo(
        () => existingEvidence.filter((item) => !isImageFilePath(item?.url)),
        [existingEvidence]
    );

    const selectedImageFiles = useMemo(
        () => selectedImages.filter((item) => item?.file?.type?.startsWith('image/')),
        [selectedImages]
    );

    const selectedDocumentFiles = useMemo(
        () => selectedImages.filter((item) => !item?.file?.type?.startsWith('image/')),
        [selectedImages]
    );

    const statusLabel = STATUS_LABEL[taskDetail?.status] || '--';

    const handleAddImages = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const nextItems = files.map((file) => ({
            key: `${Date.now()}-${file.name}-${Math.random()}`,
            file,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            fileName: file.name,
        }));

        setSelectedImages((prev) => [...prev, ...nextItems]);
        event.target.value = '';
    };

    const handleRemoveSelectedImage = (targetKey) => {
        setSelectedImages((prev) => {
            const target = prev.find((item) => item.key === targetKey);
            if (target?.previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((item) => item.key !== targetKey);
        });
    };

    const handleOpenMedicineSelector = () => {
        navigate(TECH_PATHS.MEDICINE_SELECTOR, {
            state: {
                selectedMedicines,
                selectedImagesDraft: serializeUploadDraftItems(selectedImages),
                returnPath: buildTechRecordResultPath(id),
                recordDraft: {
                    summary,
                },
            },
        });
    };

    const handleMedicineQuantityChange = (medicineId, delta) => {
        setSelectedMedicines((prev) => prev.map((medicine) => {
            if (medicine.medicineId !== medicineId) return medicine;
            const nextQty = Math.max(1, Number(medicine.quantity || 1) + delta);
            return { ...medicine, quantity: nextQty };
        }));
    };

    const handleMedicineUnitChange = (medicineId, unit) => {
        const normalizedUnit = normalizeUnit(unit);
        setSelectedMedicines((prev) => prev.map((medicine) => (
            medicine.medicineId === medicineId
                ? { ...medicine, selectedUnit: normalizedUnit, dosageUnit: normalizedUnit }
                : medicine
        )));
    };

    const handleSubmit = async () => {
        if (!taskDetail?.serviceOrderId || isSubmitting) {
            return;
        }

        const medicinesPayload = selectedMedicines
            .filter((medicine) => Number(medicine?.medicineId || 0) > 0 && Number(medicine?.quantity || 0) > 0)
            .map((medicine) => ({
                medicineId: Number(medicine.medicineId),
                quantity: Number(medicine.quantity),
                instruction: medicine.instruction?.trim() || undefined,
                dosageUnit: String(medicine.selectedUnit || medicine.dosageUnit || '').replace(/^\//, '').trim() || undefined,
            }));

        const payload = {
            result: summary?.trim() || '',
            medicines: medicinesPayload,
        };

        try {
            setIsSubmitting(true);
            setErrorMessage('');
            await techService.recordMyAssignedServiceResult(taskDetail.serviceOrderId, payload, selectedImages.map((item) => item.file));
            navigate(TECH_PATHS.HOME);
        } catch {
            setErrorMessage('Không thể ghi nhận kết quả. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="trs-page">
            <header className="trs-header">
                <button className="trs-icon-btn" type="button" onClick={() => navigate(-1)} aria-label="Quay lại">
                    <ChevronLeft size={24} />
                </button>
                <h1>Ghi nhận kết quả</h1>
            </header>

            <main className="trs-content">
                {isLoading && <div className="trs-card trs-loading">Đang tải thông tin công việc...</div>}
                {!isLoading && errorMessage && <div className="trs-card trs-error">{errorMessage}</div>}

                {!isLoading && taskDetail && (
                    <article className="trs-card">
                        <div className="trs-card-title-row">
                            <div>
                                <h3>{taskDetail.title}</h3>
                                <p className="trs-subtitle">Phiếu kỹ thuật #{taskDetail.serviceOrderId}</p>
                            </div>
                            <span className={`trs-status trs-status-${taskDetail.status || 'queued'}`}>{statusLabel}</span>
                        </div>

                        <div className="trs-detail-grid">
                            <span>Người chỉ định</span>
                            <strong>{taskDetail.requester || '--'}</strong>
                            <span>Thú cưng</span>
                            <strong>{taskDetail.petName || '--'}</strong>
                        </div>

                        <div className="trs-divider" />

                        <div className="trs-block">
                            <h4>Kết quả chung</h4>
                            <textarea
                                className="trs-textarea"
                                value={summary}
                                onChange={(event) => setSummary(event.target.value)}
                                placeholder="Nhập kết quả thực hiện..."
                                rows={4}
                            />
                        </div>

                        <div className="trs-block">
                            <div className="trs-upload-panel">
                                <div className="trs-upload-header">
                                    <h4>FILE VÀ ẢNH TẢI LÊN</h4>
                                    <ChevronUp size={16} color="#7f878d" />
                                </div>
                                
                                {(existingImageEvidence.length > 0 || selectedImageFiles.length > 0) && (
                                    <div className="trs-images-grid">
                                        {existingImageEvidence.map((image, index) => (
                                            <div className="trs-image-item" key={image.id}>
                                                <div className="trs-image-item-header">
                                                    <span>Ảnh kết quả {index + 1}</span>
                                                    <button
                                                        type="button"
                                                        className="trs-image-item-remove"
                                                        aria-label="Không thể xóa ảnh cũ"
                                                        disabled
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                                    </button>
                                                </div>
                                                <div className="trs-image-item-content">
                                                    <img src={image.url} alt="Ảnh báo cáo đã lưu" />
                                                </div>
                                            </div>
                                        ))}

                                        {selectedImageFiles.map((image, index) => (
                                            <div className="trs-image-item" key={image.key}>
                                                <div className="trs-image-item-header">
                                                    <span>Ảnh kết quả {existingImageEvidence.length + index + 1}</span>
                                                    <button
                                                        type="button"
                                                        className="trs-image-item-remove"
                                                        onClick={() => handleRemoveSelectedImage(image.key)}
                                                        aria-label="Xóa ảnh"
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                                    </button>
                                                </div>
                                                <div className="trs-image-item-content">
                                                    <img src={image.previewUrl} alt={image.fileName} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(existingDocumentEvidence.length > 0 || selectedDocumentFiles.length > 0) && (
                                    <div className="trs-upload-files-list">
                                        {existingDocumentEvidence.map((fileItem, index) => (
                                            <a
                                                key={fileItem.id}
                                                className="trs-upload-file-row"
                                                href={fileItem.url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <span>{fileItem.name || `Tệp đính kèm ${index + 1}`}</span>
                                            </a>
                                        ))}

                                        {selectedDocumentFiles.map((fileItem, index) => (
                                            <div className="trs-upload-file-row" key={fileItem.key || `${fileItem.fileName}-${index}`}>
                                                <span>{fileItem.fileName || `Tệp đính kèm mới ${index + 1}`}</span>
                                                <button
                                                    type="button"
                                                    className="trs-image-item-remove"
                                                    onClick={() => handleRemoveSelectedImage(fileItem.key)}
                                                    aria-label="Xóa tệp"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label className="trs-file-upload-btn">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><path d="M12 16v-8"></path><path d="M8 12l4-4 4 4"></path></svg>
                                    <span>Tải lên file kết quả khám bệnh</span>
                                    <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" multiple onChange={handleAddImages} hidden />
                                </label>
                            </div>
                        </div>

                        <div className="trs-block">
                            <div className="trs-meds-panel">
                                <div className="trs-meds-header">
                                    <h4>THUỐC & VẬT TƯ TIÊU HAO</h4>
                                    <ChevronUp size={16} color="#7f878d" />
                                </div>

                                {selectedMedicines.length > 0 ? (
                                    <div className="trs-meds-selected-wrap">
                                        {selectedMedicines.map((medicine, index) => (
                                            <div className="trs-meds-selected-item" key={`${medicine.medicineId || index}-${index}`}>
                                                <div className="trs-meds-item-top">
                                                    {/* <img src={medicine.image} alt={medicine.medicineName || 'medicine'} /> */}
                                                    <div className="trs-meds-item-main">
                                                        <strong>{medicine.medicineName || 'Thuốc/Vật tư'}</strong>
                                                        {medicine.desc ? <p>{medicine.desc}</p> : null}
                                                        <div className="trs-meds-item-meta">
                                                            <span>Dự kiến: <strong>{medicine.quantity} {medicine.selectedUnit || medicine.dosageUnit || ''}</strong></span>
                                                            <span>Tồn: <strong>{formatStock(medicine.stock)}</strong></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="trs-meds-item-controls">
                                                    <div className="trs-meds-stepper">
                                                        <button type="button" onClick={() => handleMedicineQuantityChange(medicine.medicineId, -1)}>
                                                            <Minus size={16} />
                                                        </button>
                                                        <span>{medicine.quantity}</span>
                                                        <button type="button" onClick={() => handleMedicineQuantityChange(medicine.medicineId, 1)}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>

                                                    <select
                                                        className="trs-meds-unit-select"
                                                        value={medicine.selectedUnit || medicine.dosageUnit || ''}
                                                        onChange={(event) => handleMedicineUnitChange(medicine.medicineId, event.target.value)}
                                                    >
                                                        {(medicine.unitOptions || [medicine.selectedUnit || medicine.dosageUnit || 'đơn vị']).map((unitOption) => (
                                                            <option key={`${medicine.medicineId}-${unitOption}`} value={unitOption}>
                                                                {unitOption}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                <div className={`trs-meds-add-wrap ${selectedMedicines.length === 0 ? 'is-empty' : ''}`}>
                                    <button type="button" className="trs-meds-empty-action" onClick={handleOpenMedicineSelector} aria-label="Thêm thuốc vật tư">
                                        <div className="trs-meds-empty-plus">
                                            <Plus size={38} strokeWidth={1.5} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                )}
            </main>

            <footer className="trs-footer">
                <button type="button" className="trs-btn-outline" onClick={() => navigate(-1)}>
                    Hủy bỏ
                </button>
                <button type="button" className="trs-btn-primary" onClick={handleSubmit} disabled={isSubmitting || isLoading || !taskDetail}>
                    {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
                </button>
            </footer>
        </div>
    );
};

export default TechRecordResult;
