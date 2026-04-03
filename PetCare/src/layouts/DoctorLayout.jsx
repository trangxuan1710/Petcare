import React from 'react';
import './DoctorLayout.css';

const DoctorLayout = ({ children }) => {
    return (
        <div className="doctor-layout-container">
            <div className="doctor-main-content">
                {/* Render nội dung của từng trang (children). Nếu sau này bạn dùng react-router-dom, có thể thay đổi thành <Outlet /> */}
                {children}
            </div>
        </div>
    );
};

export default DoctorLayout;
