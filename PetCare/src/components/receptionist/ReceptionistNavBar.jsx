import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, CreditCard, PlusCircle, Bell, Menu } from 'lucide-react';
import { RECEPTIONIST_PATHS } from '../../routes/receptionistPaths';
import './ReceptionistNavBar.css';

const ReceptionistNavBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const activeTab =
        pathname.includes('/receptionists/payment')
            ? 'thanhtoan'
            : pathname.includes('/receptionists/notifications')
                ? 'thongbao'
                : pathname.includes('/receptionists/new-reception')
                    ? 'khac'
                    : 'donhom';

    const go = (path) => {
        navigate(path);
    };

    return (
        <div className="rc-bottom-nav">
            <div className="rc-nav-content">
                <div
                    className={`rc-nav-item ${activeTab === 'donhom' ? 'active' : ''}`}
                    onClick={() => go(RECEPTIONIST_PATHS.TODAY_ORDERS)}
                >
                    <CalendarCheck size={26} strokeWidth={1.8} />
                    <span>Đơn hôm nay</span>
                </div>

                <div
                    className={`rc-nav-item ${activeTab === 'thanhtoan' ? 'active' : ''}`}
                    onClick={() => go(RECEPTIONIST_PATHS.PAYMENT)}
                >
                    <CreditCard size={26} strokeWidth={1.8} />
                    <span>Thanh toán</span>
                </div>

                <div className="rc-nav-fab-placeholder">
                    <button className="rc-nav-fab" onClick={() => navigate(RECEPTIONIST_PATHS.NEW_RECEPTION)}>
                        <PlusCircle size={28} color="#fff" strokeWidth={2} />
                    </button>
                    <span className="rc-nav-fab-label">Tạo đơn</span>
                </div>

                <div
                    className={`rc-nav-item ${activeTab === 'thongbao' ? 'active' : ''}`}
                    onClick={() => go(RECEPTIONIST_PATHS.NOTIFICATIONS)}
                >
                    <Bell size={26} strokeWidth={1.8} />
                    <span>Thông báo</span>
                </div>

                <div
                    className={`rc-nav-item ${activeTab === 'khac' ? 'active' : ''}`}
                    onClick={() => go(RECEPTIONIST_PATHS.NEW_RECEPTION)}
                >
                    <Menu size={26} strokeWidth={1.8} />
                    <span>Khác</span>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistNavBar;
