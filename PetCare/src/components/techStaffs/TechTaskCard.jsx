import React from 'react';
import { Info } from 'lucide-react';
import './TechTaskCard.css';

const statusColor = {
    queued: '#f59e0b',
    processing: '#0ea5e9',
    done: '#14a085'
};

const statusLabel = {
    queued: 'Chờ thực hiện',
    processing: 'Đang thực hiện',
    done: 'Đã hoàn thành'
};

const actionLabelByMode = {
    start: 'Bắt đầu',
    record: 'Ghi nhận kết quả',
};

const TechTaskCard = ({ task, onOpen, actionMode = null, onAction, isActionLoading = false }) => {
    const actionLabel = actionLabelByMode[actionMode] || '';

    return (
        <article className="tech-task-card" onClick={() => onOpen && onOpen(task)}>
            <div className="tech-task-head">
                <div>
                    <h3>{task.title}</h3>
                </div>
                <span className="tech-task-status" style={{ color: statusColor[task.status] || '#6b7280' }}>
                    {statusLabel[task.status] || 'Khác'}
                </span>
            </div>

            <div className="tech-task-body-grid">
                <span>Người chỉ định</span>
                <strong>{task.requester}</strong>

                <span>Thú cưng</span>
                <strong className="tech-pet-info">
                    {task.petName}
                    <Info size={16} color="#14a085" />
                </strong>
            </div>

            {actionMode && (
                <div className="tech-task-action-wrap">
                    <button
                        type="button"
                        className="tech-task-action-btn"
                        disabled={isActionLoading}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (onAction) {
                                onAction(task);
                            }
                        }}
                    >
                        {isActionLoading ? 'Đang xử lý...' : actionLabel}
                    </button>
                </div>
            )}
        </article>
    );
};

export default TechTaskCard;
