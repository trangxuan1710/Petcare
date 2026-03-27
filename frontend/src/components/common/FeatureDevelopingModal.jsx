import React from 'react';
import './FeatureDevelopingModal.css';

const FeatureDevelopingModal = ({ open, onClose, message = 'Tính năng đang phát triển' }) => {
    if (!open) return null;

    return (
        <div className="fdm-overlay" onClick={onClose}>
            <div className="fdm-modal" onClick={(event) => event.stopPropagation()}>
                <div className="fdm-icon-wrap">
                    <div className="fdm-icon">!</div>
                </div>
                <div className="fdm-message">{message}</div>
                <button className="fdm-btn" onClick={onClose}>Đã hiểu</button>
            </div>
        </div>
    );
};

export default FeatureDevelopingModal;
