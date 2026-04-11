import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import TechTopHeader from '../../components/techStaffs/TechTopHeader';
import TechStatusTabs from '../../components/techStaffs/TechStatusTabs';
import TechTaskCard from '../../components/techStaffs/TechTaskCard';
import { TECH_PATHS, buildTechRecordResultPath } from '../../routes/techPaths';
import techService from '../../api/techService';
import './Home.css';

const STATUS_TO_API = {
    queued: 'WAITING_EXECUTION',
    processing: 'IN_PROGRESS',
    done: 'COMPLETED',
};

const TechHome = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('queued');
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ waitingCount: 0, inProgressCount: 0, completedCount: 0, totalCount: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [actionTaskId, setActionTaskId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchTasks = async () => {
            setIsLoading(true);
            setLoadError('');

            try {
                const status = activeTab === 'all' ? undefined : STATUS_TO_API[activeTab];
                const response = await techService.getMyAssignedServices({
                    status,
                    keyword: searchTerm.trim() || undefined,
                });

                if (!isMounted) return;
                setTasks(response?.data?.items || []);
                setStats({
                    waitingCount: Number(response?.data?.waitingCount || 0),
                    inProgressCount: Number(response?.data?.inProgressCount || 0),
                    completedCount: Number(response?.data?.completedCount || 0),
                    totalCount: Number(response?.data?.totalCount || 0),
                });
            } catch {
                if (!isMounted) return;
                setTasks([]);
                setLoadError('Không thể tải danh sách công việc.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchTasks();

        return () => {
            isMounted = false;
        };
    }, [activeTab, searchTerm]);

    const tabs = useMemo(() => {
        return [
            { key: 'queued', label: 'Chờ thực hiện', count: stats.waitingCount },
            { key: 'processing', label: 'Đang thực hiện', count: stats.inProgressCount },
            { key: 'done', label: 'Đã hoàn thành', count: stats.completedCount },
            { key: 'all', label: 'Tất cả', count: stats.totalCount },
        ];
    }, [stats]);

    const actionMode = useMemo(() => {
        if (activeTab === 'queued') return 'start';
        if (activeTab === 'processing') return 'record';
        return null;
    }, [activeTab]);

    const handleOpenTask = (selectedTask) => {
        navigate(buildTechRecordResultPath(selectedTask.id));
    };

    const handleTaskAction = async (selectedTask) => {
        if (!selectedTask?.id) {
            return;
        }

        if (actionMode === 'start') {
            try {
                setActionTaskId(selectedTask.id);
                await techService.startMyAssignedService(selectedTask.id);
            } catch {
                setLoadError('Không thể bắt đầu công việc, vui lòng thử lại.');
                return;
            } finally {
                setActionTaskId(null);
            }
        }

        navigate(buildTechRecordResultPath(selectedTask.id));
    };

    return (
        <div className="tech-home-page">
            <div className="tech-home-shell">
                <div className="tech-home-header-area">
                    <TechTopHeader
                        title="Xin chào"
                        name="Kỹ thuật viên Quốc Đạt"
                        onBellClick={() => navigate(TECH_PATHS.HOME)}
                    />
                </div>

                <div className="tech-search-box">
                    <Search size={18} color="#14a085" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search"
                    />
                </div>

                <TechStatusTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                <section className="tech-task-list">
                    {loadError && <div className="tech-empty-state">{loadError}</div>}
                    {!loadError && isLoading && <div className="tech-empty-state">Đang tải danh sách công việc...</div>}
                    {!loadError && !isLoading && tasks.map((task) => (
                        <TechTaskCard
                            key={task.id}
                            task={task}
                            onOpen={handleOpenTask}
                            actionMode={actionMode}
                            onAction={handleTaskAction}
                            isActionLoading={actionTaskId === task.id}
                        />
                    ))}
                    {!loadError && !isLoading && tasks.length === 0 && (
                        <div className="tech-empty-state">Không có công việc phù hợp bộ lọc.</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default TechHome;
