import React from 'react';
import './StaffTopHeader.css';
import { ChevronLeft } from 'lucide-react';
import { Button } from 'semantic-ui-react';

const StaffTopHeader = ({ title, onBack, rightNode = null, size = 'large' }) => {
    return (
        <header className={`staff-top-header ${size === 'normal' ? 'is-normal' : ''}`}>
            <div className="staff-top-header-main">
                <Button
                    type="button"
                    icon
                    className="staff-back-btn"
                    onClick={onBack}
                    aria-label="Quay lại"
                >
                    <ChevronLeft size={24} />
                </Button>
                <h1>{title}</h1>
            </div>
            {rightNode ? <div className="staff-top-header-right">{rightNode}</div> : null}
        </header>
    );
};

export default StaffTopHeader;
