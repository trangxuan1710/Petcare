import React, { useMemo } from 'react';
import { ChevronLeft, Mars, Venus, Phone, ClipboardList, PawPrint } from 'lucide-react';
import { toTitleCase } from '../../utils/textFormat';
import './ReceivedDetailLayout.css';

const toPetKey = (pet) => String(pet?.id || pet?.name || '');

const ReceivedDetailLayout = ({ order, onBack, onSubmit }) => {
    const receptionRecord = order?.receptionRecord || null;

    const pets = useMemo(() => {
        const sourcePets = Array.isArray(order?.pets) ? order.pets.filter(Boolean) : [];
        if (sourcePets.length > 0) {
            return sourcePets;
        }

        if (!receptionRecord?.pet) {
            return [];
        }

        return [{
            id: receptionRecord.pet.id,
            name: receptionRecord.pet.name || 'Thú cưng',
            breed: receptionRecord.pet.breed || receptionRecord.pet.species || '--',
            gender: String(receptionRecord.pet.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
        }];
    }, [order?.pets, receptionRecord]);

    const examinedPetKey = String(
        receptionRecord?.pet?.id
            || receptionRecord?.petId
            || pets[0]?.id
            || pets[0]?.name
            || ''
    );

    const selectedPet = pets.find((pet) => toPetKey(pet) === examinedPetKey) || pets[0] || null;
    const isFemale = String(selectedPet?.gender || receptionRecord?.pet?.gender || '').toLowerCase() === 'female';

    return (
        <div className="rod-page">
                <div className="rod-header">
                    <button className="rod-back" type="button" onClick={onBack}>
                        <ChevronLeft size={22} />
                    </button>
                    <h3>Chi tiết tiếp đón</h3>
                </div>
            <div className='rod-content'>
                <div className="rod-summary">
                    <div>
                        <div className="rod-name">{toTitleCase(order?.customerName) || order?.customerName}</div>
                        <div className="rod-phone">
                            <Phone size={20} color="#209D80" />
                            <span>{order?.phone || '--'}</span>
                        </div>
                    </div>
                    {order?.totalAmount ? (
                        <div className="rod-amount">{order.totalAmount}</div>
                    ) : null}
                </div>

                <div className="rod-pet-chips" aria-label="Danh sách thú cưng">
                    {pets.map((pet) => {
                        const isActive = toPetKey(pet) === examinedPetKey;
                        return (
                            <button
                                key={toPetKey(pet)}
                                type="button"
                                className={`rod-pet-chip ${isActive ? 'active' : ''}`}
                                disabled
                            >
                                <PawPrint size={14} />
                                <span>{toTitleCase(pet?.name || 'Thú cưng') || 'Thú cưng'}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="rod-card">
                    <div className="rod-card-title">Thông tin tiếp đón</div>

                    <div className="rod-pet-bar">
                        <div className="rod-pet-meta">
                            <span className="rod-pet-name">{toTitleCase(selectedPet?.name || 'Thú cưng') || 'Thú cưng'}</span>
                            <span className="rod-pet-breed">{toTitleCase(selectedPet?.breed || '--') || '--'}</span>
                            {isFemale
                                ? <Venus size={12} color="#ec4899" />
                                : <Mars size={12} color="#3b82f6" />}
                        </div>
                        <span className="rod-pet-action" aria-hidden="true">
                            <ClipboardList size={13} color="#179b7d" />
                        </span>
                    </div>

                    <div className="rod-field">
                        <span className="rod-label">Cân nặng</span>
                        <span className="rod-value">{receptionRecord?.weight ? `${receptionRecord.weight} kg` : '--'}</span>
                    </div>
                    <div className="rod-field">
                        <span className="rod-label">Lý do khám</span>
                        <span className="rod-value">{receptionRecord?.examReason || '--'}</span>
                    </div>
                    {/* 'symptomDescription' removed; description is stored in examReason */}
                    <div className="rod-field">
                        <span className="rod-label">Hình thức khám</span>
                        <span className="rod-value">{receptionRecord?.examForm?.examType || '--'}</span>
                    </div>
                    <div className="rod-field">
                        <span className="rod-label">Bác sĩ phụ trách</span>
                        <span className="rod-value">{toTitleCase(receptionRecord?.doctor?.fullName || '--') || '--'}</span>
                    </div>
                    <div className="rod-field">
                        <span className="rod-label">Lưu ý</span>
                        <span className="rod-value rod-value-wrap">{receptionRecord?.note || '--'}</span>
                    </div>
                </div>


            <div className="rod-actions">
                <button className="rod-btn-cancel" type="button" onClick={onBack}>Hủy bỏ</button>
                <button className="rod-btn-submit" type="button" onClick={onSubmit}>Thanh toán</button>
            </div>
            </div>

        </div>
    );
};

export default ReceivedDetailLayout;
