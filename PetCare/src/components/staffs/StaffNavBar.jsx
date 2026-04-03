import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './StaffNavBar.css';
import { FileCheck, Wallet, CirclePlus, Bell, Menu } from 'lucide-react';

const navItems = [
    { id: 'today', label: 'Đơn hôm nay', icon: FileCheck },
    { id: 'payment', label: 'Thanh toán', icon: Wallet },
    { id: 'create', label: 'Tạo đơn', icon: CirclePlus },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'more', label: 'Khác', icon: Menu }
];

const StaffNavBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [active, setActive] = useState(
        pathname.includes('/receipt-list') ? 'payment' : pathname.includes('/notifications') ? 'notifications' : pathname.includes('/payment') ? 'more' : 'today'
    );
    const [pressed, setPressed] = useState(null);

    const handleClick = (id) => {
        setActive(id);
        setPressed(id);
        window.setTimeout(() => setPressed(null), 140);

        const mapPath = {
            today: '/staffs/receptions',
            payment: '/staffs/payment',
            create: '/staffs/receptions',
            notifications: '/staffs/notifications',
            more: '/staffs/payment'
        };

        if (mapPath[id]) {
            navigate(mapPath[id]);
        }
    };

    return (
        <div className="staff-nav">
            <div className="staff-nav-content">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    const isPressed = pressed === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`staff-nav-item ${isActive ? 'active' : ''} ${isPressed ? 'is-pressed' : ''}`}
                            onClick={() => handleClick(item.id)}
                            type="button"
                        >
                            <Icon size={26} strokeWidth={isActive ? 2 : 1.5} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StaffNavBar;
