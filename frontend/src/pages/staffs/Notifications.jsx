import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';
import StaffTopHeader from '../../components/staffs/StaffTopHeader';
import StaffNotificationCard from '../../components/staffs/StaffNotificationCard';

const notifications = [
    {
        id: 1,
        title: 'Thực hiện thanh toán!',
        time: '3 phút',
        orderCode: '25REC573275',
        customerName: 'Nguyễn Anh Đức'
    },
    {
        id: 2,
        title: 'Thực hiện thanh toán!',
        time: '3 phút',
        orderCode: '25REC573275',
        customerName: 'Nguyễn Anh Đức'
    },
    {
        id: 3,
        title: 'Thực hiện thanh toán!',
        time: '3 phút',
        orderCode: '25REC573275',
        customerName: 'Nguyễn Anh Đức'
    },
    {
        id: 4,
        title: 'Thực hiện thanh toán!',
        time: '3 phút',
        orderCode: '25REC573275',
        customerName: 'Nguyễn Anh Đức'
    }
];

const Notifications = () => {
    const navigate = useNavigate();

    return (
        <div className="staff-notifications-page">
            <div className="staff-notifications-shell">
                <StaffTopHeader title="Thông báo" onBack={() => navigate(-1)} />

                <section className="staff-notifications-list">
                    {notifications.map((item) => (
                        <StaffNotificationCard
                            key={item.id}
                            title={item.title}
                            time={item.time}
                            message={(
                                <>
                                    Phiếu tiếp đón <span className="accent">{item.orderCode}</span> của khách hàng{' '}
                                    <span className="accent">{item.customerName}</span> đã hoàn thành. Hãy tiến hành thanh toán ngay!
                                </>
                            )}
                        />
                    ))}
                </section>
            </div>
        </div>
    );
};

export default Notifications;
