import React from 'react';
import './StaffCompletedReceptionCard.css';
import { Phone, Mars, Venus, Cake, Weight } from 'lucide-react';

const StaffCompletedReceptionCard = ({
    customer = "Nguyễn Anh Đức",
    phone = "0908264671",
    code = "2141441",
    createdAt = "10:03 - 20/03/2026",
    statusText = "Đã thanh toán",
    pets = [
        { name: "Kuro", breed: "Chó Poodle", gender: "male", age: "3 Tuổi", weight: "4.5kg" }
    ],
    totalAmount = "2.650.000đ"
}) => {
    return (
        <div className="completed-reception-card">
            <div className="card-header">
                <div className="header-left">
                    <h2 className="customer-name">{customer}</h2>
                    <div className="phone-row">
                        <Phone size={18} className="phone-icon" />
                        <span className="phone-number">{phone}</span>
                    </div>
                </div>
                <div className="header-right">
                    <span className="order-code">#{code}</span>
                    <span className="status-label">{statusText}</span>
                </div>
            </div>

            <p className="admission-time">Tiếp đón lúc {createdAt}</p>

            <div className="divider" />

            <div className="pet-info-box">
                {pets.map((pet, index) => (
                    <div key={index} className="pet-tag">
                        <span className="pet-name">{pet.name}</span>
                        <span className="pet-breed">{pet.breed}</span>
                        {pet.gender === 'male' ? (
                            <Mars size={18} className="gender-icon male" />
                        ) : (
                            <Venus size={18} className="gender-icon female" />
                        )}
                        <div className="pet-detail-item">
                            <Cake size={16} className="detail-icon" />
                            <span>{pet.age}</span>
                        </div>
                        <div className="pet-detail-item">
                            <Weight size={16} className="detail-icon" />
                            <span>{pet.weight}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="divider" />

            <div className="card-footer">
                <div className="amount-group">
                    <span className="total-amount">{totalAmount}</span>
                </div>
            </div>
        </div>
    );
};

export default StaffCompletedReceptionCard;
