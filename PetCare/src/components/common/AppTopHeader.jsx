import React, { useMemo, useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';
import './AppTopHeader.css';

const buildFallbackAvatar = (name) => {
    const initials = String(name || 'ND')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ND';

    return `https://placehold.co/80x80/e0f2ef/209D80?text=${initials}`;
};

const AppTopHeader = ({
    profile,
    greeting = 'Xin chào',
    notificationCount = 0,
    onNotificationClick,
    onLogout,
    isLogoutDisabled = false,
    showLogout = true,
    showNotification = true,
}) => {
    const navigate = useNavigate();
    const [isInternalLoggingOut, setIsInternalLoggingOut] = useState(false);

    const displayName = useMemo(() => {
        const role = String(profile?.roleLabel || '').trim();
        const name = String(profile?.displayName || 'Người dùng').trim();
        return role ? `${role} ${name}` : name;
    }, [profile?.displayName, profile?.roleLabel]);

    const avatarUrl = profile?.avatarUrl || buildFallbackAvatar(displayName);

    const handleLogout = async () => {
        if (isLogoutDisabled || isInternalLoggingOut) return;

        if (typeof onLogout === 'function') {
            onLogout();
            return;
        }

        setIsInternalLoggingOut(true);
        try {
            await authService.logout();
        } catch {
            // Keep navigation fallback below even if API call fails.
        } finally {
            setIsInternalLoggingOut(false);
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="app-top-header-area">
            <div className="app-top-header">
                <div className="app-top-header-user">
                    <div className="app-top-header-avatar">
                        <img src={avatarUrl} alt={displayName} />
                    </div>
                    <div className="app-top-header-texts">
                        <p className="app-top-header-greeting">{greeting}</p>
                        <h1 className="app-top-header-name">{displayName}</h1>
                    </div>
                </div>

                <div className="app-top-header-actions">
                    {showNotification && (
                        <button
                            className="app-top-header-btn"
                            type="button"
                            aria-label="Thông báo"
                            onClick={onNotificationClick}
                        >
                            <span className="app-top-header-bell-wrap">
                                <Bell size={20} color="#1a1a1a" strokeWidth={2} />
                                {notificationCount > 0 && (
                                    <span className="app-top-header-bell-dot" aria-hidden="true" />
                                )}
                            </span>
                            {notificationCount > 0 && (
                                <span className="app-top-header-bell-badge">
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </span>
                            )}
                        </button>
                    )}

                    {showLogout && (
                        <button
                            className="app-top-header-btn app-top-header-btn-logout"
                            type="button"
                            aria-label="Đăng xuất"
                            onClick={handleLogout}
                            disabled={isLogoutDisabled || isInternalLoggingOut}
                        >
                            <LogOut size={20} color="#b91c1c" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppTopHeader;
