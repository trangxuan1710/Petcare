import React, { useState } from 'react';
import './StaffStatusTabs.css';

const defaultTabs = [
    { key: 'da', label: 'Đã tiếp đón', count: 10 },
    { key: 'cho', label: 'Chờ thanh toán', count: 3 },
    { key: 'hoanthanh', label: 'Đã hoàn thành', count: 16 },
    { key: 'all', label: 'Tất cả', count: 16 },
];

const StaffStatusTabs = ({ tabs = defaultTabs, onChange }) => {
    const [active, setActive] = useState(tabs[0]?.key || 'cho');
    const [pressed, setPressed] = useState(null);

    const handleSelect = (key) => {
        setActive(key);
        setPressed(key);
        window.setTimeout(() => setPressed(null), 140);
        if (onChange) onChange(key);
    };

    return (
        <div className="staff-tabs">
            <div className="staff-tabs-track">
                {tabs.map((tab) => {
                    const isActive = active === tab.key;
                    const isPressed = pressed === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            className={`staff-tab ${isActive ? 'active' : ''} ${isPressed ? 'is-pressed' : ''}`}
                            onClick={() => handleSelect(tab.key)}
                        >
                            <span className="staff-tab-label">{tab.label}</span>
                            <span className="staff-tab-count">{tab.count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StaffStatusTabs;
