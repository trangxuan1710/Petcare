import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import ReceptionistLayout from '../../layouts/ReceptionistLayout';
import { RECEPTIONIST_PATHS } from '../../routes/receptionistPaths';
import notificationService from '../../api/notificationService';
import { toTitleCase } from '../../utils/textFormat';
import './Notifications.css';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            setIsLoading(true);
            setErrorText('');
            try {
                const response = await notificationService.listReceptionistNotifications();
                if (!isMounted) return;
                setNotifications(response?.data || []);
            } catch {
                if (!isMounted) return;
                setNotifications([]);
                setErrorText('Không thể tải thông báo thanh toán. Vui lòng thử lại.');
                showToast('error', 'Tải thông báo thất bại.');
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
    }, [reloadKey]);

    const handleRetry = () => {
        setReloadKey((prev) => prev + 1);
        showToast('success', 'Đang tải lại thông báo...');
    };

    const handleOpenPayment = (item) => {
        navigate(RECEPTIONIST_PATHS.PAYMENT, {
            state: {
                receptionId: item?.receptionId,
                customerName: item?.customerName,
            },
        });
    };

    return (
        <ReceptionistLayout>
        <div className="rnotif-page">
            <header className="rnotif-header">
                <h1 className="rnotif-title">Thông báo</h1>
            </header>

            <div className="rnotif-list">
                {isLoading && (
                    <div className="rnotif-skeleton-list" aria-hidden="true">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="rnotif-skeleton-card">
                                <div className="rnotif-skeleton-line rnotif-skeleton-line-lg"></div>
                                <div className="rnotif-skeleton-line"></div>
                                <div className="rnotif-skeleton-line rnotif-skeleton-line-sm"></div>
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && errorText && (
                    <div className="rnotif-error-row">
                        <p className="rnotif-time">{errorText}</p>
                        <button type="button" className="rnotif-retry-btn" onClick={handleRetry}>Thử lại</button>
                    </div>
                )}
                {!isLoading && !errorText && notifications.length === 0 && <p className="rnotif-time">Không có thông báo thanh toán mới.</p>}
                {notifications.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className="rnotif-card"
                        onClick={() => handleOpenPayment(item)}
                    >
                        <div className="rnotif-icon-wrap">
                            <Bell size={18} color="#24C7A9" fill="#24C7A9" />
                        </div>
                        <div className="rnotif-body">
                            <div className="rnotif-head-row">
                                <h3 className="rnotif-card-title">{item.title}</h3>
                                <span className="rnotif-time">{item.time}</span>
                            </div>
                            <p className="rnotif-desc">
                                Phiếu tiếp đón <strong>{item.orderCode}</strong> của khách hàng <strong>{toTitleCase(item.customerName) || item.customerName}</strong> đã hoàn thành. Hãy tiến hành thanh toán ngay!
                            </p>
                        </div>
                    </button>
                ))}

                {toast && (
                    <div className={`rnotif-toast rnotif-toast-${toast.type}`} role="status" aria-live="polite">
                        {toast.message}
                    </div>
                )}
            </div>
        </div>
        </ReceptionistLayout>
    );
};

export default Notifications;
