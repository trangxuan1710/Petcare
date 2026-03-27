import React from 'react';
import { Phone, PlusCircle } from 'lucide-react';
import './ReceptionCard.css';

const ReceptionCard = ({ name, phone, avatar, onAdd }) => {
    return (
        <div className="reception-card">
            <div className="reception-card-avatar">
                {avatar ? (
                    <img src={avatar} alt={name} />
                ) : (
                    <div className="reception-card-avatar-placeholder">
                        {name?.charAt(0)}
                    </div>
                )}
            </div>
            <div className="reception-card-info">
                <h3 className="reception-card-name">{name}</h3>
                <div className="reception-card-phone">
                    <Phone size={14} color="#209D80" />
                    <span>{phone}</span>
                </div>
            </div>
            <button className="reception-card-add-btn" onClick={onAdd}>
                <PlusCircle size={32} color="#209D80" />
            </button>
        </div>
    );
};

export default ReceptionCard;
