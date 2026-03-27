import React from 'react';
import { Info } from 'lucide-react';
import './TechTaskCard.css';

const statusColor = {
    queued: '#f59e0b',
    processing: '#0ea5e9',
    done: '#14a085'
};

const statusLabel = {
    queued: 'Cho thuc hien',
    processing: 'Dang thuc hien',
    done: 'Da hoan thanh'
};

const TechTaskCard = ({ task, onOpen }) => {
    return (
        <article className="tech-task-card" onClick={() => onOpen && onOpen(task)}>
            <div className="tech-task-head">
                <div>
                    <h3>{task.title}</h3>
                </div>
                <span className="tech-task-status" style={{ color: statusColor[task.status] || '#6b7280' }}>
                    {statusLabel[task.status] || 'Khac'}
                </span>
            </div>

            <div className="tech-task-body-grid">
                <span>Nguoi chi dinh</span>
                <strong>{task.requester}</strong>

                <span>Thu cung</span>
                <strong className="tech-pet-info">
                    {task.petName}
                    <Info size={16} color="#14a085" />
                </strong>
            </div>
        </article>
    );
};

export default TechTaskCard;
