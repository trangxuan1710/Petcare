import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Phone, Mars, Weight, ChevronUp, ChevronDown, Plus, Upload, Minus, PencilLine, Venus, Box } from 'lucide-react';
import receptionService from '../../api/receptionService';
import treatmentService from '../../api/treatmentService';
import './RecordResult.css';

const RADIO_OPTIONS = [
    { id: 1, label: 'Cận lâm sàng' },
    { id: 2, label: 'Điều trị nội trú' },
    { id: 3, label: 'Điều trị ngoại trú' },
    { id: 4, label: 'Kết thúc cho về' },
];

const TREATMENT_DECISION_MAP = {
    'Cận lâm sàng': 'PARACLINICAL_EXAM',
    'Điều trị nội trú': 'INPATIENT_TREATMENT',
    'Điều trị ngoại trú': 'OUTPATIENT_TREATMENT',
    'Kết thúc cho về': 'DISCHARGE',
};

const isDevelopingTreatmentOption = (label) => (
    label === 'Điều trị nội trú'
    || label === 'Điều trị ngoại trú'
);

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

    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(digitsAndSeparators)) {
        const normalizedVn = digitsAndSeparators.replace(/\./g, '').replace(',', '.');
        const parsedVn = Number(normalizedVn);
        return Number.isFinite(parsedVn) ? parsedVn : 0;
    }

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

const normalizeDoseValue = (rawValue) => {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
};

const normalizeServiceStatus = (rawStatus) => {
    const status = String(rawStatus || '').trim().toLowerCase();
    if (status === 'completed' || status === 'paid' || status === 'đã thanh toán') {
        return { label: 'Hoàn thành', className: 'rr-status-completed' };
    }
    if (
        status === 'in_progress'
        || status === 'đang thực hiện'
        || status === 'waiting_payment'
        || status === 'chờ thanh toán'
    ) {
        return { label: 'Đang thực hiện', className: 'rr-status-in-progress' };
    }
    return { label: 'Chưa bắt đầu', className: 'rr-status-pending' };
};

const toSentenceCaseStatus = (rawStatus, fallback = 'Đang thực hiện') => {
    const value = String(rawStatus || '').trim();
    if (!value) return fallback;

    const normalized = value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase('vi-VN');

    return normalized
        ? `${normalized.charAt(0).toLocaleUpperCase('vi-VN')}${normalized.slice(1)}`
        : fallback;
};

const isCompletedReceptionStatus = (rawStatus) => {
    const status = String(rawStatus || '').trim().toLowerCase();
    return (
        status === 'paid'
        || status === 'completed'
        || status === 'đã thanh toán'
        || status === 'đã hoàn thành'
    );
};

const mapParaclinicalService = (item) => ({
    id: item?.id || item?.serviceId || item?.service?.id,
    serviceId: item?.serviceId || item?.service?.id,
    technicianId: item?.technicianId || item?.technician?.id,
    name: item?.serviceName || item?.service?.name || 'Dịch vụ cận lâm sàng',
    executor: item?.technicianName || item?.technician?.fullName || item?.technician?.name || 'Chưa gán',
    quantity: Number(item?.quantity || 1),
    price: getPriceNumber(item?.service || item),
    rawStatus: item?.status,
});

const mapMedicineToUi = (item) => ({
    id: item?.id || item?.medicineId,
    serviceId: item?.serviceId || item?.receptionServiceId || 1,
    name: item?.name || item?.medicineName || 'Thuốc/Vật tư',
    desc: item?.description || '',
    price: formatVnd(getPriceNumber(item)),
    unit: item?.unit ? (String(item.unit).startsWith('/') ? item.unit : `/${item.unit}`) : '/đơn vị',
    stock: item?.stock ?? item?.stockQuantity ?? '--',
    image: item?.imageUrl || 'https://placehold.co/80x80/f4f4f5/a1a1aa?text=Med',
    selected: true,
    qty: item?.qty || item?.quantity || 1,
    selectedUnit: item?.dosageUnit || item?.selectedUnit || item?.unit || 'Đơn vị',
    type: item?.type || item?.productType,
    expanded: false,
    dosage: {
        morning: normalizeDoseValue(item?.dosage?.morning ?? item?.morning),
        noon: normalizeDoseValue(item?.dosage?.noon ?? item?.noon),
        afternoon: normalizeDoseValue(item?.dosage?.afternoon ?? item?.afternoon),
        evening: normalizeDoseValue(item?.dosage?.evening ?? item?.evening),
        note: item?.dosage?.note || item?.note || '',
    },
});

