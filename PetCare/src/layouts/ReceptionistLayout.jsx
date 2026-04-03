import React from 'react';
import './ReceptionistLayout.css';

const ReceptionistLayout = ({ children }) => {
    return (
        <div className="receptionist-layout-container">
            <div className="receptionist-main-content">
                {children}
            </div>
        </div>
    );
};

export default ReceptionistLayout;
