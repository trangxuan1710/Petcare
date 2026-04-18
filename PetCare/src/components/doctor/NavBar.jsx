import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { ClipboardList, Package, Scan, Bell, Menu } from 'lucide-react';
import { useNotificationSSE } from '../../hooks/useNotificationSSE.jsx';

const NavBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { unreadCount, clearUnread } = useNotificationSSE();
    const activeTab = pathname.includes('/medicine-selector')
        ? 'kho'
        : pathname.includes('/notifications')
            ? 'thongbao'
            : pathname.includes('/home')
                ? 'khac'
                : 'phieu';

    const go = (path) => {
        navigate(path);
    };

    return (
        <div className="bottom-nav">
            <div className="nav-content">
                <div
                    className={`nav-item ${activeTab === 'phieu' ? 'active' : ''}`}
                    onClick={() => go('/doctors/tickets')}
                >
                    <ClipboardList size={28} strokeWidth={1.8} />
                    <span>Phiếu</span>
                </div>

                <div
                    className={`nav-item ${activeTab === 'kho' ? 'active' : ''}`}
                    onClick={() => go('/doctors/medicine-selector')}
                >
                    <Package size={28} strokeWidth={1.8} />
                    <span>Kho</span>
                </div>

                <div className="nav-fab-placeholder">
                    <button className="nav-fab" onClick={() => navigate('/doctors/dashboard')}>
                        <Scan size={28} color="#fff" strokeWidth={2} />
                    </button>
                </div>

                <div
                    className={`nav-item ${activeTab === 'thongbao' ? 'active' : ''}`}
                    onClick={() => { clearUnread(); go('/doctors/notifications'); }}
                >
                    <div className="nav-bell-icon">
                        <Bell size={28} strokeWidth={1.8} />
                        {unreadCount > 0 && <span className="nav-bell-dot" aria-hidden="true" />}
                    </div>
                    {unreadCount > 0 && (
                        <span className="nav-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                    <span>Thông báo</span>
                </div>

                <div
                    className={`nav-item ${activeTab === 'khac' ? 'active' : ''}`}
                    onClick={() => go('/doctors/home')}
                >
                    <Menu size={28} strokeWidth={1.8} />
                    <span>Khác</span>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
