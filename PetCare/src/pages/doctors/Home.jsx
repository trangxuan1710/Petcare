import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleArrowRight } from 'lucide-react';
import './Home.css';
import StatCard from '../../components/doctor/StatCard';
import DoctorLayout from '../../layouts/DoctorLayout';
import dashboardService from '../../api/dashboardService';
import authService from '../../api/authService';
import useHeaderProfile from '../../hooks/useHeaderProfile';
import FeatureDevelopingModal from '../../components/common/FeatureDevelopingModal';
import { useNotificationSSE } from '../../hooks/useNotificationSSE.jsx';
import AppTopHeader from '../../components/common/AppTopHeader';

const Home = () => {
    const navigate = useNavigate();
    const { profile } = useHeaderProfile({
        fallbackName: 'Bác sĩ',
        fallbackRoleLabel: 'Bác sĩ',
    });
    const { unreadCount, clearUnread } = useNotificationSSE();
    const [activeTab, setActiveTab] = useState('Workspace');
    const [summary, setSummary] = useState({});
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchSummary = async () => {
            try {
                const response = await dashboardService.getDoctorSummary();
                if (!isMounted) return;
                setSummary(response?.data?.data || {});
            } catch {
                if (!isMounted) return;
                setSummary({});
            } finally {
                if (isMounted) {
                    setIsLoadingSummary(false);
                }
            }
        };

        fetchSummary();
        return () => {
            isMounted = false;
        };
    }, []);

    const readMetric = useCallback((keys, fallback = 0) => {
        for (const key of keys) {
            const value = summary?.[key];
            if (typeof value === 'number') return value;
        }
        return fallback;
    }, [summary]);

    const statsData = useMemo(() => [
        {
            id: 1,
            title: 'Ca cấp cứu',
            count: readMetric(['emergencyCases', 'emergency', 'urgentCases']),
            unit: 'ca',
            variant: 'danger',
            onClick: () => navigate('/doctors/tickets', {
                state: {
                    initialTab: 'pending',
                    emergencyOnly: true,
                },
            })
        },
        {
            id: 2,
            title: 'Ca khám cần thực hiện',
            count: readMetric(['pendingExaminationCases', 'pendingCases', 'waitingExams', 'pending']),
            unit: 'ca',
            variant: 'success',
            onClick: () => navigate('/doctors/tickets', { state: { initialTab: 'pending' } })
        },
        {
            id: 3,
            title: 'Ca khám cần kết luận',
            count: readMetric([
                'waitingConclusionCases',
                'inProgressCases',
                'inProgressCount',
                'waitingTreatmentCases',
            ]),
            unit: 'đơn',
            variant: 'success',
            onClick: () => navigate('/doctors/tickets', { state: { initialTab: 'in_progress' } })
        },
        {
            id: 4,
            title: 'Ca khám đang chủ trì',
            count: 0,
            unit: 'đơn',
            variant: 'success',
            onClick: () => setIsFeatureModalOpen(true)
        }
    ], [summary, navigate]);

    // Icon arrow chung cho StatCard
    const TargetIcon = () => (
        <CircleArrowRight size={24} color="currentColor" strokeWidth={1.5} />
    );

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await authService.logout();
        } catch {
            // Local session is still cleared in authService.logout finally block.
        } finally {
            setIsLoggingOut(false);
            navigate('/login', { replace: true });
        }
    };

    return (
        <DoctorLayout>
            <div className="home-container">
                {/* Header / Profile section */}
                <AppTopHeader
                    profile={profile}
                    notificationCount={unreadCount}
                    onNotificationClick={() => {
                        clearUnread();
                        navigate('/doctors/notifications');
                    }}
                    onLogout={handleLogout}
                    isLogoutDisabled={isLoggingOut}
                />

                {/* Tabs */}
                <div className="home-tabs">
                    <div
                        className={`home-tab ${activeTab === 'Workspace' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Workspace')}
                    >
                        Workspace
                    </div>
                    <div
                        className={`home-tab ${activeTab === 'Chi nhánh' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Chi nhánh')}
                    >
                        Chi nhánh
                    </div>
                </div>

                {/* Main Workspace content */}
                <div className="home-workspace">
                    <div className="workspace-header">
                        <div className="workspace-title-box">
                            <span className="workspace-title">Bệnh viện thú y PetHealth</span>
                            <span className="workspace-subtitle">Chi nhánh Âu Cơ</span>
                        </div>
                    </div>

                    <div className="workspace-status">
                        <div className="status-dot"></div>
                        <span className="status-text">Đang hoạt động</span>
                    </div>

                    <div className="divider"></div>

                    {/* Stats Grid Component */}
                    <div className="stats-grid">
                        {statsData.map(stat => (
                            <StatCard
                                key={stat.id}
                                title={stat.title}
                                count={isLoadingSummary ? '...' : stat.count}
                                unit={stat.unit}
                                variant={stat.variant}
                                icon={<TargetIcon />}
                                onClick={stat.onClick}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <FeatureDevelopingModal
                open={isFeatureModalOpen}
                onClose={() => setIsFeatureModalOpen(false)}
            />
        </DoctorLayout>
    );
};

export default Home;

