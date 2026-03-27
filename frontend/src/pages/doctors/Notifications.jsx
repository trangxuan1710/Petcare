import React from 'react';
import { Bell } from 'lucide-react';
import DoctorLayout from '../../layouts/DoctorLayout';
import './Notifications.css';

const Notifications = () => {
    const notifications = [
        {
            id: 1,
            title: 'Có phiếu khám mới cần thực hiện!',
            petName: 'Kuro',
            customerName: 'Nguyễn Anh Đức',
            message: 'đã được tiếp đón. Hãy bắt đầu khám ngay!',
            time: '3 phút',
        },
        {
            id: 2,
            title: 'Có phiếu khám mới cần thực hiện!',
            petName: 'Kuro',
            customerName: 'Nguyễn Anh Đức',
            message: 'đã được tiếp đón. Hãy bắt đầu khám ngay!',
            time: '3 phút',
        },
        {
            id: 3,
            title: 'Có phiếu khám mới cần thực hiện!',
            petName: 'Kuro',
            customerName: 'Nguyễn Anh Đức',
            message: 'đã được tiếp đón. Hãy bắt đầu khám ngay!',
            time: '3 phút',
        },
        {
            id: 4,
            title: 'Có phiếu khám mới cần thực hiện!',
            petName: 'Kuro',
            customerName: 'Nguyễn Anh Đức',
            message: 'đã được tiếp đón. Hãy bắt đầu khám ngay!',
            time: '3 phút',
        },
    ];

    return (
        <DoctorLayout>
            <div className="notifications-page">
                <h1 className="notif-page-title">Thông báo</h1>

                <div className="notif-list">
                    {notifications.map(notif => (
                        <div key={notif.id} className="notif-card">
                            <div className="notif-icon-wrapper">
                                <Bell size={18} color="#fff" fill="#fff" />
                            </div>
                            <div className="notif-body">
                                <div className="notif-header-row">
                                    <h3 className="notif-title">{notif.title}</h3>
                                    <span className="notif-time">{notif.time}</span>
                                </div>
                                <p className="notif-desc">
                                    Thú cưng <strong>{notif.petName}</strong> của khách hàng <strong>{notif.customerName}</strong> {notif.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DoctorLayout>
    );
};

export default Notifications;
