import React from 'react';
import { Phone, Mars, Venus, Weight } from 'lucide-react';
import './ReceivedCard.css';

const ReceivedCard = ({
    customerName,
    phone,
    status,
    createdAt,
    pets,
    sourceOrder,
    onPayment,
    paymentEnabled = true,
    hideSource = false,
    totalAmount,
    paymentButtonLabel = 'Thanh toán',
}) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();
    const statusClassName = normalizedStatus.includes('đã thanh toán') || normalizedStatus.includes('paid')
        ? 'paid'
        : normalizedStatus.includes('chờ thanh toán') || normalizedStatus.includes('waiting_payment')
            ? 'waiting-payment'
            : 'received';

    const createdAtLabel = createdAt
        ? (String(createdAt || '').toLowerCase().includes('lúc') ? createdAt : `Tạo đơn lúc ${createdAt}`)
        : '--';

    return (
        <div className="received-card">
            <div className="rc-card-header">
                <div className="rc-card-main-meta">
                    <h3 className="rc-card-name">{customerName}</h3>
                    <div className="rc-card-sub-header">
                        <div className="rc-card-phone">
                            <Phone size={13} color="#209D80" strokeWidth={2.5} />
                            <span>{phone}</span>
                        </div>
                    </div>
                    <p className="rc-card-created">{createdAtLabel}</p>
                </div>
                <span className={`rc-card-status ${statusClassName}`}>{status}</span>
            </div>

            <div className="rc-card-pets">
                {pets.map((pet, idx) => (
                    <div key={idx} className="rc-card-pet-info-box">
                        <span className="rc-card-pet-details">
                            <span className="rc-card-pet-name">{pet.name}</span>
                            <span className="rc-card-pet-breed">
                                {pet.breed}
                                {pet.gender === 'male' && (
                                    <Mars size={12} color="#3b82f6" style={{ marginLeft: '4px' }} />
                                )}
                                {pet.gender === 'female' && (
                                    <Venus size={12} color="#ec4899" style={{ marginLeft: '4px' }} />
                                )}
                            </span>
                        </span>
                    </div>
                ))}
            </div>

            <div className={`rc-card-footer ${hideSource ? 'full-btn' : ''}`}>
                {!!totalAmount && (
                    <div className="rc-card-amount">{totalAmount}</div>
                )}

                {!hideSource && !totalAmount && (
                    <div className="rc-card-source">
                        {sourceOrder ? (
                            <span>
                                Tiếp đón từ đơn <span className="rc-card-source-id">#{sourceOrder}</span>
                            </span>
                        ) : (
                            <span>Tiền tổng hóa đơn</span>
                        )}
                    </div>
                )}

                <button
                    className={`rc-card-pay-btn ${paymentEnabled ? '' : 'disabled'} ${hideSource ? 'full-width' : ''}`}
                    onClick={paymentEnabled ? onPayment : undefined}
                >
                    Thanh toán
                </button>
            </div>
        </div>
    );
};

export default ReceivedCard;
