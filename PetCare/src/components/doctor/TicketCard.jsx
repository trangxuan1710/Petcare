import React from 'react';
import './TicketCard.css';
import { Mars, Venus, Weight, AlertTriangle } from 'lucide-react';
import { toTitleCase } from '../../utils/textFormat';

const MaleIcon = () => <Mars size={12} color="#3b82f6" style={{ display: 'inline', marginLeft: '4px' }} />;
const FemaleIcon = () => <Venus size={12} color="#ec4899" style={{ display: 'inline', marginLeft: '4px' }} />;

const WeightIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px', color: '#888' }}>
        <Weight size={14} strokeWidth={2} />
    </span>
);

const AlertIcon = () => <AlertTriangle size={24} color="#ef4444" strokeWidth={2} />;

const statusConfig = {
    pending: { label: 'Chờ thực hiện', color: '#d97706' }, // cam/vàng
    in_progress: { label: 'Đang thực hiện', color: '#2563eb' }, // xanh dương
    completed: { label: 'Hoàn thành', color: '#10b981' }, // xanh ngọc
    failed: { label: 'Thất bại', color: '#ef4444' } // đỏ
};

const TicketCard = ({
    customerName,
    dateTime,
    // paidAmount,
    // totalAmount,
    pet,
    services,
    onClick
}) => {
    const displayCustomerName = toTitleCase(customerName) || customerName;
    const displayPetName = toTitleCase(pet?.name || 'Chưa có tên') || 'Chưa có tên';
    const displayPetBreed = toTitleCase(pet?.breed || '') || '--';

    return (
        <div
            className="ticket-card"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            <div className="ticket-header">
                <div className="ticket-info-left">
                    <h3 className="customer-name">{displayCustomerName}</h3>
                    <p className="datetime">{dateTime}</p>
                </div>
                {/* <div className="ticket-info-right">
                    <span className="paid-amount">{paidAmount}</span>
                    <span className="total-amount">{totalAmount}</span>
                </div> */}
            </div>
            <div className={`ticket-pet-info-box ${pet.hasAlert ? 'has-alert' : ''}`}>
                <span className="ticket-pet-details">
                    <span className="ticket-pet-name">{displayPetName}</span>
                    <span className="ticket-pet-breed">
                        {displayPetBreed}
                        {pet.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                    </span>
                    <span className="ticket-pet-stat">
                        <WeightIcon /> {pet.weight}
                    </span>
                </span>
                {pet.hasAlert && (
                    <span className="ticket-pet-alert-icon">
                        <AlertIcon />
                    </span>
                )}
            </div>

            <div className="services-list">
                {services.map((service, index) => (
                    <div className="service-item" key={index}>
                        <span className="service-name">{service.name}</span>
                        <span
                            className="service-status"
                            style={{ color: statusConfig[service.status]?.color }}
                        >
                            {statusConfig[service.status]?.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketCard;
