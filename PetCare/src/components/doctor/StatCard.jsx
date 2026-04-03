import React from 'react';
import './StatCard.css';
import { ArrowRight } from 'lucide-react';

const StatCard = ({ title, count, unit, variant = 'success', icon, onClick }) => {
    return (
        <div
            className={`stat-card ${variant}`}
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
            <div className="stat-card-header">
                <span className="stat-card-title">{title}</span>
                <div className="stat-card-icon">
                    {icon || <ArrowRight size={24} strokeWidth={2} />}
                </div>
            </div>
            <div className="stat-card-content">
                <span className="stat-card-number">{count}</span>
                <span className="stat-card-unit">{unit}</span>
            </div>
        </div>
    );
};

export default StatCard;
