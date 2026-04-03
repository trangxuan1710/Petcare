import React from 'react';
import './TechStatusTabs.css';

const TechStatusTabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="tech-status-wrap">
            <div className="tech-status-track">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            className={`tech-status-item ${isActive ? 'active' : ''}`}
                            onClick={() => onChange && onChange(tab.key)}
                        >
                            <span className="tech-status-label">{tab.label}</span>
                            <span className="tech-status-count">{tab.count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TechStatusTabs;
