import React from 'react';
import './TicketCard.css';
import { Mars, Venus, Calendar, Weight, AlertTriangle } from 'lucide-react';

const MaleIcon = () => <Mars size={12} color="#3b82f6" style={{ display: 'inline', marginLeft: '4px' }} />;
const FemaleIcon = () => <Venus size={12} color="#ec4899" style={{ display: 'inline', marginLeft: '4px' }} />;

const AgeIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px', color: '#888' }}>
        <Calendar size={14} strokeWidth={2} />
    </span>
);

const WeightIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px', color: '#888' }}>
        <Weight size={14} strokeWidth={2} />
    </span>
);

const AlertIcon = () => <AlertTriangle size={24} color="#ef4444" strokeWidth={2} />;

const statusConfig = {
    pending: { label: 'Chờ thực hiện', color: '#d97706' }, // cam/vàng
    completed: { label: 'Hoàn thành', color: '#10b981' }, // xanh ngọc
    failed: { label: 'Thất bại', color: '#ef4444' } // đỏ
};

const TicketCard = ({
    customerName,
    dateTime,
    paidAmount,
    totalAmount,
    pet,
    services
}) => {
    return (
        <div className="ticket-card">
            <div className="ticket-header">
                <div className="ticket-info-left">
                    <h3 className="customer-name">{customerName}</h3>
                    <p className="datetime">{dateTime}</p>
                </div>
                <div className="ticket-info-right">
                    <span className="paid-amount">{paidAmount}</span>
                    <span className="total-amount">{totalAmount}</span>
                </div>
            </div>

            <div className={`pet-info-box ${pet.hasAlert ? 'has-alert' : ''}`}>
                <div className="pet-details">
                    <span className="pet-name">{pet.name}</span>
                    <span className="pet-breed">
                        {pet.breed}
                        {pet.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                    </span>
                    <span className="pet-stat">
                        <AgeIcon /> {pet.age}
                    </span>
                    <span className="pet-stat">
                        <WeightIcon /> {pet.weight}
                    </span>
                </div>
                {pet.hasAlert && (
                    <div className="pet-alert-icon">
                        <AlertIcon />
                    </div>
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
