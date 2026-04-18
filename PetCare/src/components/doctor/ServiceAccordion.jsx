import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ServiceAccordion = ({ title, defaultExpanded = true, children }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="so-accordion">
            <div className="so-accordion-header" onClick={() => setIsExpanded((prev) => !prev)}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{title}</h3>
                {isExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
            </div>
            {isExpanded && <div className="so-accordion-content">{children}</div>}
        </div>
    );
};

export default ServiceAccordion;
