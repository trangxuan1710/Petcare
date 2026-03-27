import React from 'react';
import './TechExecutionCard.css';

const TechExecutionCard = ({
    title,
    status,
    requester,
    operator,
    startTime,
    endTime
}) => {
    return (
        <section className="tech-exec-card">
            <div className="tech-exec-head">
                <h3>{title}</h3>
                <span>{status}</span>
            </div>
            <div className="tech-exec-row"><span>Nguoi chi dinh</span><b>{requester}</b></div>
            <div className="tech-exec-row"><span>Nguoi thuc hien</span><b>{operator}</b></div>
            <div className="tech-exec-row"><span>Thoi gian bat dau</span><b>{startTime}</b></div>
            <div className="tech-exec-row"><span>Thoi gian ket thuc</span><b className="tech-exec-mute">{endTime}</b></div>
        </section>
    );
};

export default TechExecutionCard;
