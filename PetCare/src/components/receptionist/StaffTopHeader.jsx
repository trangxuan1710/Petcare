import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './StaffTopHeader.css';

const StaffTopHeader = ({ size = 'large' }) => {
    return (
        <header className={`staff-top-header ${size === 'normal' ? 'is-normal' : ''}`}>
            <div className="staff-top-header-main">
                {/* <button
                    type="button"
                    className="staff-back-btn"
                    onClick={onBack}
                    aria-label="Quay lại"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1>{title}</h1> */}
            </div>
            {/* {rightNode ? <div className="staff-top-header-right">{rightNode}</div> : null} */}
        </header>
    );
};

export default StaffTopHeader;
