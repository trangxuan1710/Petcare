import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronUp, FileText } from 'lucide-react';
import './ResultSummary.css';
import { authApi } from '../../api/baseApi';
import petService from '../../api/petService';
import receptionService from '../../api/receptionService';
import treatmentService from '../../api/treatmentService';

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const firstNonEmptyString = (values = []) => values.find(isNonEmptyString)?.trim() || '';

const parseDelimitedPaths = (value) => {
    if (!isNonEmptyString(value)) return [];
    return value
        .split(/[\n;,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const getBackendBaseUrl = () => {
    try {
        const parsed = new URL(authApi?.defaults?.baseURL || window.location.origin);
        const basePath = parsed.pathname.replace(/\/+$/, '');
        return `${parsed.origin}${basePath}`;
    } catch {
        return window.location.origin;
    }
};

const buildAttachmentUrl = (rawPath) => {
    if (!isNonEmptyString(rawPath)) return '';
    const value = rawPath.trim();
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
        return value;
    }

    const normalizedSlashes = value.replace(/\\/g, '/');
    const normalized = normalizedSlashes.replace(/^\.\//, '/');

    if (normalized.startsWith('/storage/')) {
        return `${getBackendBaseUrl()}${normalized}`;
    }

    if (/^storage\//i.test(normalized)) {
        return `${getBackendBaseUrl()}/${normalized}`;
    }

    if (/^exam-result-.*\.(png|jpe?g|gif|webp|bmp|svg|pdf|docx?|xlsx?|txt)$/i.test(normalized)) {
        return `${getBackendBaseUrl()}/storage/exam-results/${normalized}`;
    }

    if (/^tech-result-.*\.(png|jpe?g|gif|webp|bmp|svg|pdf|docx?|xlsx?|txt)$/i.test(normalized)) {
        return `${getBackendBaseUrl()}/storage/tech-results/${normalized}`;
    }

    const normalizedWithLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return `${getBackendBaseUrl()}${normalizedWithLeadingSlash}`;
};

const getFileNameFromPath = (value) => {
    if (!isNonEmptyString(value)) return 'Tệp đính kèm';
    const normalized = value.split('?')[0];
    const segments = normalized.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'Tệp đính kèm';
};

const isImageAttachment = (path) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(path || '');

const extractAttachmentPaths = (item) => {
    if (!item || typeof item !== 'object') return [];

    const candidateFields = [
        item.evidencePath,
        item.evidencePaths,
        item.attachments,
        item.files,
        item.fileUrls,
        item.images,
        item.imageUrls,
    ];

    const paths = candidateFields.flatMap((field) => {
        if (isNonEmptyString(field)) {
            return parseDelimitedPaths(field);
        }
        if (Array.isArray(field)) {
            return field.flatMap((entry) => {
                if (isNonEmptyString(entry)) {
                    return parseDelimitedPaths(entry);
                }
                if (entry && typeof entry === 'object') {
                    return [
                        entry.url,
                        entry.path,
                        entry.filePath,
                        entry.fileUrl,
                        entry.imageUrl,
                    ].filter(isNonEmptyString);
                }
                return [];
            });
        }
        return [];
    });

    return [...new Set(paths.map((path) => path.trim()).filter(Boolean))];
};

const normalizeStatusLabel = (rawStatus) => {
    const status = String(rawStatus || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (status.includes('completed') || status.includes('paid') || status.includes('hoan thanh') || status.includes('da thanh toan') || status.includes('thanh toan') || status.includes('waiting_payment') || status.includes('cho thanh toan') || status.includes('done')) {
        return { label: 'Hoàn thành', className: 'rs-status-completed' };
    }
    if (status.includes('in_progress') || status.includes('dang thuc hien') || status.includes('waiting_conclusion') || status.includes('cho ket luan') || status.includes('ket luan')) {
        return { label: 'Đang thực hiện', className: 'rs-status-in-progress' };
    }
    if (status.includes('cho') || status.includes('pending') || status.includes('waiting') || status.includes('received') || status.includes('da tiep don')) {
        return { label: 'Chờ thực hiện', className: 'rs-status-pending' };
    }
    return { label: 'Chưa bắt đầu', className: 'rs-status-pending' };
};

const mapMedicineItem = (item) => {
    const quantity = item?.quantity || item?.qty || 0;
    const unitPrice = Number(item?.price ?? item?.unitPrice ?? item?.boxPrice ?? 0);
    const amount = item?.amount || (quantity * unitPrice);
    const unit = firstNonEmptyString([
        item?.dosageUnit,
        item?.unit,
        item?.selectedUnit,
        item?.medicineUnit,
        item?.medicine?.unit,
    ]) || 'đơn vị';

    const productType = item?.productType || item?.type || item?.medicine?.type || '';

    return {
        id: item?.medicineId || item?.id || item?.medicine?.id || `${item?.medicineName || item?.name || 'medicine'}-${quantity}`,
        serviceId: Number(item?.serviceId || item?.receptionServiceId || item?.service?.id || 0) || null,
        serviceName: item?.serviceName || item?.service?.name || '',
        name: item?.medicineName || item?.name || item?.medicine?.name || 'Thuốc/Vật tư',
        quantity,
        unit,
        unitPrice,
        productType,
        amount,
        dosage: item?.dosage || item?.instruction || item?.note || '',
    };
};

const mapAttachmentItem = (path, index) => ({
    id: `${path}-${index}`,
    url: buildAttachmentUrl(path),
    name: getFileNameFromPath(path),
    isImage: isImageAttachment(path),
});

const buildServiceCards = ({ assignedServices, selectedServices, treatmentDetail, receptionDetail, historyItem }) => {
    const selectedByServiceId = new Map(
        selectedServices
            .map((item) => [Number(item?.serviceId || item?.id), item])
            .filter(([serviceId]) => Number.isFinite(serviceId) && serviceId > 0)
    );

    const medicinesFromHistory = toArray(historyItem?.medicines).map(mapMedicineItem);
    const medicinesFromTreatment = toArray(
        treatmentDetail?.medicines || treatmentDetail?.medicineItems || treatmentDetail?.prescriptions
    ).map(mapMedicineItem);

    const clinicalMedicines = medicinesFromHistory.length > 0 ? medicinesFromHistory : medicinesFromTreatment;
    const resolveMedicinesByService = (serviceId, service, selectedService) => {
        const byAssignedService = toArray(service?.medicines).map(mapMedicineItem);
        const bySelectedService = toArray(selectedService?.medicines).map(mapMedicineItem);
        const direct = [...byAssignedService, ...bySelectedService];
        if (direct.length > 0) {
            const scopedDirect = direct.filter((medicine) => {
                if (medicine?.serviceId == null || medicine?.serviceId <= 0) {
                    return true;
                }
                return Number(medicine.serviceId) === Number(serviceId);
            });
            if (scopedDirect.length > 0) {
                return scopedDirect;
            }
        }

        return clinicalMedicines.filter((medicine) => {
            if (medicine?.serviceId == null || medicine?.serviceId <= 0) {
                return Number(serviceId) === 1;
            }
            return Number(medicine.serviceId) === Number(serviceId);
        });
    };
    const clinicalSummary = firstNonEmptyString([
        historyItem?.conclusion,
        treatmentDetail?.plan,
        receptionDetail?.examReason,
    ]) || 'Chưa có kết quả cho dịch vụ này.';

    const clinicalAttachments = [
        ...extractAttachmentPaths(historyItem),
        ...extractAttachmentPaths(treatmentDetail),
    ];

    const cards = toArray(assignedServices).map((service, index) => {
        const serviceId = Number(service?.serviceId || service?.id || 0);
        const selectedService = selectedByServiceId.get(serviceId);
        const summary = firstNonEmptyString([
            service?.summary,
            service?.result,
            service?.conclusion,
            selectedService?.summary,
            selectedService?.result,
            selectedService?.description,
            serviceId === 1 ? clinicalSummary : '',
        ]) || 'Chưa có kết quả cho dịch vụ này.';

        const attachmentPaths = serviceId === 1
            ? clinicalAttachments
            : [
                ...extractAttachmentPaths(service),
                ...extractAttachmentPaths(selectedService),
            ];

        const medicines = resolveMedicinesByService(serviceId, service, selectedService);

        return {
            id: `${serviceId || index}-${service?.serviceName || selectedService?.serviceName || 'service'}`,
            serviceId,
            serviceName: service?.serviceName || selectedService?.serviceName || 'Dịch vụ',
            status: normalizeStatusLabel(service?.status),
            summary,
            attachments: [...new Set(attachmentPaths)].map(mapAttachmentItem),
            medicines,
        };
    });

    if (cards.length > 0) {
        return cards;
    }

    const fallbackServices = toArray(selectedServices).map((item, index) => ({
        id: `${item?.serviceId || index}-${item?.serviceName || 'service'}`,
        serviceId: Number(item?.serviceId || item?.id || 0),
        serviceName: item?.serviceName || 'Dịch vụ cận lâm sàng',
        status: normalizeStatusLabel(item?.status),
        summary: firstNonEmptyString([item?.summary, item?.result, item?.description]) || 'Chưa có kết quả cho dịch vụ này.',
        attachments: extractAttachmentPaths(item).map(mapAttachmentItem),
        medicines: toArray(item?.medicines).map(mapMedicineItem),
    }));

    if (fallbackServices.length > 0) {
        return fallbackServices;
    }

    return [
        {
            id: 'clinical-default',
            serviceId: 1,
            serviceName: 'Khám lâm sàng',
            status: normalizeStatusLabel(receptionDetail?.status),
            summary: clinicalSummary,
            attachments: [...new Set(clinicalAttachments)].map(mapAttachmentItem),
            medicines: clinicalMedicines,
        },
    ];
};

const ResultSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const receptionId = location.state?.receptionId;
    const treatmentSlipId = location.state?.treatmentSlipId;
    const returnPath = location.state?.returnPath;
    const returnTab = location.state?.returnTab || 'Kết luận phiếu khám';
    const returnDraft = location.state?.returnDraft || {};

    const [receptionDetail, setReceptionDetail] = useState(null);
    const [treatmentDetail, setTreatmentDetail] = useState(null);
    const [assignedServices, setAssignedServices] = useState([]);
    const [selectedParaclinicalServices, setSelectedParaclinicalServices] = useState([]);
    const [historyItem, setHistoryItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [receptionResponse, treatmentResponse, selectedServicesResponse, assignedServicesResponse] = await Promise.allSettled([
                    receptionId ? receptionService.getReceptionById(receptionId) : Promise.resolve(null),
                    treatmentSlipId ? treatmentService.getTreatmentSlipById(treatmentSlipId) : Promise.resolve(null),
                    receptionId ? receptionService.getSelectedParaclinicalServices(receptionId) : Promise.resolve(null),
                    receptionId ? receptionService.getAssignedServices(receptionId) : Promise.resolve(null),
                ]);

                if (!isMounted) return;

                const receptionData = receptionResponse.status === 'fulfilled'
                    ? receptionResponse.value?.data?.data || null
                    : null;
                const treatmentData = treatmentResponse.status === 'fulfilled'
                    ? treatmentResponse.value?.data?.data || null
                    : null;
                const selectedServicesData = selectedServicesResponse.status === 'fulfilled'
                    ? toArray(selectedServicesResponse.value?.data?.data)
                    : [];
                const assignedServicesData = assignedServicesResponse.status === 'fulfilled'
                    ? toArray(assignedServicesResponse.value?.normalizedData)
                    : [];

                let currentHistoryItem = null;
                const petId = receptionData?.pet?.id;
                if (petId) {
                    try {
                        const petHistoryResponse = await petService.getExamHistory(petId);
                        const timeline = toArray(petHistoryResponse?.data?.data?.timeline);
                        currentHistoryItem = timeline.find(
                            (item) => Number(item?.receptionRecordId) === Number(receptionId)
                        ) || null;
                    } catch {
                        currentHistoryItem = null;
                    }
                }

                setReceptionDetail(receptionData);
                setTreatmentDetail(treatmentData);
                setAssignedServices(assignedServicesData);
                setSelectedParaclinicalServices(selectedServicesData);
                setHistoryItem(currentHistoryItem);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [receptionId, treatmentSlipId]);

    const serviceCards = useMemo(() => buildServiceCards({
        assignedServices,
        selectedServices: selectedParaclinicalServices,
        treatmentDetail,
        receptionDetail,
        historyItem,
    }), [assignedServices, selectedParaclinicalServices, treatmentDetail, receptionDetail, historyItem]);

    const navigateBackToServiceOrder = (isConfirmed) => {
        const nextDraft = {
            ...returnDraft,
            activeTab: returnTab,
            hasConfirmedResultSummary: Boolean(isConfirmed) || Boolean(returnDraft?.hasConfirmedResultSummary),
        };

        if (returnPath) {
            navigate(returnPath, {
                replace: true,
                state: {
                    recordResultDraft: nextDraft,
                },
            });
            return;
        }

        if (receptionId) {
            navigate(`/doctors/service-order/${receptionId}`, {
                replace: true,
                state: {
                    recordResultDraft: nextDraft,
                },
            });
            return;
        }

        navigate(-1);
    };

    const handleBackToConclusionTab = () => navigateBackToServiceOrder(false);
    const handleConfirmResultSummary = async () => {
        if (isConfirming) return;
        if (!receptionId) {
            navigateBackToServiceOrder(true);
            return;
        }

        setIsConfirming(true);
        try {
            await treatmentService.confirmResultSummary(receptionId);
            navigateBackToServiceOrder(true);
        } catch {
            window.alert('Xác nhận xem kết quả thất bại. Vui lòng thử lại.');
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="rs-page">
            <div className="rs-header">
                <button className="rs-icon-btn" type="button" onClick={handleBackToConclusionTab} aria-label="Quay lại">
                    <ChevronLeft size={24} />
                </button>
                <h1>Tổng hợp kết quả</h1>
            </div>

            <main className="rs-content">
                {isLoading && <article className="rs-card"><p>Đang tải dữ liệu tổng hợp...</p></article>}

                {!isLoading && serviceCards.map((card) => (
                    <article className="rs-card" key={card.id}>
                        <div className="rs-card-title-row">
                            <div>
                                <h3>{card.serviceName}</h3>
                            </div>
                            <div className="rs-card-meta">
                                <span className={`rs-status-pill ${card.status.className}`}>{card.status.label}</span>
                                <ChevronUp size={18} color="#606b67" />
                            </div>
                        </div>

                        <div className="rs-divider" />

                        <div className="rs-block">
                            <h4>Kết quả chung</h4>
                            <p>{card.summary}</p>
                        </div>

                        <div className="rs-block">
                            <h4 className="rs-block-files-title">Ảnh trước và sau khi khám`</h4>
                            {card.attachments.length > 0 ? (
                                <div className="rs-attachments-grid">
                                    {card.attachments.map((attachment) => (
                                        <a
                                            key={attachment.id}
                                            className="rs-attachment-card"
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {attachment.isImage ? (
                                                <img src={attachment.url} alt={attachment.name} loading="lazy" />
                                            ) : (
                                                <div className="rs-file-fallback">
                                                    <FileText size={22} />
                                                    <span>Tệp đính kèm</span>
                                                </div>
                                            )}
                                            <strong title={attachment.name}>{attachment.name}</strong>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="rs-files">
                                    <div>Chưa có file đính kèm.</div>
                                </div>
                            )}
                        </div>

                        <div className="rs-block">
                            <h4 className="rs-block-title">Danh sách thuốc và vật tư thực tế sử dụng</h4>
                            <div className="rs-med-list">
                                {card.medicines.length > 0 ? card.medicines.map((item) => (
                                    <div className="rs-med-item" key={`${card.id}-${item.id}`}>
                                        <div className="rs-med-info">
                                            <strong>{item.name}</strong>
                                            <div onClick={() => console.log(item)} className="rs-med-finance">
                                                <span>Đơn giá: {Number(item.unitPrice || 0).toLocaleString('vi-VN')}đ{item.unit ? `/${item.productType === 'THUOC' ? 'Hộp' : item.unit}` : ''}</span>
                                                <span>Số lượng: {item.quantity} {item.productType === 'THUOC' ? 'Hộp' : item.unit}</span>
                                            </div>
                                            {isNonEmptyString(item.dosage) && <p className="rs-med-dosage">Liều dùng / Chỉ định: {item.dosage}</p>}
                                        </div>
                                    </div>
                                )) : <p>Chưa có dữ liệu thuốc/vật tư sử dụng.</p>}
                            </div>
                        </div>
                    </article>
                ))}

                {!isLoading && serviceCards.length === 0 && (
                    <article className="rs-card"><p>Chưa có dữ liệu tổng hợp để hiển thị.</p></article>
                )}
            </main>

            <footer className="rs-footer">
                <button type="button" onClick={handleConfirmResultSummary} disabled={isConfirming}>
                    {isConfirming ? 'Đang xác nhận...' : 'Xác nhận'}
                </button>
            </footer>
        </div>
    );
};

export default ResultSummary;



