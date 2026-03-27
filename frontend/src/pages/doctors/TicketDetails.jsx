import React, { useState } from 'react';
import './TicketDetails.css';
import '../../components/doctor/TicketCard.css';

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

const TicketDetails = ({ note = "Khách hàng khó tính, yêu cầu không gọi điện, pet hung dữ nên cần nhẹ nhàng khi thực hiện dịch vụ" }) => {
    const [showModal, setShowModal] = useState(false);

    const handleStartClick = () => {
        if (note) {
            setShowModal(true);
        }
    };

    return (
        <div className="ticket-details-page">
            {showModal && <NoteModal note={note} onClose={() => setShowModal(false)} />}
            {/* Header */}
            <div className="details-header">
                <button className="icon-btn-back"><BackIcon /></button>
                <h1 className="details-title">Chi tiết phiếu khám</h1>
                <button className="icon-btn-more"><MoreVerticalIcon /></button>
            </div>

            {/* Content */}
            <div className="details-content">
                <div className="info-card">

                    {/* Customer Info */}
                    <div className="card-header-row">
                        <div className="customer-info">
                            <h2 className="customer-name-lg">Nguyễn Anh Đức</h2>
                            <div className="customer-phone">
                                <PhoneIcon />
                                <span>0912345678</span>
                            </div>
                        </div>
                        <div className="payment-info">
                            <span className="paid-val">0đ</span>
                            <span className="total-val">/1.000.000đ</span>
                        </div>
                    </div>

                    {/* Customer Alert */}
                    {note && (
                        <div className="customer-alert-box">
                            <div className="alert-box-title">
                                <WarningIcon />
                                <span>Lưu ý</span>
                            </div>
                            <p className="alert-box-text">
                                {note}
                            </p>
                        </div>
                    )}

                    {/* Pet Info (Reusing styling pattern from TicketCard) */}
                    <div className="pet-info-box has-alert">
                        <div className="pet-details">
                            <span className="pet-name">Kuro</span>
                            <span className="pet-breed">
                                Chó Poodle
                                <MaleIcon />
                            </span>
                            <span className="pet-stat">
                                <AgeIcon /> 3 Tuổi
                            </span>
                            <span className="pet-stat">
                                <WeightIcon /> 4.5kg
                            </span>
                        </div>
                        <div className="pet-alert-icon">
                            <AlertBadgeIcon />
                        </div>
                    </div>

                    {/* Examination Info */}
                    <div className="exam-info-list">
                        <div className="exam-info-row">
                            <span className="exam-info-label">Lý do khám:</span>
                            <span className="exam-info-value text-right">Co giật, thở yếu</span>
                        </div>
                        <div className="exam-info-row">
                            <span className="exam-info-label">Hình thức khám</span>
                            <span className="exam-info-value text-right">--</span>
                        </div>
                        <div className="exam-info-row align-top">
                            <span className="exam-info-label">Mô tả</span>
                            <span className="exam-info-value text-right multi-line">
                                Chó bị ngã từ tầng 4 xuống nên có thể bị gãy chân. Ngã từ ngày hôm qua, nằm im một chỗ cả ngày
                            </span>
                        </div>
                    </div>

                    {/* Footer divider & text */}
                    <div className="card-footer-info">
                        Nguyễn Văn An thực hiện lúc 10:03 - 20/03/2026
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
