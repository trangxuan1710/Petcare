import React from 'react';
import { Phone, Weight } from 'lucide-react';
import { toTitleCase } from '../../utils/textFormat';
import './ReceivedCard.css';

const ReceivedCard = ({
    customerName,
    phone,
    status,
    createdAt,
    pets = [],
    sourceOrder,
    onPayment,
    paymentEnabled = true,
    hideSource = false,
    totalAmount,
    paymentButtonLabel = 'Thanh toán',
    showPets = true,
    showFooter = true,
    onCardClick,
    selectedPetId,
    isEmergency,
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
    const displayCustomerName = toTitleCase(customerName);
    const displayStatus = isEmergency ? 'Cấp cứu' : toTitleCase(status);

    const normalizedPets = Array.isArray(pets) ? pets : [];
    const displayPets = (() => {
        if (normalizedPets.length === 0) return [];
        if (selectedPetId == null || selectedPetId === '') {
            return normalizedPets.slice(0, 1);
        }

        const selectedPet = normalizedPets.find((pet) => String(pet?.id) === String(selectedPetId));
        return selectedPet ? [selectedPet] : normalizedPets.slice(0, 1);
    })();

    return (
        <div
            className={`received-card ${onCardClick ? 'clickable' : ''} ${isEmergency ? 'emergency' : ''}`.trim()}
            onClick={onCardClick}
            role={onCardClick ? 'button' : undefined}
            tabIndex={onCardClick ? 0 : undefined}
            onKeyDown={
                onCardClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onCardClick();
                        }
                    }
                    : undefined
            }
        >
            <div className="rc-card-header">
                <div className="rc-card-main-meta">
                    <h3 className="rc-card-name">{displayCustomerName || customerName}</h3>
                    <div className="rc-card-sub-header">
                        <div className="rc-card-phone">
                            <Phone size={13} color="#209D80" strokeWidth={2.5} />
                            <span>{phone}</span>
                        </div>
                    </div>
                    <p className="rc-card-created">{createdAtLabel}</p>
                    {/* <hr className="rc-divider" /> */}
                </div>
                <span className={`rc-card-status ${statusClassName}`}>{displayStatus || status}</span>
            </div>

            {showPets && (
                <div className="rc-card-pets">
                        {displayPets.map((pet, idx) => {
                            const dob = pet?.dateOfBirth;
                            const breedLabel = toTitleCase(pet?.displayBreed || pet?.breed || '');
                            const petNameLabel = toTitleCase(pet?.name || 'Chưa có tên');
                            const rawWeight = pet?.weight;
                            const weightLabel = rawWeight == null || String(rawWeight).trim() === ''
                                ? ''
                                : (/kg$/i.test(String(rawWeight).trim()) ? String(rawWeight).trim() : `${String(rawWeight).trim()}kg`);
                            let ageLabel = '';
                            if (dob) {
                                try {
                                    const birth = new Date(dob);
                                    const now = new Date();
                                    let years = now.getFullYear() - birth.getFullYear();
                                    const m = now.getMonth() - birth.getMonth();
                                    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
                                    if (years >= 1) ageLabel = `${years} Tuổi`;
                                    else {
                                        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
                                        ageLabel = `${months} Tháng`;
                                    }
                                } catch (e) {
                                    ageLabel = '';
                                }
                            }

                            return (
                                <div key={idx} className="rc-card-pet-info-box">
                                    <span className="rc-card-pet-details">
                                        <span className="rc-card-pet-pill">
                                            <strong className="rc-card-pet-name">{petNameLabel}</strong>
                                            <span className="rc-card-pet-meta">
                                                {breedLabel}
                                                {breedLabel && ageLabel ? '  ·  ' : ''}
                                                {/* {ageLabel && <span className="rc-card-pet-age">{ageLabel}</span>} */}
                                                {weightLabel ? (
                                                    <span className="rc-card-pet-weight"><Weight size={12} /> {weightLabel}</span>
                                                ) : null}
                                            </span>
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                </div>
            )}

            {showFooter && (
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
                        {paymentButtonLabel}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReceivedCard;
