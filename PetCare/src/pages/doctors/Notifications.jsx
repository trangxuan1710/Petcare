import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft } from 'lucide-react';
import DoctorLayout from '../../layouts/DoctorLayout';
import './Notifications.css';
import notificationService from '../../api/notificationService';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchNotifications = async () => {
            const response = await notificationService.listDoctorNotifications();
            if (!isMounted) return;
            setNotifications(response?.data || []);
        };
        fetchNotifications();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleOpenNotification = async (notif) => {
        await notificationService.markAsRead(notif.id);
        navigate(`/doctors/tickets/${notif.receptionId || notif.id}`);
    };

    return (
        <DoctorLayout>
            <div className="notifications-page">
                <header className="notif-page-header">
                    <button className="notif-back-btn" type="button" onClick={() => navigate('/doctors/tickets')} aria-label="Quay lai danh sach phieu">
                        <ChevronLeft size={22} color="#1f2937" />
                    </button>
                    <h1 className="notif-page-title">Thông báo</h1>
                </header>

                <div className="notif-list">
                    {notifications.map(notif => (
                        <div
                            key={notif.id}
                            className="notif-card"
                            onClick={() => handleOpenNotification(notif)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleOpenNotification(notif);
                                }
                            }}
                        >
                            <div className="notif-icon-wrapper">
                                <Bell size={18} color="#24C7A9" fill="#24C7A9" />
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
