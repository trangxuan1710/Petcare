import React, { useState } from 'react';
import './StaffReceptionCard.css';
import { Phone, PawPrint, Weight, ShieldCheck } from 'lucide-react';
import { Button } from 'semantic-ui-react';
import { toTitleCase } from '../../utils/textFormat';

const statusStyles = {
    received: { label: 'Chờ thanh toán', color: '#f0a020' },
    exam: { label: 'Đang khám', color: '#16a34a' },
    done: { label: 'Hoàn thành', color: '#2563eb' },
    waiting: { label: 'Đang chờ', color: '#64748b' }
};

const StaffReceptionCard = ({
    customer,
    phone,
    code,
    createdAt,
    status = 'received',
    pets,
    total,
    onPay
}) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        setPressed(true);
        window.setTimeout(() => setPressed(false), 140);
    };

    const statusInfo = statusStyles[status] || statusStyles.received;

    return (
        <div className={`staff-card ${pressed ? 'is-pressed' : ''}`} onClick={handlePress}>
            <div className="staff-card-header">
                <div>
                    <h3 className="staff-card-name">{toTitleCase(customer) || customer}</h3>
                    <div className="staff-card-phone">
                        <Phone size={14} />
                        <span>{phone}</span>
                    </div>
                    <div className="staff-card-created">Tạo đơn lúc {createdAt}</div>
                </div>
                <div className="staff-card-meta">
                    <div className="staff-card-code">#{code}</div>
                    <div className="staff-card-status" style={{ color: statusInfo.color }}>
                        {statusInfo.label}
                    </div>
                </div>
            </div>

            <div className="staff-card-divider" />

            <div className="staff-card-pets">
                {pets.map((pet, index) => (
                    <div className="staff-card-pet" key={`${pet.name}-${index}`}>
                        <span className="pet-name">{toTitleCase(pet.name) || pet.name}</span>
                        <span className="pet-breed">{toTitleCase(pet.breed) || pet.breed}</span>
                        <span className="pet-meta"><PawPrint size={14} /> {pet.type}</span>
                        <span className="pet-meta"><Weight size={14} /> {pet.weight}</span>
                        {pet.alert && (
                            <span className="pet-alert"><ShieldCheck size={14} /> Cảnh báo</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="staff-card-footer">
                <div className="staff-card-amounts">
                    <div className="total-amount">{total}</div>
                </div>
                <Button
                    className="staff-pay-btn"
                    onClick={(event) => {
                        event.stopPropagation();
                        handlePress();
                        if (onPay) onPay();
                    }}
                >
                    Thanh toán
                </Button>
            </div>
        </div>
    );
};

export default StaffReceptionCard;
