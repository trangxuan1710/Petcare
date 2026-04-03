import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './TechRecordHeader.css';

const TechRecordHeader = ({ title = 'Ghi nhan ket qua', onBack }) => {
    return (
        <header className="tech-record-header">
            <button type="button" className="tech-record-back" onClick={onBack} aria-label="Quay lai">
                <ChevronLeft size={22} />
            </button>
            <h1>{title}</h1>
            <div className="tech-record-spacer" aria-hidden="true" />
        </header>
    );
};

export default TechRecordHeader;
