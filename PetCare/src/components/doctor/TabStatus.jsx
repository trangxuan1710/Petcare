import React from 'react';
import './TabStatus.css';

const tabsConfig = [
    { id: 'pending', label: 'Chờ thực hiện', count: 3 },
    { id: 'in_progress', label: 'Đang thực hiện', count: 16 },
    { id: 'completed', label: 'Hoàn thành', count: 14 },
    { id: 'all', label: 'Tất cả', count: 43 },
];

const TabStatus = ({ activeTab, onTabChange, tabs = tabsConfig }) => {
    
    return (
        <div className="tab-status-wrapper">
            <div className="tab-status-container">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <div
                            key={tab.id}
                            className={`tab-status-item ${isActive ? 'active' : ''}`}
                            onClick={() => onTabChange && onTabChange(tab.id)}
                        >
                            <span className="tab-label">{tab.label}</span>
                            <span className="tab-badge">{tab.count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TabStatus;
