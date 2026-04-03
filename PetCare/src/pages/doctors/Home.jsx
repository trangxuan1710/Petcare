import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleArrowRight, Bell, LogOut } from 'lucide-react';
import './Home.css';
import StatCard from '../../components/doctor/StatCard';
import DoctorLayout from '../../layouts/DoctorLayout';
import dashboardService from '../../api/dashboardService';
import authService from '../../api/authService';
import useHeaderProfile from '../../hooks/useHeaderProfile';

const Home = () => {
    const navigate = useNavigate();
    const { profile } = useHeaderProfile({
        fallbackName: 'Bác sĩ',
        fallbackRoleLabel: 'Bác sĩ',
    });
    const [activeTab, setActiveTab] = useState('Workspace');
    const [summary, setSummary] = useState({});
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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
            variant: 'danger'
        },
        {
            id: 2,
            title: 'Ca khám cần thực hiện',
            count: readMetric(['pendingExaminationCases', 'pendingCases', 'waitingExams', 'pending']),
            unit: 'ca',
            variant: 'success'
        },
        {
            id: 3,
            title: 'Ca khám cần kết luận',
            count: readMetric(['waitingConclusionCases', 'pendingConclusion', 'needConclusion']),
            unit: 'đơn',
            variant: 'success'
        },
        {
            id: 4,
            title: 'Ca khám đang chủ trì',
            count: readMetric(['waitingTreatmentCases', 'inProgressCases', 'inProgress', 'activeCases']),
            unit: 'đơn',
            variant: 'success'
        }
    ], [readMetric]);

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
                <div className="home-header">
                    <div className="home-profile">
                        <img
                            src={profile.avatarUrl}
                            alt={profile.displayName}
                            className="home-avatar"
                        />
                        <div className="home-greeting">
                            <span className="greeting-text">Xin chào</span>
                            <span className="doctor-name">{profile.roleLabel} {profile.displayName}</span>
                        </div>
                    </div>
                    <div className="home-quick-actions">
                        <button className="home-quick-btn" type="button" onClick={() => navigate('/doctors/notifications')} aria-label="Thong bao">
                            <Bell size={18} />
                        </button>
                        <button
                            className="home-quick-btn home-quick-btn-logout"
                            type="button"
                            onClick={handleLogout}
                            aria-label="Dang xuat"
                            disabled={isLoggingOut}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

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
                                onClick={() => navigate('/doctors/tickets')}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
};

export default Home;
