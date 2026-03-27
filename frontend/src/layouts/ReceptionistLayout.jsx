import React from 'react';
import ReceptionistNavBar from '../components/receptionist/ReceptionistNavBar';
import './ReceptionistLayout.css';

const ReceptionistLayout = ({ children }) => {
    return (
        <div className="receptionist-layout-container">
            <div className="receptionist-main-content">
                {children}
            </div>
            {/* <ReceptionistNavBar /> */}
        </div>
    );
};

export default ReceptionistLayout;
