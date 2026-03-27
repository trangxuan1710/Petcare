import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { ClipboardList, Package, Scan, Bell, Menu } from 'lucide-react';

const NavBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    // Default active tab is 'phieu'
    const [activeTab, setActiveTab] = useState(
        pathname.includes('/medicine-selector') ? 'kho' : pathname.includes('/notifications') ? 'thongbao' : pathname.includes('/home') ? 'khac' : 'phieu'
    );

    const go = (tab, path) => {
        setActiveTab(tab);
        navigate(path);
    };

    return (
        <div className="bottom-nav">
            <div className="nav-content">
                <div
                    className={`nav-item ${activeTab === 'phieu' ? 'active' : ''}`}
                    onClick={() => go('phieu', '/doctors/tickets')}
                >
                    <ClipboardList size={28} strokeWidth={1.8} />
                    <span>Phiếu</span>
                </div>

                <div
                    className={`nav-item ${activeTab === 'kho' ? 'active' : ''}`}
                    onClick={() => go('kho', '/doctors/medicine-selector')}
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
                    onClick={() => go('thongbao', '/doctors/notifications')}
                >
                    <Bell size={28} strokeWidth={1.8} />
                    <span>Thông báo</span>
                </div>

                <div
                    className={`nav-item ${activeTab === 'khac' ? 'active' : ''}`}
                    onClick={() => go('khac', '/doctors/home')}
                >
                    <Menu size={28} strokeWidth={1.8} />
                    <span>Khác</span>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
