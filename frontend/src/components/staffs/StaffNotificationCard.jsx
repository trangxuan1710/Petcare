import React, { useState } from 'react';
import './StaffNotificationCard.css';
import { Bell } from 'lucide-react';

const StaffNotificationCard = ({ title, message, time }) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        setPressed(true);
        window.setTimeout(() => setPressed(false), 140);
    };

    return (
        <article
            className={`staff-noti-card ${pressed ? 'is-pressed' : ''}`}
            onClick={handlePress}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePress();
                }
            }}
        >
            <div className="staff-noti-icon-wrap">
                <Bell size={18} strokeWidth={2} />
            </div>

            <div className="staff-noti-content">
                <div className="staff-noti-head">
                    <h3>{title}</h3>
                    <span>{time}</span>
                </div>
                <p>{message}</p>
            </div>
        </article>
    );
};

export default StaffNotificationCard;
