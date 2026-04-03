import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TicketDetails.css';
import '../../components/doctor/TicketCard.css';
import "@fontsource/roboto/600.css";
import receptionService from '../../api/receptionService';

import { ChevronLeft, MoreVertical, Phone, TriangleAlert, Cake, Weight, Mars } from 'lucide-react';

const BackIcon = () => <ChevronLeft size={24} color="#1a1a1a" />;
const MoreVerticalIcon = () => <MoreVertical size={24} color="#1a1a1a" />;
const PhoneIcon = () => <Phone size={14} color="#209D80" />;
const WarningIcon = () => <TriangleAlert size={16} color="#d97706" />;
const MaleIcon = () => <Mars size={12} color="#3b82f6" style={{ display: 'inline', marginLeft: '4px' }} />;
const AgeIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px', color: '#888' }}>
        <Cake size={14} color="currentColor" />
    </span>
);
const WeightIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px', color: '#888' }}>
        <Weight size={14} color="currentColor" />
    </span>
);
const AlertBadgeIcon = () => <TriangleAlert size={24} color="#ef4444" />;
const NoteModalIcon = () => <TriangleAlert size={24} color="#C07F00" />;

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

const isEmergencyCase = (record) => Boolean(
    record?.isEmergency
    ?? record?.emergency
    ?? record?.examForm?.isEmergency
    ?? record?.examForm?.emergency
);

const isFinalReceptionStatus = (rawStatus) => {
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

const NoteModal = ({ note, onClose }) => {
    if (!note) return null;
    return (
        <div className="note-modal-overlay">
            <div className="note-modal-content">
                <div className="note-modal-icon-container">
                    <NoteModalIcon />
                </div>
                <h2 className="note-modal-title">Lưu ý</h2>
                <div className="note-modal-text-box">
                    {note}
                </div>
                <button className="note-modal-btn" onClick={onClose}>Đã hiểu</button>
            </div>
        </div>
    );
};

const TicketDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [ticketDetail, setTicketDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const response = await receptionService.getReceptionById(id);
                if (!isMounted) return;
                setTicketDetail(response?.normalizedData || null);
            } catch {
                if (!isMounted) return;
                setTicketDetail(null);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (id) {
            fetchDetail();
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

    const petInfo = useMemo(() => {
        const pet = ticketDetail?.pet;
        return {
            name: pet?.name || '---',
            breed: pet?.breed || pet?.species || '---',
            gender: (pet?.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
            age: calcAgeLabel(pet?.dateOfBirth),
            weight: ticketDetail?.weight ? `${ticketDetail.weight}kg` : (pet?.weight ? `${pet.weight}kg` : '--kg'),
            hasAlert: isEmergencyCase(ticketDetail)
        };
    }, [ticketDetail]);

    const normalizedNote = typeof ticketDetail?.note === 'string' ? ticketDetail.note.trim() : '';
    const hasWarningNote = normalizedNote.length > 0;
    const displayNote = hasWarningNote ? normalizedNote : '';

    const goToServiceOrder = async () => {
        if (id) {
            try {
                if (isFinalReceptionStatus(ticketDetail?.status)) {
                    await receptionService.initDefaultClinicalService(id);
                } else {
                    await Promise.allSettled([
                        receptionService.initDefaultClinicalService(id),
                        receptionService.patchReceptionById(id, { status: 'IN_PROGRESS' }),
                    ]);
                }
            } catch {
                // Continue navigation to avoid blocking doctor workflow.
            }
        }
        navigate(`/doctors/service-order/${id ?? 1}`);
    };

    const handleStartClick = () => {
        if (hasWarningNote) {
            setShowModal(true);
            return;
        }
        goToServiceOrder();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        goToServiceOrder();
    };

    return (
        <div className="ticket-details-page">
            {showModal && <NoteModal note={displayNote} onClose={handleCloseModal} />}
            {/* Header */}
            <div className="details-header">
                <button className="icon-btn-back" onClick={() => navigate('/doctors/tickets')}><BackIcon /></button>
                <h1 className="details-title">Chi tiết phiếu khám</h1>
                {/* <button className="icon-btn-more"><MoreVerticalIcon /></button> */}
            </div>

            {/* Content */}
            <div className="details-content">
                <div className="info-card">

                    {/* Customer Info */}
                    <div className="card-header-row">
                        <div className="customer-info">
                            <h2 className="customer-name-lg">{ticketDetail?.client?.fullName || '---'}</h2>
                            <div className="customer-phone">
                                <PhoneIcon />
                                <span>{ticketDetail?.client?.phoneNumber || '---'}</span>
                            </div>
                        </div>
                        {/* <div className="payment-info">
                            <span className="paid-val">0đ</span>
                            <span className="total-val">/1.000.000đ</span>
                        </div> */}
                    </div>

                    {/* Customer Alert */}
                    {hasWarningNote && (
                        <div className="customer-alert-box">
                            <div className="alert-box-title">
                                <WarningIcon />
                                <span>Lưu ý</span>
                            </div>
                            <p className="alert-box-text">
                                {displayNote}
                            </p>
                        </div>
                    )}

                    {/* Pet Info */}
                    {petInfo.hasAlert ? (
                        <div className="ticket-pet-info-box has-alert">
                            <div className="ticket-pet-details">
                                <span className="ticket-pet-name">{petInfo.name}</span>
                                <span className="ticket-pet-breed">
                                    {petInfo.breed}
                                    {petInfo.gender === 'male' ? <MaleIcon /> : null}
                                </span>
                                <span className="ticket-pet-stat">
                                    <AgeIcon /> {petInfo.age}
                                </span>
                                <span className="ticket-pet-stat">
                                    <WeightIcon /> {petInfo.weight}
                                </span>
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
                                    {petInfo.gender === 'male' ? <MaleIcon /> : null}
                                </span>
                                <span className="ticket-pet-stat">
                                    <AgeIcon /> {petInfo.age}
                                </span>
                                <span className="ticket-pet-stat">
                                    <WeightIcon /> {petInfo.weight}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Examination Info */}
                    <div className="exam-info-list">
                        <div className="exam-info-row">
                            <span className="exam-info-label">Lý do khám:</span>
                            <span className="exam-info-value text-right">{ticketDetail?.examReason || '---'}</span>
                        </div>
                        <div className="exam-info-row">
                            <span className="exam-info-label">Hình thức khám</span>
                            <span className="exam-info-value text-right">{ticketDetail?.examForm?.examType || '--'}</span>
                        </div>
                        <div className="exam-info-row align-top">
                            <span className="exam-info-label">Mô tả</span>
                            <span className="exam-info-value text-right multi-line">
                                {ticketDetail?.symptomDescription || '---'}
                            </span>
                        </div>
                    </div>

                    {/* Footer divider & text */}
                    <div className="card-footer-info">
                        {isLoading ? 'Đang tải dữ liệu...' : `Mã phiếu #${ticketDetail?.id || id || '--'}`}
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bottom-action-bar">
                <button className="primary-action-btn" onClick={handleStartClick}>Bắt đầu</button>
            </div>
        </div>
    );
};

export default TicketDetails;
