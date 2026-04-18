import React from 'react';
import { useNavigate } from 'react-router-dom';
import useHeaderProfile from '../../hooks/useHeaderProfile';
import { useNotificationSSE } from '../../hooks/useNotificationSSE.jsx';
import AppTopHeader from '../common/AppTopHeader';

import { TECH_PATHS } from '../../routes/techPaths';

const TechTopHeader = ({ title = 'Danh sách công việc' }) => {
    const navigate = useNavigate();
    const { profile } = useHeaderProfile({
        fallbackName: 'Kỹ thuật viên',
        fallbackRoleLabel: 'KTV',
    });
    const { unreadCount, clearUnread } = useNotificationSSE();

    const handleBellClick = () => {
        clearUnread();
        navigate(TECH_PATHS.NOTIFICATIONS);
    };

    return (
        <AppTopHeader
            profile={profile}
            greeting={title}
            notificationCount={unreadCount}
            onNotificationClick={handleBellClick}
        />
    );
};

export default TechTopHeader;
