import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import TechTopHeader from '../../components/techStaffs/TechTopHeader';
import TechStatusTabs from '../../components/techStaffs/TechStatusTabs';
import TechTaskCard from '../../components/techStaffs/TechTaskCard';
import { TECH_PATHS, buildTechRecordResultPath } from '../../routes/techPaths';
import './Home.css';

const tasksSeed = [
    {
        id: 1,
        title: 'Xét nghiệm nước tiểu',
        requester: 'Nguyễn Văn An',
        petName: 'Kuro',
        status: 'processing'
    },
    {
        id: 2,
        title: 'Xét nghiệm nước tiểu',
        requester: 'Nguyễn Văn An',
        petName: 'Kuro',
        status: 'processing',
    },
    {
        id: 3,
        title: 'Xét nghiệm nước tiểu',
        requester: 'Nguyễn Văn An',
        petName: 'Kuro',
        status: 'processing'
    },
    {
        id: 4,
        title: 'Xét nghiệm nước tiểu',
        requester: 'Trần Thị Bích',
        petName: 'Milo',
        status: 'queued'
    },
    {
        id: 5,
        title: 'Siêu âm tim',
        requester: 'Lê Duy Tuấn',
        petName: 'Luna',
        status: 'queued'
    },
    {
        id: 6,
        title: 'Xét nghiệm máu',
        requester: 'Nguyễn Văn An',
        petName: 'Mochi',
        status: 'queued'
    },
    {
        id: 7,
        title: 'Xét nghiệm nước tiểu',
        requester: 'Nguyễn Văn An',
        petName: 'Kuro',
        status: 'done'
    },
    {
        id: 8,
        title: 'Xét nghiệm nước tiểu',
        requester: 'Nguyễn Văn An',
        petName: 'Kuro',
        status: 'done',
    },
    {
        id: 9,
        title: 'Xét nghiệm nước tiểu',
        requester: 'Nguyễn Văn An',
        petName: 'Kuro',
        status: 'done'
    }
];
const TechHome = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('done');
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = useMemo(() => {
        const count = (status) => tasksSeed.filter((task) => task.status === status).length;
        return [
            { key: 'queued', label: 'Chờ thực hiện', count: count('queued') },
            { key: 'processing', label: 'Đang thực hiện', count: count('processing') },
            { key: 'done', label: 'Đã hoàn thành', count: count('done') },
            { key: 'all', label: 'Tất cả', count: tasksSeed.length }
        ];
    }, []);

    const filteredTasks = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return tasksSeed.filter((task) => {
            const byStatus = activeTab === 'all' || task.status === activeTab;
            const searchText = `${task.title} ${task.requester} ${task.petName}`.toLowerCase();
            const byKeyword = !keyword || searchText.includes(keyword);
            return byStatus && byKeyword;
        });
    }, [activeTab, searchTerm]);

    const handleOpenTask = (selectedTask) => {
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
                    {filteredTasks.map((task) => (
                        <TechTaskCard
                            key={task.id}
                            task={task}
                            isProcessingTab={activeTab === 'processing'}
                            onOpen={handleOpenTask}
                            onRecordResult={handleOpenTask}
                        />
                    ))}
                    {filteredTasks.length === 0 && (
                        <div className="tech-empty-state">Không có công việc phù hợp bộ lọc.</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default TechHome;
