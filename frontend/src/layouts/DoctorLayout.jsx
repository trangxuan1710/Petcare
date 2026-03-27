import React from 'react';
import NavBar from '../components/doctor/NavBar';
import './DoctorLayout.css';

const DoctorLayout = ({ children }) => {
    return (
        <div className="doctor-layout-container">
            <div className="doctor-main-content">
                {/* Render nội dung của từng trang (children). Nếu sau này bạn dùng react-router-dom, có thể thay đổi thành <Outlet /> */}
                {children}
            </div>

            {/* NavBar dùng chung cho tất cả các trang của Bác sĩ */}
            {/* <NavBar /> */}
        </div>
    );
};

export default DoctorLayout;
