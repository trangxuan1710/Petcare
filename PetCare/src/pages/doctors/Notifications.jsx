import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft } from 'lucide-react';
import DoctorLayout from '../../layouts/DoctorLayout';
import './Notifications.css';
import notificationService from '../../api/notificationService';

const Notifications = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = location.state?.returnPath;
    const returnState = location.state?.returnState;
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            setIsLoading(true);
            setErrorText('');

            try {
                const response = await notificationService.listDoctorNotifications();
                if (!isMounted) return;
                setNotifications(response?.data || []);
            } catch {
                if (!isMounted) return;
                setNotifications([]);
                setErrorText('Không thể tải thông báo. Vui lòng thử lại.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchNotifications();

        return () => {
            isMounted = false;
        };
    }, []);

    const goBack = () => {
        if (returnPath) {
            navigate(returnPath, { replace: true, state: returnState });
            return;
        }
        navigate('/doctors/tickets', { replace: true });
    };

    const handleOpenNotification = async (notif) => {
        try {
            if (!notif?.isRead) {
                await notificationService.markAsRead(notif.id);
                setNotifications((prev) => prev.map((item) => (
                    item.id === notif.id
                        ? { ...item, isRead: true }
                        : item
                )));
            }
        } catch {
            // Keep UI responsive
        }

        // 1. Prioritize direct ID navigation to Ticket Details
        if (notif?.receptionId) {
            navigate(`/doctors/tickets/${notif.receptionId}`, {
                state: {
                    returnPath: '/doctors/notifications',
                    returnState: {
                        ...(location.state || {}),
                    },
                },
            });
            return;
        }

        // 2. Fallback to mapped link if available
        if (notif?.link) {
            navigate(notif.link);
            return;
        }
    };

    return (
        <DoctorLayout>
            <div className="notifications-page">
                <div className="notif-page-toolbar">
                    <button className="notif-back-btn" type="button" onClick={goBack} aria-label="Quay lai trang truoc">
                        <ChevronLeft size={22} color="#1f2937" />
                    </button>
                    <h1 className="notif-page-title">Thông báo</h1>
                </div>

                <div className="notif-list">
                    {isLoading && <p className="notif-time">Đang tải thông báo...</p>}
                    {!isLoading && errorText && <p className="notif-time">{errorText}</p>}
                    {!isLoading && !errorText && notifications.length === 0 && (
                        <p className="notif-time">Hiện chưa có thông báo.</p>
                    )}
                    {!isLoading && !errorText && notifications.map(notif => (
                        <button
                            key={notif.id}
                            type="button"
                            className={`notif-card ${!notif.isRead ? 'notif-card-unread' : ''}`}
                            onClick={() => handleOpenNotification(notif)}
                        >
                            <div className="notif-icon-wrapper">
                                <Bell size={18} color="#24C7A9" fill="#24C7A9" />
                            </div>
                            <div className="notif-body">
                                <div className="notif-header-row">
                                    <h3 className="notif-title">{notif.title}</h3>
                                    <span className="notif-time">{notif.time || 'Vừa xong'}</span>
                                </div>
                                <p className="notif-desc">
                                    {notif.message || 'Bạn có thông báo mới.'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </DoctorLayout>
    );
};

export default Notifications;
