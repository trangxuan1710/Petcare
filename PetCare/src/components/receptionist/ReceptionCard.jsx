import React from 'react';
import { Phone, PlusCircle, Weight } from 'lucide-react';
import { toTitleCase } from '../../utils/textFormat';
import './ReceptionCard.css';

const SPECIES_LABELS = {
    cho: 'Chó',
    meo: 'Mèo',
    khac: 'Khác',
};

const buildAgeLabel = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const birth = new Date(dateOfBirth);
    if (Number.isNaN(birth.getTime())) return '';

    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        years -= 1;
    }

    if (years >= 1) return `${years} Tuổi`;

    const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
    return `${months} Tháng`;
};

const normalizeWeightLabel = (weight) => {
    if (weight == null) return '';
    const raw = String(weight).trim();
    if (!raw) return '';
    return /kg$/i.test(raw) ? raw : `${raw}kg`;
};

const ReceptionCard = ({ name, phone, avatar, onAdd, onViewDetail, pets = [] }) => {
    const pet = pets[0] || null;
    const speciesLabel = String(
        pet?.speciesLabel
        || SPECIES_LABELS[String(pet?.species || '').toLowerCase()]
        || ''
    ).trim();
    const breedLabel = String(pet?.breed || '').trim();
    const typeLabel = toTitleCase(pet?.displayBreed || [speciesLabel, breedLabel].filter(Boolean).join(' ') || '');
    const ageLabel = buildAgeLabel(pet?.dateOfBirth);
    const weightLabel = normalizeWeightLabel(pet?.weight);
    const displayName = toTitleCase(name) || name;
    const displayPetName = toTitleCase(pet?.name || 'Chưa có tên');

    return (
        <div
            className={`reception-card ${onViewDetail ? 'reception-card-clickable' : ''}`}
            onClick={onViewDetail}
            role={onViewDetail ? 'button' : undefined}
            tabIndex={onViewDetail ? 0 : undefined}
            onKeyDown={
                onViewDetail
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onViewDetail();
                        }
                    }
                    : undefined
            }
        >
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
                <h3 className="reception-card-name">{displayName}</h3>
                <div className="reception-card-phone">
                    <Phone size={14} color="#fff" fill="#209D80"  />
                    <span>{phone}</span>
                </div>
                {pet && (
                    <div className="reception-card-pet">
                        <span className="reception-card-pet-name">{displayPetName}</span>
                        {typeLabel && <span className="reception-card-pet-meta">{typeLabel}</span>}
                        {ageLabel && <span className="reception-card-pet-stat">{ageLabel}</span>}
                        {weightLabel && (
                            <span className="reception-card-pet-stat reception-card-pet-weight">
                                <Weight size={12} /> {weightLabel}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <button
                className="reception-card-add-btn"
                onClick={(event) => {
                    event.stopPropagation();
                    onAdd?.();
                }}
            >
                <PlusCircle size={32} color="#209D80" />
            </button>
        </div>
    );
};

export default ReceptionCard;
