import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useNotificationSSE } from '../../hooks/useNotificationSSE.jsx';
import { ChevronLeft, ChevronUp, ChevronDown, Plus, Minus, Camera, Bell, PencilLine } from 'lucide-react';
import { TECH_PATHS, buildTechRecordResultPath } from '../../routes/techPaths';
import techService from '../../api/techService';
import './RecordResult.css';

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

const isImageFilePath = (path) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(path || ''));

const toUploadDraftItems = (items) => (Array.isArray(items) ? items : [])
    .map((item, index) => {
        const file = item?.file || item;
        if (!file) return null;

        let previewUrl = item?.previewUrl;
        const isImage = file?.type?.startsWith('image/') || previewUrl;

        try {
            // Only recreate ObjectURL if we don't have a valid base64 previewUrl and it's a valid File/Blob
            if (file && (file instanceof File || file instanceof Blob) && isImage && (!previewUrl || !previewUrl.startsWith('data:'))) {
                previewUrl = URL.createObjectURL(file);
            }
        } catch {
            // Ignore preview generation issues
        }

        return {
            key: item?.key || `${Date.now()}-${index}-${file?.name || 'file'}-${Math.random()}`,
            file,
            previewUrl: previewUrl || null,
            fileName: item?.fileName || file?.name || 'Unknown file',
        };
    })
    .filter(Boolean);