const hydrateUploadedFilesFromDraft = (items) => (Array.isArray(items) ? items : [])
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

const serializeUploadedFilesForDraft = (items) => (Array.isArray(items) ? items : [])
    .map((item) => {
        const file = item?.file || item;
        if (!(file instanceof File)) return null;
        return {
            file,
            fileName: item?.fileName || file.name,
        };
    })
    .filter(Boolean);

export const RecordResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const treatmentSlipId = location.state?.treatmentSlipId;
    const recordResultDraft = location.state?.recordResultDraft;
    const fileInputRef = useRef(null);
    const [isMedsExpanded, setIsMedsExpanded] = useState(true);
    const [conclusionText, setConclusionText] = useState('');
    const [selectedConclusion, setSelectedConclusion] = useState(null);
    const [medsList, setMedsList] = useState([]);
    const [showDosageModal, setShowDosageModal] = useState(false);
    const [activeDosageMedId, setActiveDosageMedId] = useState(null);
    const [dosageDraft, setDosageDraft] = useState({
        morning: 1,
        noon: 1,
        afternoon: 1,
        evening: 1,
        note: '',
    });
    const [receptionDetail, setReceptionDetail] = useState(null);
    const [treatmentDetail, setTreatmentDetail] = useState(null);
    const [selectedParaclinical, setSelectedParaclinical] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [isClinicalCompleted, setIsClinicalCompleted] = useState(false);
    const [clinicalStartedAt, setClinicalStartedAt] = useState(null);
    const [clinicalServiceName, setClinicalServiceName] = useState('Khám lâm sàng');

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2600);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [receptionResponse, treatmentResponse, paraclinicalResponse, assignedServicesResponse] = await Promise.allSettled([
                    receptionService.getReceptionById(id),
                    treatmentSlipId ? treatmentService.getTreatmentSlipById(treatmentSlipId) : Promise.resolve(null),
                    id ? receptionService.getSelectedParaclinicalServices(id) : Promise.resolve(null),
                    id ? receptionService.getAssignedServices(id) : Promise.resolve(null),
                ]);

                if (!isMounted) return;

                const receptionData = receptionResponse.status === 'fulfilled' ? receptionResponse.value?.normalizedData : null;
                const treatmentData = treatmentResponse.status === 'fulfilled' ? treatmentResponse.value?.data?.data : null;
                const paraclinicalData = paraclinicalResponse.status === 'fulfilled'
                    ? (paraclinicalResponse.value?.normalizedData || [])
                    : [];
                const assignedServices = assignedServicesResponse.status === 'fulfilled'
                    ? toArray(assignedServicesResponse.value?.normalizedData)
                    : [];
                const defaultClinicalService = assignedServices.find((service) => Number(service?.serviceId || service?.id) === 1) || null;
                const defaultClinicalServiceName = defaultClinicalService?.serviceName
                    || defaultClinicalService?.name
                    || defaultClinicalService?.service?.name
                    || 'Khám lâm sàng';
                const medicinesFromApi = toArray(
                    treatmentData?.medicines
                    || treatmentData?.medicineItems
                    || treatmentData?.prescriptions
                ).map(mapMedicineToUi);
                const medicinesFromState = toArray(location.state?.selectedMedicines).map(mapMedicineToUi);
                const medicinesFromDraft = toArray(recordResultDraft?.medsList).map(mapMedicineToUi);
                const defaultClinicalServiceId = Number(defaultClinicalService?.serviceId || defaultClinicalService?.id || 1);
                const hasDraftConclusion = Boolean(
                    recordResultDraft
                    && Object.prototype.hasOwnProperty.call(recordResultDraft, 'conclusionText')
                );
                const hasDraftSelectedConclusion = Boolean(
                    recordResultDraft
                    && Object.prototype.hasOwnProperty.call(recordResultDraft, 'selectedConclusion')
                );
                const hasDraftMedsExpanded = Boolean(
                    recordResultDraft
                    && Object.prototype.hasOwnProperty.call(recordResultDraft, 'isMedsExpanded')
                );

                const ensureMedicineService = (items) =>
                    items.map((medicine) => ({
                        ...medicine,
                        serviceId: Number(medicine?.serviceId || defaultClinicalServiceId || 1),
                    }));

                setReceptionDetail(receptionData || null);
                setTreatmentDetail(treatmentData || null);
                setSelectedParaclinical(paraclinicalData.map(mapParaclinicalService));
                setMedsList(
                    medicinesFromState.length > 0
                        ? ensureMedicineService(medicinesFromState)
                        : medicinesFromDraft.length > 0
                            ? ensureMedicineService(medicinesFromDraft)
                            : ensureMedicineService(medicinesFromApi)
                );
                setClinicalStartedAt(defaultClinicalService?.startedAt || null);
                setClinicalServiceName(defaultClinicalServiceName);

                if (hasDraftConclusion) {
                    setConclusionText(String(recordResultDraft?.conclusionText || ''));
                } else if (typeof treatmentData?.plan === 'string' && treatmentData.plan.trim()) {
                    setConclusionText(treatmentData.plan);
                }

                if (hasDraftSelectedConclusion) {
                    setSelectedConclusion(recordResultDraft?.selectedConclusion ?? null);
                } else if (typeof treatmentData?.type === 'string' && treatmentData.type.trim()) {
                    const found = RADIO_OPTIONS.find((option) => option.label === treatmentData.type);
                    if (found) {
                        setSelectedConclusion(found.id);
                    }
                }

                if (Array.isArray(recordResultDraft?.uploadedFiles)) {
                    setUploadedFiles(hydrateUploadedFilesFromDraft(recordResultDraft.uploadedFiles));
                }

                if (hasDraftMedsExpanded) {
                    setIsMedsExpanded(Boolean(recordResultDraft?.isMedsExpanded));
                }
            } catch {
                if (!isMounted) return;
                setReceptionDetail(null);
                setTreatmentDetail(null);
                setClinicalStartedAt(null);
                setClinicalServiceName('Khám lâm sàng');
            }
        };

        if (id) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [id, treatmentSlipId, location.state?.selectedMedicines, recordResultDraft]);

    const petInfo = useMemo(() => {
        const pet = receptionDetail?.pet;
        return {
            name: pet?.name || '---',
            breed: pet?.breed || pet?.species || '---',
            gender: String(pet?.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
            weight: receptionDetail?.weight ? `${receptionDetail.weight}kg` : (pet?.weight ? `${pet.weight}kg` : '--kg'),
        };
    }, [receptionDetail]);

    const examExecutor = useMemo(
        () => receptionDetail?.doctor?.fullName || treatmentDetail?.createdBy?.fullName || '---',
        [receptionDetail, treatmentDetail]
    );

    const clinicalStatusMeta = useMemo(() => {
        if (isClinicalCompleted) {
            return { label: 'Hoàn thành', className: 'rr-status-completed' };
        }
        return normalizeServiceStatus(receptionDetail?.status);
    }, [isClinicalCompleted, receptionDetail]);

    const isReadonlyMode = useMemo(
        () => isCompletedReceptionStatus(receptionDetail?.status),
        [receptionDetail]
    );

    useEffect(() => {
        if (isReadonlyMode) {
            setShowDosageModal(false);
        }
    }, [isReadonlyMode]);

    const uploadedImageFiles = useMemo(
        () => uploadedFiles.filter((item) => item?.file?.type?.startsWith('image/')),
        [uploadedFiles]
    );

    const uploadedDocumentFiles = useMemo(
        () => uploadedFiles.filter((item) => !item?.file?.type?.startsWith('image/')),
        [uploadedFiles]
    );

    const handleConfirm = async () => {
        if (isSaving || isReadonlyMode) return;
        setIsSaving(true);
        try {
            const selectedConclusionLabel = RADIO_OPTIONS.find((option) => option.id === selectedConclusion)?.label || 'Điều trị ngoại trú';
            const isDischargeConclusion = selectedConclusionLabel === 'Kết thúc cho về';
            if (isDevelopingTreatmentOption(selectedConclusionLabel)) {
                showToast('success', 'Tính năng đang phát triển.');
                return;
            }

            const payload = {
                conclusionType: selectedConclusionLabel,
                summary: conclusionText,
                treatmentDecision: TREATMENT_DECISION_MAP[selectedConclusionLabel] || 'OUTPATIENT_TREATMENT',
                confirmDischarge: isDischargeConclusion,
                conclusion: conclusionText,
                serviceIds: selectedParaclinical.map((item) => item?.serviceId || item?.id).filter(Boolean),
                medicines: medsList
                    .filter((item) => item?.selected)
                    .map((item) => ({
                        serviceId: Number(item?.serviceId || 1),
                        medicineId: item?.id,
                        quantity: item?.qty || 1,
                        soldQuantity: item?.qty || 1,
                        morning: Math.max(0, Number(item?.dosage?.morning ?? 1)),
                        noon: Math.max(0, Number(item?.dosage?.noon ?? 1)),
                        afternoon: Math.max(0, Number(item?.dosage?.afternoon ?? 1)),
                        evening: Math.max(0, Number(item?.dosage?.evening ?? 1)),
                        instruction: item?.dosage?.note || '',
                        dosageUnit: String(item?.selectedUnit || item?.unit || 'đơn vị').replace(/^\//, ''),
                    })),
                paraclinicalServices: selectedParaclinical.map((item) => ({
                    serviceId: item?.serviceId || item?.service?.id,
                    technicianId: item?.technicianId || item?.technician?.id,
                    quantity: item?.quantity || 1,
                })),
            };

            if (id) {
                await treatmentService.recordExamResult(id, payload, uploadedFiles.map(item => item.file || item));
                const conclusionLabel = payload.conclusionType;
                if (conclusionLabel === 'Kết thúc cho về') {
                    showToast('success', 'Đã chuyển phiếu sang chờ thanh toán.');
                    setTimeout(() => {
                        navigate('/doctors/tickets');
                    }, 900);
                    return;
                }
                if (conclusionLabel === 'Cận lâm sàng') {
                    setIsClinicalCompleted(true);
                    showToast('success', 'Đã ghi nhận kết quả. Dịch vụ khám mặc định đã hoàn thành.');
                    setTimeout(() => {
                        navigate(`/doctors/service-order/${id}`, { state: { refreshParaclinical: true } });
                    }, 900);
                    return;
                }
                showToast('success', 'Đã ghi nhận kết quả khám thành công.');
                setTimeout(() => {
                    navigate(`/doctors/service-order/${id}`, { state: { refreshParaclinical: true } });
                }, 900);
            } else {
                await treatmentService.createTreatmentSlip({
                    type: payload.conclusionType,
                    plan: payload.summary,
                    medicalRecord: { id: Number(id) || undefined },
                });
                showToast('success', 'Đã ghi nhận kết quả khám thành công.');
            }
        } catch {
            showToast('error', 'Ghi nhận kết quả thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenUpload = () => {
        if (isReadonlyMode) return;
        fileInputRef.current?.click();
    };

    const handleSelectFiles = (event) => {
        if (isReadonlyMode) return;
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const nextItems = files.map((file) => ({
            key: `${Date.now()}-${file.name}-${Math.random()}`,
            file,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            fileName: file.name,
        }));

        setUploadedFiles((prev) => [...prev, ...nextItems]);
        event.target.value = '';
    };

    const handleRemoveSelectedImage = (targetKey) => {
        if (isReadonlyMode) return;
        setUploadedFiles((prev) => {
            const target = prev.find((item) => item.key === targetKey);
            if (target?.previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((item) => item.key !== targetKey);
        });
    };

    useEffect(() => {
        return () => {
            uploadedFiles.forEach((image) => {
                if (image?.previewUrl?.startsWith('blob:')) {
                    URL.revokeObjectURL(image.previewUrl);
                }
            });
        };
    }, [uploadedFiles]);

    const openDosageModal = (medicine) => {
        if (!medicine?.id || isReadonlyMode) return;
        setActiveDosageMedId(medicine.id);
        setDosageDraft({
            morning: normalizeDoseValue(medicine?.dosage?.morning),
            noon: normalizeDoseValue(medicine?.dosage?.noon),
            afternoon: normalizeDoseValue(medicine?.dosage?.afternoon),
            evening: normalizeDoseValue(medicine?.dosage?.evening),
            note: medicine?.dosage?.note || medicine?.note || '',
            unit: medicine?.selectedUnit || medicine?.unit?.replace('/', '') || 'Đơn vị',
            isThuoc: medicine?.type === 'THUOC' || medicine?.type === 'MEDICINE',
        });
        setShowDosageModal(true);
    };

    const updateDosageValue = (field, delta) => {
        if (isReadonlyMode) return;
        setDosageDraft((prev) => ({
            ...prev,
            [field]: Math.max(0, Number(prev?.[field] ?? 1) + delta),
        }));
    };

    const saveDosage = () => {
        if (activeDosageMedId == null || isReadonlyMode) return;
        setMedsList((prev) =>
            prev.map((medicine) =>
                medicine.id === activeDosageMedId
                    ? {
                        ...medicine,
                        boxPrice: dosageDraft.boxPrice,
                        dosage: {
                            morning: dosageDraft.morning,
                            noon: dosageDraft.noon,
                            afternoon: dosageDraft.afternoon,
                            evening: dosageDraft.evening,
                            note: dosageDraft.note,
                        },
                    }
                    : medicine
            )
        );
        setShowDosageModal(false);
        setActiveDosageMedId(null);
    };

    return (
        <div className="record-result-page">
            <div className="rr-header">
                <button className="rr-btn-icon" onClick={() => navigate('/doctors/tickets')}><ChevronLeft size={24} color="#1a1a1a" /></button>
                <h1 className="rr-title">Ghi nhận kết quả</h1>
            </div>

            <div className="rr-content">
                <div className="rr-customer-card">
                    <div className="rr-customer-row">
                        <div>
                            <h2 className="rr-customer-name">{receptionDetail?.client?.fullName || '---'}</h2>
                            <div className="rr-customer-phone">
                                <Phone size={14} className="rr-icon-phone" />
                                <span>{receptionDetail?.client?.phoneNumber || '---'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rr-ticket-type-row">
                        <span className="rr-ticket-type">{receptionDetail?.examForm?.examType || 'Phiếu khám lâm sàng'}</span>
                    </div>

                    <div className="rr-pet-info-inline">
                        <span className="rr-pet-name">{petInfo.name}</span>
                        <span className="rr-pet-breed">{petInfo.breed} {petInfo.gender === 'female' ? <Venus size={12} color="#ec4899" /> : <Mars size={12} color="#3b82f6" />}</span>
                        <span className="rr-pet-stat"><Weight size={14} color="#888" /> {petInfo.weight}</span>
                    </div>
                </div>

                <div className="rr-exam-details-card">
                    <div className="rr-exam-row">
                        <div>
                            <span className="rr-exam-title">{clinicalServiceName}</span>
                            <span className="rr-exam-time">{receptionDetail?.receptionTime ? new Date(receptionDetail.receptionTime).toLocaleString('vi-VN') : '--:-- - --/--/----'}</span>

                        </div>
                        <div className="rr-exam-status-box">
                            <span className="rr-exam-status">{toSentenceCaseStatus(receptionDetail?.status, 'Đang thực hiện')}</span>
                        </div>
                    </div>

                    <div className="rr-exam-info-row">
                        <span className="rr-exam-label">Người thực hiện</span>
                        <span className="rr-exam-value">{examExecutor}</span>
                    </div>
                    <div className="rr-exam-info-row">
                        <span className="rr-exam-label">Thời gian bắt đầu</span>
                        <span className="rr-exam-value">{clinicalStartedAt ? new Date(clinicalStartedAt).toLocaleString('vi-VN') : '--:-- - --/--/----'}</span>
                    </div>

                    {receptionDetail?.examReason && (
                        <div className="rr-exam-reason-section">
                            <span className="rr-exam-label">Mô tả triệu chứng</span>
                            <div className="rr-exam-reason-box">
                                {receptionDetail.examReason}
                            </div>
                        </div>
                    )}
                </div>

                <div className="rr-section-block">
                    <h3 className="rr-section-title">Kết quả chung <span className="rr-required">*</span></h3>
                    <div className="rr-textarea-wrapper">
                        <textarea
                            className="rr-textarea"
                            value={conclusionText}
                            onChange={(event) => setConclusionText(event.target.value)}
                            rows={4}
                            readOnly={isReadonlyMode}
                            required
                            aria-required="true"
                        />
                        <span className="rr-char-count">2000</span>
                    </div>
                </div>

                <div className="rr-upload-panel">
                    <div className="rr-upload-header">
                        <h4>Tải lên hình ảnh thú trước và sau điều trị</h4>
                        <ChevronUp size={16} color="#7f878d" />
                    </div>

                    {uploadedImageFiles.length > 0 && (
                        <div className="rr-images-grid">
                            {uploadedImageFiles.map((image, index) => (
                                <div className="rr-image-item" key={image.key}>
                                    <div className="rr-image-item-header">
                                        <span>Ảnh kết quả {index + 1}</span>
                                        {!isReadonlyMode && (
                                            <button
                                                type="button"
                                                className="rr-image-item-remove"
                                                onClick={() => handleRemoveSelectedImage(image.key)}
                                                aria-label="Xóa ảnh"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="rr-image-item-content">
                                        <img src={image.previewUrl} alt={image.fileName} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {uploadedDocumentFiles.length > 0 && (
                        <div className="rr-upload-files-list">
                            {uploadedDocumentFiles.map((fileItem, index) => (
                                <div className="rr-upload-file-row" key={fileItem.key || `${fileItem.fileName}-${index}`}>
                                    <span>{fileItem.fileName || `Tệp đính kèm ${index + 1}`}</span>
                                    {!isReadonlyMode && (
                                        <button
                                            type="button"
                                            className="rr-image-item-remove"
                                            onClick={() => handleRemoveSelectedImage(fileItem.key)}
                                            aria-label="Xóa tệp"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <label className="rr-file-upload-btn" style={isReadonlyMode ? { opacity: 0.55, pointerEvents: 'none' } : {}}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><path d="M12 16v-8"></path><path d="M8 12l4-4 4 4"></path></svg>
                        <span style={{ fontSize: '13px' }}>Tải lên hình ảnh thú trước và sau điều trị</span>
                        <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" multiple onChange={handleSelectFiles} hidden disabled={isReadonlyMode} aria-required="true" />
                    </label>
                </div>

                <div className="rr-accordion">
                    <div className="rr-accordion-header" onClick={() => setIsMedsExpanded(!isMedsExpanded)}>
                        <h3>Thuốc & vật tư đi kèm</h3>
                        {isMedsExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                    </div>
                    {isMedsExpanded && (
                        <div className={`rr-accordion-content ${medsList.length === 0 ? 'rr-meds-empty' : 'rr-meds-list-container'}`}>
                            {medsList.length > 0 ? (
                                <div className="rr-meds-list-minimal">
                                    {medsList.map((med, index) => {
                                        const quantity = Number(med?.qty ?? med?.quantity ?? 1) || 1;
                                        const isThuoc = med?.type === 'THUOC' || med?.type === 'MEDICINE';
                                        const originalUnit = med?.selectedUnit || med?.unit?.replace('/', '') || 'Đơn vị';
                                        const quantityUnit = originalUnit;
                                        return (
                                            <div onClick={() => console.log(med)} key={`${med?.id || med?.medicineId || med?.name || 'medicine'}-${index}`} className="rr-med-item-minimal">
                                                <div className="rr-med-row-header">
                                                    <h4 className="rr-med-name-min">{med.name}</h4>
                                                    <button
                                                        type="button"
                                                        className="rr-med-edit-btn"
                                                        onClick={() => openDosageModal(med)}
                                                        aria-label={`Chỉnh liều dùng cho ${med.name}`}
                                                        disabled={isReadonlyMode}
                                                    >
                                                        <PencilLine size={16} color="#209D80" className="rr-med-edit-icon" />
                                                    </button>
                                                </div>
                                                <div className="rr-med-row-price">
                                                    <div onClick={() => console.log(med)}>
                                                        <span className="rr-med-price-min">{med.price}</span>
                                                        <span className="rr-med-unit-min">/Hộp</span>
                                                    </div>
                                                </div>

                                                <div className="rr-med-row-note">
                                                    <span className="rr-note-lbl">Số lượng</span>
                                                    <span className="rr-note-val">{quantity} Hộp</span>
                                                </div>

                                                {isThuoc && [
                                                    { label: 'Sáng', value: med?.dosage?.morning || 0 },
                                                    { label: 'Trưa', value: med?.dosage?.noon || 0 },
                                                    { label: 'Chiều', value: med?.dosage?.afternoon || 0 },
                                                    { label: 'Tối', value: med?.dosage?.evening || 0 },
                                                ].filter((dosage) => dosage.value > 0).map((dosage) => (
                                                    <div key={`${med.id}-${dosage.label}`} className="rr-med-row-dosage">
                                                        <span className="rr-dosage-lbl">{dosage.label}</span>
                                                        <span className="rr-dosage-val">{dosage.value} {originalUnit}</span>
                                                    </div>
                                                ))}
                                                {isThuoc && (
                                                    <div className="rr-med-row-note">
                                                        <span className="rr-note-lbl">Chỉ định khác</span>
                                                        <span className="rr-note-val">{med?.dosage?.note || med?.note || '---'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : null}

                            <div className={`rr-add-btn-wrapper ${medsList.length > 0 ? 'rr-add-btn-wrapper-has-list' : 'rr-add-btn-wrapper-empty'}`}>
                                <button
                                    className="rr-add-btn"
                                    type="button"
                                    aria-label="Thêm thuốc và vật tư"
                                    onClick={() => navigate('/doctors/medicine-selector', {
                                        state: {
                                            receptionId: id,
                                            petSpeciesId: receptionDetail?.pet?.speciesId ?? receptionDetail?.pet?.species?.id ?? null,
                                            petSpecies: receptionDetail?.pet?.species || receptionDetail?.pet?.speciesLabel || receptionDetail?.pet?.speciesCode,
                                            petWeight: receptionDetail?.weight ?? receptionDetail?.pet?.weight ?? null,
                                            treatmentSlipId,
                                            selectedMedicines: medsList,
                                            recordResultDraft: {
                                                conclusionText,
                                                selectedConclusion,
                                                uploadedFiles: serializeUploadedFilesForDraft(uploadedFiles),
                                                isMedsExpanded,
                                                medsList,
                                            },
                                            returnPath: `/doctors/record-result/${id ?? useParams().id}`,
                                        },
                                    })}
                                    disabled={isReadonlyMode}
                                >
                                    <Plus size={34} strokeWidth={1.6} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rr-section-block rr-mb-extra">
                    <h3 className="rr-section-title">Kết luận <span className="rr-required">*</span></h3>
                    <div className="rr-radio-grid">
                        {RADIO_OPTIONS.map((option) => (
                            <label key={option.id} className="rr-radio-label">
                                <input
                                    type="radio"
                                    name="conclusion"
                                    value={option.id}
                                    checked={selectedConclusion === option.id}
                                    onChange={() => {
                                        setSelectedConclusion(option.id);
                                    }}
                                    disabled={isReadonlyMode}
                                    required
                                    aria-required="true"
                                />
                                <span className="rr-radio-custom"></span>
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rr-bottom-actions">
                <button className="rr-btn-cancel" onClick={() => navigate('/doctors/tickets')} disabled={isReadonlyMode}>Hủy bỏ</button>
                <button className="rr-btn-confirm" onClick={handleConfirm} disabled={isReadonlyMode || isSaving || !conclusionText.trim() || !selectedConclusion}>
                    {isSaving ? 'Đang lưu...' : (selectedConclusion === 4 ? 'Kết thúc' : 'Xác nhận')}
                </button>
            </div>

            {showDosageModal && (
                <>
                    <div className="rr-dosage-modal-overlay" onClick={() => setShowDosageModal(false)}></div>
                    <div className="rr-dosage-modal-content">
                        <div className="rr-dosage-modal-handle"></div>
                        <h2 className="rr-dosage-modal-title">{dosageDraft.isThuoc ? 'Liều dùng' : 'Ghi chú vật tư'}</h2>

                        <div className="rr-dosage-main-area">
                            {dosageDraft.isThuoc && ['Sáng', 'Trưa', 'Chiều', 'Tối'].map((time, idx) => (
                                <div key={time} className="rr-dosage-row">
                                    <span className="rr-dosage-label">{time}</span>
                                    <div className="rr-dosage-controls">
                                        <div className="rr-dosage-stepper">
                                            <button
                                                className="rr-dosage-step-btn"
                                                type="button"
                                                onClick={() => updateDosageValue(
                                                    idx === 0 ? 'morning' : idx === 1 ? 'noon' : idx === 2 ? 'afternoon' : 'evening',
                                                    -1
                                                )}
                                                disabled={isReadonlyMode}
                                            >
                                                <Minus size={16} color="#666" />
                                            </button>
                                            <span className="rr-dosage-step-val">
                                                {idx === 0
                                                    ? dosageDraft.morning
                                                    : idx === 1
                                                        ? dosageDraft.noon
                                                        : idx === 2
                                                            ? dosageDraft.afternoon
                                                            : dosageDraft.evening}
                                            </span>
                                            <button
                                                className="rr-dosage-step-btn"
                                                type="button"
                                                onClick={() => updateDosageValue(
                                                    idx === 0 ? 'morning' : idx === 1 ? 'noon' : idx === 2 ? 'afternoon' : 'evening',
                                                    1
                                                )}
                                                disabled={isReadonlyMode}
                                            >
                                                <Plus size={16} color="#666" />
                                            </button>
                                        </div>
                                        <div className="rr-dosage-unit">
                                            <span>{dosageDraft.unit}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="rr-dosage-note-row">
                                <span className="rr-dosage-label">Chỉ định khác</span>
                                <div className="rr-dosage-textarea-box">
                                    <textarea
                                        className="rr-dosage-textarea"
                                        value={dosageDraft.note}
                                        onChange={(event) => setDosageDraft((prev) => ({ ...prev, note: event.target.value }))}
                                        readOnly={isReadonlyMode}
                                    ></textarea>
                                    <span className="rr-dosage-char-count">2000</span>
                                </div>
                            </div>
                        </div>

                        <div className="rr-dosage-bottom-action">
                            <button className="rr-dosage-btn-confirm-final" onClick={saveDosage} disabled={isReadonlyMode}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </>
            )}

            {toast && (
                <div className={`rr-toast rr-toast-${toast.type}`} role="status" aria-live="polite">
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default RecordResult;
