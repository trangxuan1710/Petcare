import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Phone, Eye, Mars, Weight, Plus, TriangleAlert, ChevronUp, ChevronDown, PencilLine } from 'lucide-react';
import ServiceAccordion from '../../components/doctor/ServiceAccordion';
import TreatmentHistoryTimeline from '../../components/doctor/TreatmentHistoryTimeline';
import FeatureDevelopingModal from '../../components/common/FeatureDevelopingModal';
import './ServiceOrder.css';
import '../../components/doctor/TicketCard.css';
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import { Divider } from "semantic-ui-react";
import receptionService from '../../api/receptionService';
import treatmentService from '../../api/treatmentService';
import { capitalizeFirstText, toTitleCase } from '../../utils/textFormat';

const AlertBadgeIcon = () => <TriangleAlert size={24} color="#ef4444" strokeWidth={2} />;

const normalizeReceptionStatus = (rawStatus) => {
    const status = String(rawStatus || '').trim().toLowerCase();
    if (
        status === 'completed'
        || status === 'paid'
        || status === 'đã hoàn thành'
        || status === 'đã thanh toán'
    ) {
        return { key: 'completed', label: 'hoàn thành' };
    }
    if (
        status === 'in_progress'
        || status === 'in progress'
        || status === 'waiting_conclusion'
        || status === 'waiting_payment'
        || status === 'đang thực hiện'
        || status === 'chờ kết luận'
        || status === 'chờ thanh toán'
    ) {
        return { key: 'in_progress', label: 'đang thực hiện' };
    }
    if (
        status === 'pending'
        || status === 'waiting_execution'
        || status === 'received'
        || status === 'đã tiếp đón'
        || status === 'chờ thực hiện'
        || status === 'chưa bắt đầu'
    ) {
        return { key: 'pending', label: 'chưa bắt đầu' };
    }
    return { key: 'pending', label: 'chưa bắt đầu' };
};

const isPendingServiceStatus = (rawStatus) => {
    const status = String(rawStatus || '').trim().toLowerCase();
    return (
        status === 'pending'
        || status === 'waiting_execution'
        || status === 'received'
        || status === 'đã tiếp đón'
        || status === 'chờ thực hiện'
        || status === 'chưa bắt đầu'
    );
};

const isEmergencyCase = (record) => Boolean(
    record?.isEmergency
    ?? record?.emergency
    ?? record?.examForm?.isEmergency
    ?? record?.examForm?.emergency
);

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const toNumber = (rawValue) => {
    if (rawValue == null || rawValue === '') return 0;
    if (typeof rawValue === 'number') return Number.isFinite(rawValue) ? rawValue : 0;
    const normalized = String(rawValue).replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getPriceNumber = (item) => Number(
    item?.sellingPrice
    ?? item?.unitPrice
    ?? item?.price
    ?? item?.boxPrice
    ?? item?.retailPrice
    ?? 0
) || 0;

const formatVnd = (value) => `${getPriceNumber({ price: value }).toLocaleString('vi-VN')}đ`;

const formatDisplayText = (value, fallback = '') => capitalizeFirstText(value || fallback);

const normalizeDoseValue = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const mapMedicineToUi = (item) => ({
    id: item?.id || item?.medicineId,
    serviceId: item?.serviceId || item?.receptionServiceId || 1,
    name: item?.name || item?.medicineName || 'Thuốc/Vật tư',
    desc: item?.description || item?.desc || '',
    price: item?.price && String(item.price).includes('đ') ? item.price : formatVnd(getPriceNumber(item)),
    unit: item?.unit ? (String(item.unit).startsWith('/') ? item.unit : `/${item.unit}`) : '/đơn vị',
    stock: item?.stock ?? item?.stockQuantity ?? '--',
    image: item?.imageUrl || item?.image || 'https://placehold.co/80x80/f4f4f5/a1a1aa?text=Med',
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
        note: item?.dosage?.note || item?.note || item?.instruction || '',
    },
});

const toServiceKey = (service) => {
    const raw = service?.serviceId ?? service?.id ?? service?.name;
    return String(raw ?? '').trim().toLowerCase();
};

