import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleArrowRight, Info } from 'lucide-react';
import './Home.css';
import StatCard from '../../components/doctor/StatCard';

const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Workspace');

    // Mốc dữ liệu thống kê
    const statsData = [
        {
            id: 1,
            title: 'Ca cấp cứu',
            count: 7,
            unit: 'ca',
            variant: 'danger'
        },
        {
            id: 2,
            title: 'Ca khám cần thực hiện',
            count: 28,
            unit: 'ca',
            variant: 'success'
        },
        {
            id: 3,
            title: 'Ca khám cần kết luận',
            count: 11,
            unit: 'đơn',
            variant: 'success'
        },
        {
            id: 4,
            title: 'Ca khám đang chủ trì',
            count: 115,
            unit: 'đơn',
            variant: 'success'
        }
    ];

    // Icon arrow chung cho StatCard
    const TargetIcon = () => (
        <CircleArrowRight size={24} color="currentColor" strokeWidth={1.5} />
    );

    return (
        <div className="home-container">
            {/* Header / Profile section */}
            <div className="home-header">
                <div className="home-profile">
                    <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="Doctor Avatar"
                        className="home-avatar"
                    />
                    <div className="home-greeting">
                        <span className="greeting-text">Xin chào</span>
                        <span className="doctor-name">Bác sĩ Huy Đức</span>
                    </div>
                </div>
                <div className="home-info-icon">
                    <Info size={24} color="currentColor" strokeWidth={2} />
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
                    <div className="home-info-icon">
                        <Info size={20} color="currentColor" strokeWidth={2} />
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
                            count={stat.count}
                            unit={stat.unit}
                            variant={stat.variant}
                            icon={<TargetIcon />}
                            onClick={() => navigate('/doctors/tickets')}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