const serializeUploadDraftItems = (items) => (Array.isArray(items) ? items : [])
    .map((item) => {
        const file = item?.file || item;
        if (!file) return null;
        return {
            key: item?.key,
            file,
            fileName: item?.fileName || file.name,
            previewUrl: item?.previewUrl,
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
        type: item?.type || item?.productType,
        morning: toNumber(item?.morning, 0),
        noon: toNumber(item?.noon, 0),
        afternoon: toNumber(item?.afternoon, 0),
        evening: toNumber(item?.evening, 0),
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
    const [isMedsExpanded, setIsMedsExpanded] = useState(true);
    const { unreadCount, clearUnread } = useNotificationSSE();

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
                            type: medicine.type || medicine.productType,
                            morning: medicine.morning,
                            noon: medicine.noon,
                            afternoon: medicine.afternoon,
                            evening: medicine.evening,
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

    useEffect(() => {
        // Remove unmount revokeObjectURL to prevent breaking when navigating to MedicineSelector
    }, []);

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
        () => selectedImages.filter((item) => item?.file?.type?.startsWith('image/') || item?.previewUrl),
        [selectedImages]
    );

    const selectedDocumentFiles = useMemo(
        () => selectedImages.filter((item) => !(item?.file?.type?.startsWith('image/') || item?.previewUrl)),
        [selectedImages]
    );

    const statusLabel = STATUS_LABEL[taskDetail?.status] || '--';
    const hasRequiredImage = existingImageEvidence.length > 0 || selectedImageFiles.length > 0;
    const hasRequiredMedicine = selectedMedicines.some((medicine) => (
        Number(medicine?.medicineId || 0) > 0 && Number(medicine?.quantity || 0) > 0
    ));
    const isFormComplete = Boolean(
        taskDetail?.serviceOrderId
        && summary.trim()
        && hasRequiredImage
        && hasRequiredMedicine
    );

    const handleAddImages = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const nextItems = await Promise.all(files.map(async (file) => {
            let previewUrl = null;
            if (file.type.startsWith('image/')) {
                try {
                    previewUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = () => resolve(URL.createObjectURL(file));
                        reader.readAsDataURL(file);
                    });
                } catch {
                    previewUrl = URL.createObjectURL(file);
                }
            }
            return {
                key: `${Date.now()}-${file.name}-${Math.random()}`,
                file,
                previewUrl,
                fileName: file.name,
            };
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

    const handleSubmit = async () => {
        if (!taskDetail?.serviceOrderId || isSubmitting) {
            return;
        }

        if (!summary.trim()) {
            setErrorMessage('Vui lòng nhập kết quả chung.');
            return;
        }

        if (!hasRequiredImage) {
            setErrorMessage('Vui lòng tải lên ít nhất một ảnh kết quả.');
            return;
        }

        if (!hasRequiredMedicine) {
            setErrorMessage('Vui lòng chọn thuốc hoặc vật tư đi kèm.');
            return;
        }

        const medicinesPayload = selectedMedicines
            .filter((medicine) => Number(medicine?.medicineId || 0) > 0 && Number(medicine?.quantity || 0) > 0)
            .map((medicine) => ({
                medicineId: Number(medicine.medicineId),
                quantity: Number(medicine.quantity),
                instruction: medicine.instruction?.trim() || undefined,
                dosageUnit: String(medicine.selectedUnit || medicine.dosageUnit || '').replace(/^\//, '').trim() || undefined,
                morning: Math.max(0, Number(medicine.morning ?? 1)),
                noon: Math.max(0, Number(medicine.noon ?? 1)),
                afternoon: Math.max(0, Number(medicine.afternoon ?? 1)),
                evening: Math.max(0, Number(medicine.evening ?? 1)),
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
            <header className="tech-record-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', borderBottom: '1px solid #e0e7e4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="icon-btn-back" type="button" onClick={() => navigate(TECH_PATHS.HOME)} aria-label="Quay lại" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px', margin: '-4px' }}>
                        <ChevronLeft size={24} color="#1a1a1a" />
                    </button>
                    <h1 className="trs-title">Ghi nhận kết quả</h1>
                </div>
                <button type="button" className="tech-top-bell" onClick={() => { clearUnread(); navigate(TECH_PATHS.NOTIFICATIONS); }} aria-label="Thong bao" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}>
                    <Bell size={24} strokeWidth={2} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            backgroundColor: 'red',
                            color: 'white',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
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
                            <h4>Kết quả chung <span className="trs-required">*</span></h4>
                            <textarea
                                className="trs-textarea"
                                value={summary}
                                onChange={(event) => setSummary(event.target.value)}
                                placeholder="Nhập kết quả thực hiện..."
                                rows={4}
                                required
                                aria-required="true"
                            />
                        </div>

                        <div className="trs-block">
                            <div className="trs-upload-panel">
                                <div className="trs-upload-header">
                                    <h4>File và ảnh tải lên <span className="trs-required">*</span></h4>
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
                                    <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" multiple onChange={handleAddImages} required={!hasRequiredImage} aria-required="true" hidden />
                                </label>
                            </div>
                        </div>

                        <div className="rr-accordion">
                            <div className="rr-accordion-header" onClick={() => setIsMedsExpanded(!isMedsExpanded)}>
                                <h3>Thuốc & vật tư đi kèm <span className="trs-required">*</span></h3>
                                {isMedsExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                            </div>
                            {isMedsExpanded && (
                                <div className={`rr-accordion-content ${selectedMedicines.length === 0 ? 'rr-meds-empty' : 'rr-meds-list-container'}`}>
                                    {selectedMedicines.length > 0 ? (
                                        <div className="rr-meds-list-minimal">
                                            {selectedMedicines.map((med, index) => {
                                                const quantity = Number(med?.quantity ?? 1) || 1;
                                                const isThuoc = med?.type === 'THUOC' || med?.type === 'MEDICINE';
                                                const originalUnit = med?.selectedUnit || med?.dosageUnit || 'Đơn vị';
                                                const quantityUnit = originalUnit;
                                                return (
                                                    <div key={`${med?.medicineId || 'medicine'}-${index}`} className="rr-med-item-minimal">
                                                        <div className="rr-med-row-header">
                                                            <h4 className="rr-med-name-min">{med.medicineName || 'Thuốc/Vật tư'}</h4>
                                                            <button
                                                                type="button"
                                                                className="rr-med-edit-btn"
                                                                onClick={handleOpenMedicineSelector}
                                                                aria-label={`Chỉnh sửa cho ${med.medicineName}`}
                                                            >
                                                                <PencilLine size={16} color="#209D80" className="rr-med-edit-icon" />
                                                            </button>
                                                        </div>
                                                        {/* {med.desc && (
                                                            <div className="rr-med-row-price">
                                                                <div>
                                                                    <span className="rr-med-price-min">{med.desc}</span>
                                                                </div>
                                                            </div>
                                                        )} */}

                                                        <div className="rr-med-row-note">
                                                            <span className="rr-note-lbl">Số lượng</span>
                                                            <span className="rr-note-val">{quantity} {quantityUnit}</span>
                                                        </div>

                                                        {/* {[
                                                            { label: 'Sáng', value: med?.morning || 0 },
                                                            { label: 'Trưa', value: med?.noon || 0 },
                                                            { label: 'Chiều', value: med?.afternoon || 0 },
                                                            { label: 'Tối', value: med?.evening || 0 },
                                                        ].filter((dosage) => dosage.value > 0).map((dosage) => (
                                                            <div key={`${med.medicineId}-${dosage.label}`} className="rr-med-row-dosage">
                                                                <span className="rr-dosage-lbl">{dosage.label}</span>
                                                                <span className="rr-dosage-val">{dosage.value} {originalUnit}</span>
                                                            </div>
                                                        ))}

                                                        <div className="rr-med-row-note">
                                                            <span className="rr-note-lbl">Chỉ định khác</span>
                                                            <span className="rr-note-val">{med?.instruction || '---'}</span>
                                                        </div> */}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : null}

                                    <div className={`rr-add-btn-wrapper ${selectedMedicines.length > 0 ? 'rr-add-btn-wrapper-has-list' : 'rr-add-btn-wrapper-empty'}`}>
                                        <button
                                            className="rr-add-btn"
                                            type="button"
                                            aria-label="Thêm thuốc và vật tư"
                                            onClick={handleOpenMedicineSelector}
                                        >
                                            <Plus size={34} strokeWidth={1.6} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                )}
            </main>

            <footer className="trs-footer">
                <button type="button" className="trs-btn-outline" onClick={() => navigate(TECH_PATHS.HOME)}>
                    Hủy bỏ
                </button>
                <button type="button" className="trs-btn-primary" onClick={handleSubmit} disabled={isSubmitting || isLoading || !taskDetail || !isFormComplete}>
                    {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
                </button>
            </footer>
        </div>
    );
};

export default TechRecordResult;