const mergeUsedServices = (assignedServices = [], selectedServices = []) => {
    const serviceMap = new Map();

    selectedServices.forEach((service) => {
        const key = toServiceKey(service);
        if (!key) return;
        serviceMap.set(key, { ...service });
    });

    assignedServices.forEach((service) => {
        const key = toServiceKey(service);
        if (!key) return;

        const current = serviceMap.get(key);
        if (!current) {
            serviceMap.set(key, { ...service });
            return;
        }

        serviceMap.set(key, {
            ...current,
            ...service,
            name: service?.name || current?.name || 'Dịch vụ',
            status: service?.status || current?.status || 'pending',
            technicianName: service?.technicianName || current?.technicianName || 'Chưa gán',
            quantity: Number(service?.quantity ?? current?.quantity ?? 1) || 1,
            price: toNumber(service?.price ?? current?.price),
        });
    });

    return Array.from(serviceMap.values());
};

const isCompletedStatus = (rawStatus) => {
    const status = String(rawStatus || '').trim().toLowerCase();
    return status === 'completed' || status === 'hoàn thành' || status === 'paid' || status === 'đã thanh toán';
};

const isReadonlyReceptionStatus = (rawStatus) => {
    const status = String(rawStatus || '').trim().toLowerCase();
    return (
        status === 'waiting_payment'
        || status === 'chờ thanh toán'
        || status === 'paid'
        || status === 'đã thanh toán'
        || status === 'completed'
        || status === 'đã hoàn thành'
    );
};

const TREATMENT_DECISION_MAP = {
    'Kết thúc cho về': 'DISCHARGE',
    'Điều trị nội trú': 'INPATIENT_TREATMENT',
    'Điều trị ngoại trú': 'OUTPATIENT_TREATMENT',
    'Cận lâm sàng': 'PARACLINICAL_EXAM',
};

