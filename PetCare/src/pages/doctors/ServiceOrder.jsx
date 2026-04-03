import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Phone, Eye, Mars, Calendar, Weight, Plus, TriangleAlert } from 'lucide-react';
import ServiceAccordion from '../../components/doctor/ServiceAccordion';
import TreatmentHistoryTimeline from '../../components/doctor/TreatmentHistoryTimeline';
import FeatureDevelopingModal from '../../components/common/FeatureDevelopingModal';
import './ServiceOrder.css';
import '../../components/doctor/TicketCard.css';
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import {Divider} from "semantic-ui-react";
import receptionService from '../../api/receptionService';
import treatmentService from '../../api/treatmentService';

const AlertBadgeIcon = () => <TriangleAlert size={24} color="#ef4444" strokeWidth={2} />;

const calcAgeLabel = (dateOfBirth) => {
    if (!dateOfBirth) return '-- Tuổi';
    const birth = new Date(dateOfBirth);
    if (Number.isNaN(birth.getTime())) return '-- Tuổi';
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        years -= 1;
    }
    return `${Math.max(years, 0)} Tuổi`;
};

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

const isParaclinicalConclusion = (rawType) => {
    const type = String(rawType || '').trim().toLowerCase();
    return (
        type === 'cận lâm sàng'
        || type === 'paraclinical_exam'
        || type === 'paraclinical exam'
    );
};

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
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
    const [activeTab, setActiveTab] = useState('Dịch vụ');
    const [selectedConclusion, setSelectedConclusion] = useState('');
    const [showFinishModal, setShowFinishModal] = useState(false);
    const MAX_CONCLUSION_LENGTH = 2000;
    const [conclusionText, setConclusionText] = useState('');
    const [receptionDetail, setReceptionDetail] = useState(null);
    const [treatmentDetail, setTreatmentDetail] = useState(null);
    const [paraclinicalServices, setParaclinicalServices] = useState([]);
    const [isStartingService, setIsStartingService] = useState(false);

    const mapParaclinicalItem = (item) => ({
        id: item?.id || item?.serviceId || item?.service?.id || item?.paraclinicalServiceId,
        serviceId: item?.serviceId || item?.service?.id || item?.id,
        name: item?.serviceName || item?.service?.name || 'Dịch vụ cận lâm sàng',
        status: item?.status || 'pending',
        technicianName: item?.technicianName || item?.technician?.fullName || item?.technician?.name || 'Chưa gán',
        quantity: item?.quantity || 1,
        price: item?.price ?? item?.service?.price ?? item?.unitPrice ?? 0,
    });

    const mapAssignedServiceItem = (item) => ({
        id: item?.serviceId || item?.id,
        serviceId: item?.serviceId || item?.id,
        name: item?.serviceName || item?.name || 'Dịch vụ',
        status: item?.status || 'pending',
        startedAt: item?.startedAt || null,
        technicianName: item?.performerName || item?.technicianName || 'Chưa gán',
        quantity: item?.quantity || 1,
        price: item?.unitPrice ?? item?.price ?? 0,
    });

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

                const selectedByServiceId = new Map();
                selectedServices.forEach((service) => {
                    const serviceId = String(service?.serviceId || service?.id || '');
                    if (serviceId) {
                        selectedByServiceId.set(serviceId, service);
                    }
                });

                const mergedServices = assignedServices.map((service) => {
                    const matched = selectedByServiceId.get(String(service.serviceId || service.id));
                    return matched
                        ? {
                            ...service,
                            technicianName: matched.technicianName || service.technicianName,
                            status: matched.status || service.status,
                        }
                        : service;
                });

                setReceptionDetail(receptionData || null);
                setTreatmentDetail(treatmentData || null);
                setParaclinicalServices(mergedServices);

                if (typeof treatmentData?.plan === 'string' && treatmentData.plan.trim()) {
                    setConclusionText(treatmentData.plan);
                }
                if (typeof treatmentData?.type === 'string' && treatmentData.type.trim()) {
                    setSelectedConclusion(treatmentData.type);
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
    }, [id, location.state?.refreshParaclinical]);

    const petInfo = useMemo(() => {
        const pet = receptionDetail?.pet;
        return {
            name: pet?.name || '---',
            breed: pet?.breed || pet?.species || '---',
            gender: (pet?.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
            age: calcAgeLabel(pet?.dateOfBirth),
            weight: receptionDetail?.weight ? `${receptionDetail.weight}kg` : (pet?.weight ? `${pet.weight}kg` : '--kg'),
            hasAlert: isEmergencyCase(receptionDetail)
        };
    }, [receptionDetail]);

    const primaryService = useMemo(() => {
        const examForm = receptionDetail?.examForm || {};
        const statusMeta = isParaclinicalConclusion(treatmentDetail?.type)
            ? { key: 'completed', label: 'hoàn thành' }
            : normalizeReceptionStatus(receptionDetail?.status);
        const price = Number(examForm?.price ?? receptionDetail?.examPrice ?? 0);
        const quantity = Number(examForm?.quantity ?? 1);

        return {
            name: examForm?.examType || 'Khám lâm sàng',
            status: statusMeta.label,
            statusClass: statusMeta.key,
            price,
            quantity,
            executor: treatmentDetail?.createdBy?.fullName || receptionDetail?.doctor?.fullName || 'Người thực hiện',
        };
    }, [receptionDetail, treatmentDetail]);

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

    const tabs = ['Dịch vụ', 'Kết luận phiếu khám', 'Lịch sử điều trị'];
    const conclusionOptions = ['Cận lâm sàng', 'Điều trị nội trú', 'Điều trị ngoại trú', 'Kết thúc cho về'];

    return (
        <div className="service-order-page">
            {/* Header */}
            <header className="so-header">
                <button className="so-btn-icon" onClick={() => navigate(`/doctors/tickets/${id ?? 1}`)}><ChevronLeft size={24} color="#1a1a1a" /></button>
                <h1 className="so-title">Đơn dịch vụ</h1>
                {/* <button className="so-btn-icon"><MoreVertical size={24} color="#1a1a1a" /></button> */}
            </header>

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

                    <Divider/>
                    
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
                                <span className="ticket-pet-stat"><Calendar size={14} color="#888" style={{ marginRight: '4px' }} /> {petInfo.age}</span>
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
                                <span className="ticket-pet-stat"><Calendar size={14} color="#888" style={{ marginRight: '4px' }} /> {petInfo.age}</span>
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
                                <ServiceAccordion title="DỊCH VỤ" defaultExpanded>
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
                                                <span className="so-service-name">{service.name}</span>
                                                <span className={`so-service-status ${serviceStatusMeta.key}`}>{serviceStatusMeta.label}</span>
                                            </div>
                                            <div className="so-service-price">
                                                <span className="so-price-val">{Number(service.price || 0).toLocaleString('vi-VN')}đ</span>
                                                <span className="so-price-unit"> /lượt x{service.quantity}</span>
                                            </div>
                                            <div className="so-service-executor">
                                                <span className="so-exec-label">Người thực hiện</span>
                                                <span className="so-exec-name">{service.technicianName}</span>
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
                    <button className="so-btn-finish" onClick={handleFinish} disabled={isReadonlyMode}>Kết thúc</button>
                </div>
            ) : (
                <div className="so-bottom-actions">
                    <button className="so-btn-cancel" onClick={() => navigate(`/doctors/tickets/${id ?? 1}`)} disabled={isReadonlyMode}>Hủy bỏ</button>
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
