import React from 'react';
import { Bell } from 'lucide-react';
import './TechTopHeader.css';

const TechTopHeader = ({
    title = 'Danh sach cong viec',
    name = 'Ky thuat vien Quoc Dat',
    avatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    onBellClick
}) => {
    return (
        <header className="tech-top-header">
            <div className="tech-top-user">
                <div className="tech-top-avatar" aria-label="Ky thuat vien">
                    <img src={avatarUrl} alt={name} />
                </div>
                <div className="tech-top-texts">
                    <p>{title}</p>
                    <h1>{name}</h1>
                </div>
            </div>
            <button type="button" className="tech-top-bell" onClick={onBellClick} aria-label="Thong bao">
                <Bell size={24} strokeWidth={2} />
            </button>
        </header>
    );
};

export default TechTopHeader;