export default function ServiceOrder() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const serviceOrderDraft = location.state?.recordResultDraft || null;
    const selectedMedicinesFromState = useMemo(
        () => toArray(location.state?.selectedMedicines).map(mapMedicineToUi),
        [location.state?.selectedMedicines]
    );
    const [activeTab, setActiveTab] = useState(serviceOrderDraft?.activeTab || 'Dịch vụ');
    const [selectedConclusion, setSelectedConclusion] = useState(serviceOrderDraft?.selectedConclusion || '');
    const [showFinishModal, setShowFinishModal] = useState(false);
    const MAX_CONCLUSION_LENGTH = 2000;
    const [conclusionText, setConclusionText] = useState(serviceOrderDraft?.conclusionText || '');
    const [receptionDetail, setReceptionDetail] = useState(null);
    const [treatmentDetail, setTreatmentDetail] = useState(null);
    const [paraclinicalServices, setParaclinicalServices] = useState([]);
    const [medsList, setMedsList] = useState(
        selectedMedicinesFromState.length > 0
            ? selectedMedicinesFromState
            : toArray(serviceOrderDraft?.medsList).map(mapMedicineToUi)
    );
    const [isMedsExpanded, setIsMedsExpanded] = useState(serviceOrderDraft?.isMedsExpanded ?? true);
    const [isStartingService, setIsStartingService] = useState(false);

    const mapParaclinicalItem = (item) => ({
        id: item?.id || item?.serviceId || item?.service?.id || item?.paraclinicalServiceId,
        serviceId: item?.serviceId || item?.service?.id || item?.id,
        name: item?.serviceName || item?.service?.name || 'Dịch vụ cận lâm sàng',
        status: item?.status || 'pending',
        technicianName: item?.technicianName || item?.technician?.fullName || item?.technician?.name || 'Chưa gán',
        quantity: item?.quantity || 1,
        price: toNumber(item?.unitPrice ?? item?.service?.unitPrice ?? item?.price ?? item?.service?.price),
    });

    const mapAssignedServiceItem = (item) => ({
        id: item?.serviceId || item?.id,
        serviceId: item?.serviceId || item?.id,
        name: item?.serviceName || item?.name || 'Dịch vụ',
        status: item?.status || 'pending',
        startedAt: item?.startedAt || null,
        technicianName: item?.performerName || item?.technicianName || 'Chưa gán',
        quantity: item?.quantity || 1,
        price: toNumber(item?.unitPrice ?? item?.price),
    });

    useEffect(() => {
        if (serviceOrderDraft?.activeTab) {
            setActiveTab(serviceOrderDraft.activeTab);
        }
        if (Object.prototype.hasOwnProperty.call(serviceOrderDraft || {}, 'conclusionText')) {
            setConclusionText(String(serviceOrderDraft?.conclusionText || ''));
        }
        if (Object.prototype.hasOwnProperty.call(serviceOrderDraft || {}, 'selectedConclusion')) {
            setSelectedConclusion(serviceOrderDraft?.selectedConclusion || '');
        }
        if (Object.prototype.hasOwnProperty.call(serviceOrderDraft || {}, 'isMedsExpanded')) {
            setIsMedsExpanded(Boolean(serviceOrderDraft?.isMedsExpanded));
        }
        if (selectedMedicinesFromState.length > 0) {
            setMedsList(selectedMedicinesFromState);
            return;
        }
        if (Array.isArray(serviceOrderDraft?.medsList)) {
            setMedsList(serviceOrderDraft.medsList.map(mapMedicineToUi));
        }
    }, [serviceOrderDraft, selectedMedicinesFromState]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [receptionResponse, treatmentResponse, assignedServicesResponse] = await Promise.allSettled([
                    receptionService.getReceptionById(id),
                    treatmentService.getTreatmentSlipsByReceptionId(id),
                    receptionService.getAssignedServices(id),
                ]);
                const paraclinicalResponse = await receptionService.getSelectedParaclinicalServices(id).catch(() => null);

                if (!isMounted) return;

                const receptionData = receptionResponse.status === 'fulfilled' ? receptionResponse.value?.normalizedData : null;
                const treatmentItems = treatmentResponse.status === 'fulfilled'
                    ? toArray(treatmentResponse.value?.data?.data)
                    : [];
                const treatmentData = [...treatmentItems].sort((left, right) => {
                    const leftTime = new Date(left?.createdAt || 0).getTime();
                    const rightTime = new Date(right?.createdAt || 0).getTime();
                    if (leftTime !== rightTime) return rightTime - leftTime;
                    return Number(right?.id || 0) - Number(left?.id || 0);
                })[0] || null;
                const assignedServices = assignedServicesResponse.status === 'fulfilled'
                    ? toArray(assignedServicesResponse.value?.normalizedData).map(mapAssignedServiceItem)
                    : [];
                const selectedServices = toArray(paraclinicalResponse?.normalizedData).map(mapParaclinicalItem);

                const mergedServices = mergeUsedServices(assignedServices, selectedServices);

                setReceptionDetail(receptionData || null);
                setTreatmentDetail(treatmentData || null);
                setParaclinicalServices(mergedServices);

                const medicinesFromApi = toArray(
                    treatmentData?.medicines
                    || treatmentData?.medicineItems
                    || treatmentData?.prescriptions
                ).map(mapMedicineToUi);

                if (!Object.prototype.hasOwnProperty.call(serviceOrderDraft || {}, 'conclusionText') && typeof treatmentData?.plan === 'string' && treatmentData.plan.trim()) {
                    setConclusionText(treatmentData.plan);
                }
                if (!Object.prototype.hasOwnProperty.call(serviceOrderDraft || {}, 'selectedConclusion') && typeof treatmentData?.type === 'string' && treatmentData.type.trim()) {
                    setSelectedConclusion(treatmentData.type);
                }
                if (selectedMedicinesFromState.length === 0 && !Array.isArray(serviceOrderDraft?.medsList)) {
                    setMedsList(medicinesFromApi);
                }
            } catch {
                if (!isMounted) return;
                setReceptionDetail(null);
                setTreatmentDetail(null);
            }
        };

        if (id) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [id, location.state?.refreshParaclinical, selectedMedicinesFromState.length, serviceOrderDraft]);

    const petInfo = useMemo(() => {
        const pet = receptionDetail?.pet;
        return {
            name: pet?.name || '---',
            breed: pet?.breed || pet?.species || '---',
            gender: (pet?.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
            weight: receptionDetail?.weight ? `${receptionDetail.weight}kg` : (pet?.weight ? `${pet.weight}kg` : '--kg'),
            hasAlert: isEmergencyCase(receptionDetail)
        };
    }, [receptionDetail]);

    const defaultClinicalService = useMemo(
        () => paraclinicalServices.find((service) => Number(service?.serviceId || service?.id) === 1) || null,
        [paraclinicalServices]
    );

    const canAddServices = useMemo(() => {
        if (!defaultClinicalService) return false;
        return isCompletedStatus(defaultClinicalService.status);
    }, [defaultClinicalService]);

    const isDefaultServiceCompleted = useMemo(() => {
        if (!defaultClinicalService) return false;
        return isCompletedStatus(defaultClinicalService.status);
    }, [defaultClinicalService]);

    const isReadonlyMode = useMemo(() => {
        return isReadonlyReceptionStatus(receptionDetail?.status);
    }, [receptionDetail]);

    const shouldHideConclusionTab = useMemo(() => {
        if (!defaultClinicalService) return false;
        return !isCompletedStatus(defaultClinicalService.status);
    }, [defaultClinicalService]);

    const tabs = useMemo(() => {
        const nextTabs = ['Dịch vụ'];
        if (!shouldHideConclusionTab) {
            nextTabs.push('Kết luận phiếu khám');
        }
        nextTabs.push('Lịch sử điều trị');
        return nextTabs;
    }, [shouldHideConclusionTab]);

    useEffect(() => {
        if (shouldHideConclusionTab && activeTab === 'Kết luận phiếu khám') {
            setActiveTab('Dịch vụ');
        }
    }, [activeTab, shouldHideConclusionTab]);

    const handleExecute = async () => {
        if (isReadonlyMode || isDefaultServiceCompleted) {
            return;
        }

        if (!id || isStartingService) {
            navigate(`/doctors/record-result/${id ?? 1}`, {
                state: {
                    treatmentSlipId: treatmentDetail?.id || null,
                },
            });
            return;
        }

        const defaultService = paraclinicalServices.find((service) => Number(service?.serviceId || service?.id) === 1);
        const shouldStartService = !defaultService || isPendingServiceStatus(defaultService?.status);

        if (shouldStartService) {
            setIsStartingService(true);
            try {
                await receptionService.patchReceptionById(id, { status: 'IN_PROGRESS' });
            } catch {
                // Keep workflow smooth even if status update fails intermittently.
            } finally {
                setIsStartingService(false);
            }
        }

        navigate(`/doctors/record-result/${id ?? 1}`, {
            state: {
                treatmentSlipId: treatmentDetail?.id || null,
            },
        });
    };

    const openMedicineSelector = () => {
        if (isReadonlyMode) return;
        navigate('/doctors/medicine-selector', {
            state: {
                receptionId: id,
                treatmentSlipId: treatmentDetail?.id || null,
                selectedMedicines: medsList,
                recordResultDraft: {
                    activeTab: 'Kết luận phiếu khám',
                    conclusionText,
                    selectedConclusion,
                    isMedsExpanded,
                    medsList,
                },
                returnPath: `/doctors/service-order/${id ?? 1}`,
            },
        });
    };

    const saveTreatmentConclusion = async () => {
        const conclusionLabel = selectedConclusion || 'Điều trị ngoại trú';
        const payload = {
            conclusionType: conclusionLabel,
            treatmentDecision: TREATMENT_DECISION_MAP[conclusionLabel] || 'OUTPATIENT_TREATMENT',
            confirmDischarge: conclusionLabel === 'Kết thúc cho về',
            conclusion: conclusionText,
            summary: conclusionText,
            serviceIds: paraclinicalServices
                .map((item) => item?.serviceId || item?.id)
                .filter(Boolean),
            medicines: medsList
                .filter((item) => Number(item?.id || item?.medicineId || 0) > 0)
                .map((item) => ({
                    medicineId: Number(item.id || item.medicineId),
                    serviceId: Number(item.serviceId || defaultClinicalService?.serviceId || defaultClinicalService?.id || 1),
                    quantity: Number(item.qty || item.quantity || 1),
                    dosageUnit: String(item.selectedUnit || item.unit || '').replace(/^\//, '').trim() || undefined,
                    morning: normalizeDoseValue(item?.dosage?.morning),
                    noon: normalizeDoseValue(item?.dosage?.noon),
                    afternoon: normalizeDoseValue(item?.dosage?.afternoon),
                    evening: normalizeDoseValue(item?.dosage?.evening),
                    instruction: item?.dosage?.note || item?.note || undefined,
                })),
        };

        return treatmentService.recordExamResult(id, payload, []);
    };

    const handleFinish = async () => {
        if (isReadonlyMode) {
            return;
        }

        const isDischargeConclusion = selectedConclusion === 'Kết thúc cho về';
        try {
            await saveTreatmentConclusion();
            if (isDischargeConclusion) {
                navigate('/doctors/tickets');
                return;
            }
        } catch {
            // Keep UX flow by still showing completion modal when backend contract is unavailable.
        }
        setShowFinishModal(true);
    };

    const conclusionOptions = ['Cận lâm sàng', 'Điều trị nội trú', 'Điều trị ngoại trú', 'Kết thúc cho về'];

    return (
        <div className="service-order-page">
            {/* Header */}
            <div className="so-header">
                <button className="so-btn-icon" onClick={() => navigate(-1)}><ChevronLeft size={24} color="#1a1a1a" /></button>
                <h1 className="so-title">Đơn dịch vụ</h1>
                {/* <button className="so-btn-icon"><MoreVertical size={24} color="#1a1a1a" /></button> */}
            </div>

            <div className="so-content">
                {/* Customer Info */}
                <div className="so-customer-card">
                    <div className="so-customer-row">
                        <div>
                            <h2 className="so-customer-name">{receptionDetail?.client?.fullName || '---'}</h2>
                            <div className="so-customer-phone">
                                <Phone size={14} className="so-icon-phone" />
                                <span>{receptionDetail?.client?.phoneNumber || '---'}</span>
                            </div>
                        </div>
                        {/* <div className="so-payment-info">
                            <span className="so-paid">0đ</span>
                            <span className="so-total">/1.000.000đ</span>
                        </div> */}
                    </div>

                    <Divider />

                    <div className="so-created-info">
                        <span>
                            Được tạo từ đơn tiếp đón lúc <span className="so-time">{receptionDetail?.receptionTime ? new Date(receptionDetail.receptionTime).toLocaleString('vi-VN') : '--:-- --/--/----'}</span>
                        </span>
                        {/* <Eye size={16} className="so-icon-eye" /> */}
                    </div>

                    {/* Pet Info Box - TicketCard design with 2 cases */}
                    {petInfo.hasAlert ? (
                        <div className="ticket-pet-info-box has-alert">
                            <div className="ticket-pet-details">
                                <span className="ticket-pet-name">{petInfo.name}</span>
                                <span className="ticket-pet-breed">
                                    {petInfo.breed}
                                    {petInfo.gender === 'male' ? <Mars size={12} color="#3b82f6" style={{ display: 'inline', marginLeft: '4px' }} /> : null}
                                </span>
                                <span className="ticket-pet-stat"><Weight size={14} color="#888" style={{ marginRight: '4px' }} /> {petInfo.weight}</span>
                            </div>
                            <div className="ticket-pet-alert-icon">
                                <AlertBadgeIcon />
                            </div>
                        </div>
                    ) : (
                        <div className="ticket-pet-info-box">
                            <div className="ticket-pet-details">
                                <span className="ticket-pet-name">{petInfo.name}</span>
                                <span className="ticket-pet-breed">
                                    {petInfo.breed}
                                    {petInfo.gender === 'male' ? <Mars size={12} color="#3b82f6" style={{ display: 'inline', marginLeft: '4px' }} /> : null}
                                </span>
                                <span className="ticket-pet-stat"><Weight size={14} color="#888" style={{ marginRight: '4px' }} /> {petInfo.weight}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="so-tabs">
                    {tabs.map(tab => (
                        <div
                            key={tab}
                            className={`so-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Accordions / Sections */}
                <div className="so-sections">
                    {activeTab === 'Dịch vụ' && (
                        <>

                            {paraclinicalServices.length > 0 && (
                                <ServiceAccordion title="Dịch vụ" defaultExpanded>
                                    {paraclinicalServices.map((service, index) => (
                                        <div
                                            className="so-service-item"
                                            key={`paraclinical-${service.id || service.name}-${service.technicianName || 'unknown'}-${index}`}
                                        >
                                            {(() => {
                                                const serviceStatusMeta = normalizeReceptionStatus(service?.status);
                                                return (
                                                    <>
                                                        <div className="so-service-row">
                                                            <span className="so-service-name">{formatDisplayText(service.name, 'Dịch vụ')}</span>
                                                            <span className={`so-service-status ${serviceStatusMeta.key}`}>{formatDisplayText(serviceStatusMeta.label)}</span>
                                                        </div>
                                                        <div className="so-service-price">
                                                            {(() => {
                                                                const quantity = Math.max(1, Number(service?.quantity || 1));
                                                                const unitPrice = toNumber(service?.price);
                                                                const lineAmount = unitPrice * quantity;
                                                                return (
                                                                    <>
                                                                        <span className="so-price-val">{lineAmount.toLocaleString('vi-VN')}đ</span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="so-service-executor">
                                                            <span className="so-exec-label">Người thực hiện</span>
                                                            <span className="so-exec-name">{toTitleCase(service.technicianName) || service.technicianName}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </ServiceAccordion>
                            )}

                            {canAddServices && (
                                <button
                                    className="so-add-service-card"
                                    type="button"
                                    aria-label="Thêm dịch vụ"
                                    disabled={isReadonlyMode}
                                    onClick={() => navigate('/doctors/clinical-services', {
                                        state: {
                                            receptionId: id,
                                        },
                                    })}
                                >
                                    <span className="so-add-service-icon"><Plus size={40} strokeWidth={1.6} /></span>
                                </button>
                            )}
                        </>
                    )}

                    {activeTab === 'Lịch sử điều trị' && <TreatmentHistoryTimeline petId={receptionDetail?.pet?.id} />}

                    {activeTab === 'Kết luận phiếu khám' && (
                        <div className="so-conclusion-wrap">
                            <div className="so-result-summary-card">
                                <span className="so-result-summary-label">Tổng hợp kết quả</span>
                                <button
                                    className="so-result-summary-btn"
                                    type="button"
                                    onClick={() => navigate('/doctors/result-summary', {
                                        state: {
                                            receptionId: id,
                                            treatmentSlipId: treatmentDetail?.id || null,
                                        },
                                    })}
                                >
                                    <span>Xem dịch vụ</span>
                                    <Eye size={18} />
                                </button>
                            </div>

                            <div className="so-medicine-panel">
                                <button
                                    className="so-medicine-header"
                                    type="button"
                                    onClick={() => setIsMedsExpanded((prev) => !prev)}
                                    aria-expanded={isMedsExpanded}
                                >
                                    <span>Thuốc & vật tư đi kèm</span>
                                    {isMedsExpanded ? <ChevronUp size={18} color="#666" /> : <ChevronDown size={18} color="#666" />}
                                </button>

                                {isMedsExpanded && (
                                    <div className={`so-medicine-content ${medsList.length === 0 ? 'is-empty' : ''}`}>
                                        {medsList.length > 0 && (
                                            <div className="so-medicine-list-grouped">
                                                {(() => {
                                                    const serviceNameMap = new Map();
                                                    paraclinicalServices.forEach((s) => {
                                                        serviceNameMap.set(Number(s.serviceId || s.id), s.name || s.serviceName);
                                                    });
                                                    serviceNameMap.set(1, 'Khám lâm sàng');

                                                    const groups = medsList.reduce((acc, med) => {
                                                        const sid = Number(med.serviceId || 1);
                                                        if (!acc[sid]) acc[sid] = [];
                                                        acc[sid].push(med);
                                                        return acc;
                                                    }, {});

                                                    return Object.entries(groups).map(([sid, items]) => {
                                                        const serviceName = serviceNameMap.get(Number(sid)) || `Dịch vụ #${sid}`;
                                                        return (
                                                            <div key={`group-${sid}`} className="so-med-group">
                                                                <h5 className="so-med-group-title">{serviceName}</h5>
                                                                {items.map((med, index) => {
                                                                    const quantity = Number(med?.qty ?? med?.quantity ?? 1) || 1;
                                                                    const isThuoc = med?.type === 'THUOC' || med?.type === 'MEDICINE';
                                                                    const originalUnit = String(med?.selectedUnit || med?.unit || 'Đơn vị').replace(/^\//, '');
                                                                    const quantityUnit = originalUnit;
                                                                    const dosageRows = [
                                                                        { label: 'Sáng', value: med?.dosage?.morning || 0 },
                                                                        { label: 'Trưa', value: med?.dosage?.noon || 0 },
                                                                        { label: 'Chiều', value: med?.dosage?.afternoon || 0 },
                                                                        { label: 'Tối', value: med?.dosage?.evening || 0 },
                                                                    ].filter((dosage) => dosage.value > 0);

                                                                    return (
                                                                        <div key={`${med?.id || med?.medicineId || med?.name || 'medicine'}-${index}`} className="so-medicine-item">
                                                                            <div className="so-medicine-item-head">
                                                                                <h4>{med.name}</h4>
                                                                                <button
                                                                                    type="button"
                                                                                    className="so-medicine-edit"
                                                                                    onClick={openMedicineSelector}
                                                                                    disabled={isReadonlyMode}
                                                                                    aria-label={`Chỉnh thuốc và vật tư cho ${med.name}`}
                                                                                >
                                                                                    <PencilLine size={15} color="#209D80" />
                                                                                </button>
                                                                            </div>
                                                                            <div className="so-medicine-row">
                                                                                <span>Số lượng</span>
                                                                                <strong>{quantity} {quantityUnit}</strong>
                                                                            </div>
                                                                            {isThuoc && dosageRows.length > 0 && dosageRows.map((dosage) => (
                                                                                <div key={`${med?.id || med?.medicineId}-${dosage.label}`} className="so-medicine-row">
                                                                                    <span>{dosage.label}</span>
                                                                                    <strong>{dosage.value} {originalUnit}</strong>
                                                                                </div>
                                                                            ))}
                                                                            {isThuoc && (
                                                                                <div className="so-medicine-row">
                                                                                    <span>Chỉ định khác</span>
                                                                                    <strong>{med?.dosage?.note || med?.note || '---'}</strong>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        )}

                                        <div className={`so-medicine-add-wrap ${medsList.length > 0 ? 'has-list' : 'is-empty'}`}>
                                            <button
                                                type="button"
                                                className="so-medicine-add"
                                                onClick={openMedicineSelector}
                                                disabled={isReadonlyMode}
                                                aria-label="Thêm thuốc và vật tư"
                                            >
                                                <Plus size={32} strokeWidth={1.6} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="so-conclusion-block">
                                <h3 className="so-conclusion-title">Kết quả chung <span className="so-required">*</span></h3>
                                <div className="so-conclusion-box">
                                    <textarea
                                        className="so-conclusion-input"
                                        value={conclusionText}
                                        onChange={(event) => setConclusionText(event.target.value.slice(0, MAX_CONCLUSION_LENGTH))}
                                        maxLength={MAX_CONCLUSION_LENGTH}
                                        rows={4}
                                        readOnly={isReadonlyMode}
                                        required
                                        aria-required="true"
                                    />
                                    <span className="so-conclusion-count">{MAX_CONCLUSION_LENGTH - conclusionText.length}</span>
                                </div>
                            </div>

                            <div className="so-conclusion-block">
                                <h3 className="so-conclusion-title">Kết luận <span className="so-required">*</span></h3>
                                <div className="so-conclusion-options">
                                    {conclusionOptions.map((option) => (
                                        <label
                                            key={option}
                                            className="so-option-item"
                                        >
                                            <input
                                                type="radio"
                                                name="service-order-conclusion"
                                                value={option}
                                                checked={selectedConclusion === option}
                                                onChange={() => setSelectedConclusion(option)}
                                                disabled={isReadonlyMode}
                                                required
                                                aria-required="true"
                                            />
                                            <span className="so-option-dot" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            {!isReadonlyMode && (activeTab === 'Kết luận phiếu khám' ? (
                <div className="so-bottom-actions so-bottom-actions-single">
                    <button className="so-btn-finish" onClick={handleFinish} disabled={isReadonlyMode || !conclusionText.trim() || !selectedConclusion}>
                        Kết thúc
                    </button>
                </div>
            ) : (
                <div className="so-bottom-actions">
                    <button
                        className="so-btn-cancel"
                        onClick={() => navigate('/doctors/tickets', { replace: true })}
                        disabled={isReadonlyMode}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className="so-btn-execute"
                        disabled={isReadonlyMode || isDefaultServiceCompleted || isStartingService}
                        onClick={handleExecute}
                    >
                        {isStartingService ? 'Đang cập nhật...' : 'Thực hiện'}
                    </button>
                </div>
            ))}

            <FeatureDevelopingModal open={showFinishModal} onClose={() => setShowFinishModal(false)} />
        </div>
    );
}
