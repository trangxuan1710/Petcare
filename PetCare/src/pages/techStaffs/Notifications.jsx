import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft } from 'lucide-react';
import notificationService from '../../api/notificationService';
import { TECH_PATHS } from '../../routes/techPaths';
import './Notifications.css';

const TechNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            setIsLoading(true);
            setErrorText('');

            try {
                const response = await notificationService.listTechNotifications();
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

    const handleOpenNotification = async (item) => {
        try {
            if (!item?.isRead) {
                await notificationService.markAsRead(item.id);
                setNotifications((prev) => prev.map((current) => (
                    current.id === item.id
                        ? { ...current, isRead: true }
                        : current
                )));
            }
        } catch {
            // Keep UI responsive even when mark-read fails.
        }

        if (item?.link) {
            navigate(item.link);
            return;
        }

        if (item?.receptionId) {
            navigate(`${TECH_PATHS.RECORD_RESULT}/${item.receptionId}`);
        }
    };

    return (
        <div className="tnotif-page">
            <div className="tnotif-toolbar">
                <button
                    className="tnotif-back-btn"
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label="Quay lại"
                >
                    <ChevronLeft size={22} color="#1f2937" />
                </button>
                <h1 className="tnotif-page-title">Thông báo</h1>
            </div>

            <div className="tnotif-list">
                {isLoading && <p className="tnotif-time">Đang tải thông báo...</p>}
                {!isLoading && errorText && <p className="tnotif-time">{errorText}</p>}
                {!isLoading && !errorText && notifications.length === 0 && (
                    <p className="tnotif-time">Hiện chưa có thông báo.</p>
                )}

                {!isLoading && !errorText && notifications.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`tnotif-card ${!item.isRead ? 'tnotif-card-unread' : ''}`}
                        onClick={() => handleOpenNotification(item)}
                    >
                        <div className="tnotif-icon-wrapper">
                            <Bell size={18} color="#24C7A9" fill="#24C7A9" />
                        </div>
                        <div className="tnotif-body">
                            <div className="tnotif-header-row">
                                <h3 className="tnotif-title">{item.title}</h3>
                                <span className="tnotif-time">{item.time || 'Vừa xong'}</span>
                            </div>
                            <p className="tnotif-desc">{item.message || 'Bạn có thông báo mới.'}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TechNotifications;
