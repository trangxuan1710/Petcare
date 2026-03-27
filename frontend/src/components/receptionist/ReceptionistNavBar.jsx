import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, CreditCard, PlusCircle, Bell, Menu } from 'lucide-react';
import './ReceptionistNavBar.css';

const ReceptionistNavBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [activeTab, setActiveTab] = useState(
        pathname.includes('/clinical-queue') ? 'thongbao' : pathname.includes('/new-reception') ? 'khac' : 'donhom'
    );

    const go = (tab, path) => {
        setActiveTab(tab);
        navigate(path);
    };

    return (
        <div className="rc-bottom-nav">
            <div className="rc-nav-content">
                <div
                    className={`rc-nav-item ${activeTab === 'donhom' ? 'active' : ''}`}
                    onClick={() => go('donhom', '/receptionists/today-orders')}
                >
                    <CalendarCheck size={26} strokeWidth={1.8} />
                    <span>Đơn hôm nay</span>
                </div>

                <div
                    className={`rc-nav-item ${activeTab === 'thanhtoan' ? 'active' : ''}`}
                    onClick={() => go('thanhtoan', '/receptionists/today-orders')}
                >
                    <CreditCard size={26} strokeWidth={1.8} />
                    <span>Thanh toán</span>
                </div>

                <div className="rc-nav-fab-placeholder">
                    <button className="rc-nav-fab" onClick={() => navigate('/receptionists/new-reception')}>
                        <PlusCircle size={28} color="#fff" strokeWidth={2} />
                    </button>
                    <span className="rc-nav-fab-label">Tạo đơn</span>
                </div>

                <div
                    className={`rc-nav-item ${activeTab === 'thongbao' ? 'active' : ''}`}
                    onClick={() => go('thongbao', '/receptionists/clinical-queue')}
                >
                    <Bell size={26} strokeWidth={1.8} />
                    <span>Thông báo</span>
                </div>

                <div
                    className={`rc-nav-item ${activeTab === 'khac' ? 'active' : ''}`}
                    onClick={() => go('khac', '/receptionists/new-reception')}
                >
                    <Menu size={26} strokeWidth={1.8} />
                    <span>Khác</span>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistNavBar;
