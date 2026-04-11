import { useEffect, useState } from 'react';
import userService from '../api/userService';
import { toTitleCase } from '../utils/textFormat';

const readLocalUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user_info') || '{}');
    } catch {
        return {};
    }
};

const getDisplayName = (user, fallbackName) => {
    return toTitleCase(user?.fullName || user?.name || fallbackName) || fallbackName;
};

const getRoleLabel = (role, fallbackRoleLabel) => {
    const normalizedRole = String(role || '').trim().toUpperCase();
    if (normalizedRole === 'DOCTOR') return 'Bác sĩ';
    if (normalizedRole === 'RECEPTIONIST') return 'Lễ tân';
    if (normalizedRole === 'TECHNICIAN') return 'Kỹ thuật viên';
    if (normalizedRole === 'STAFF') return 'Nhân viên';
    return fallbackRoleLabel;
};

const buildAvatarUrl = (name) => {
    const initials = String(name || 'ND')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ND';

    return `https://placehold.co/80x80/e0f2ef/209D80?text=${initials}`;
};

const useHeaderProfile = ({ fallbackName = 'Người dùng', fallbackRoleLabel = 'Nhân viên' } = {}) => {
    const [profile, setProfile] = useState(() => {
        const localUser = readLocalUser();
        const displayName = getDisplayName(localUser, fallbackName);

        return {
            id: localUser?.id,
            displayName,
            role: localUser?.role || '',
            roleLabel: getRoleLabel(localUser?.role, fallbackRoleLabel),
            avatarUrl: localUser?.avatarUrl || buildAvatarUrl(displayName),
        };
    });

    useEffect(() => {
        let isMounted = true;

        const hydrateProfile = async () => {
            const localUser = readLocalUser();
            const localDisplayName = getDisplayName(localUser, fallbackName);

            if (isMounted && localDisplayName) {
                setProfile((prev) => ({
                    ...prev,
                    id: localUser?.id || prev.id,
                    displayName: localDisplayName,
                    role: localUser?.role || prev.role,
                    roleLabel: getRoleLabel(localUser?.role || prev.role, fallbackRoleLabel),
                    avatarUrl: localUser?.avatarUrl || buildAvatarUrl(localDisplayName),
                }));
            }

            try {
                const response = await userService.getUsers();
                const remoteUser = response?.data || {};
                if (!isMounted || Object.keys(remoteUser).length === 0) return;

                const remoteDisplayName = getDisplayName(remoteUser, localDisplayName || fallbackName);
                setProfile((prev) => ({
                    ...prev,
                    id: remoteUser?.id || localUser?.id || prev.id,
                    displayName: remoteDisplayName,
                    role: remoteUser?.role || localUser?.role || prev.role,
                    roleLabel: getRoleLabel(remoteUser?.role || localUser?.role || prev.role, fallbackRoleLabel),
                    avatarUrl: remoteUser?.avatarUrl || localUser?.avatarUrl || buildAvatarUrl(remoteDisplayName),
                }));
            } catch {
                // Keep header data from local storage fallback.
            }
        };

        hydrateProfile();

        return () => {
            isMounted = false;
        };
    }, [fallbackName, fallbackRoleLabel]);

    return { profile };
};

export default useHeaderProfile;
