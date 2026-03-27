import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import TechTopHeader from '../../components/techStaffs/TechTopHeader';
import TechStatusTabs from '../../components/techStaffs/TechStatusTabs';
import TechTaskCard from '../../components/techStaffs/TechTaskCard';
import './Home.css';

const tasksSeed = [
    {
        id: 1,
        title: 'Xet nghiem nuoc tieu',
        requester: 'Nguyen Van An',
        petName: 'Kuro',
        status: 'processing'
    },
    {
        id: 2,
        title: 'Xet nghiem nuoc tieu',
        requester: 'Nguyen Van An',
        petName: 'Kuro',
        status: 'processing',
    },
    {
        id: 3,
        title: 'Xet nghiem nuoc tieu',
        requester: 'Nguyen Van An',
        petName: 'Kuro',
        status: 'processing'
    },
    {
        id: 4,
        title: 'Xet nghiem nuoc tieu',
        requester: 'Tran Thi Bich',
        petName: 'Milo',
        status: 'queued'
    },
    {
        id: 5,
        title: 'Sieu am tim',
        requester: 'Le Duy Tuan',
        petName: 'Luna',
        status: 'queued'
    },
    {
        id: 6,
        title: 'Xet nghiem mau',
        requester: 'Nguyen Van An',
        petName: 'Mochi',
        status: 'queued'
    },
    {
        id: 7,
        title: 'Xet nghiem nuoc tieu',
        requester: 'Nguyen Van An',
        petName: 'Kuro',
        status: 'done'
    },
    {
        id: 8,
        title: 'Xet nghiem nuoc tieu',
        requester: 'Nguyen Van An',
        petName: 'Kuro',
        status: 'done',
    },
    {
        id: 9,
        title: 'Xet nghiem nuoc tieu',
        requester: 'Nguyen Van An',
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
            { key: 'queued', label: 'Cho thuc hien', count: count('queued') },
            { key: 'processing', label: 'Dang thuc hien', count: count('processing') },
            { key: 'done', label: 'Da hoan thanh', count: count('done') },
            { key: 'all', label: 'Tat ca', count: tasksSeed.length }
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

    return (
        <div className="tech-home-page">
            <div className="tech-home-shell">
                <TechTopHeader title="Danh sach cong viec" name="Ky thuat vien Quoc Dat" />

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
                            onOpen={(selectedTask) => navigate(`/techs/record-result/${selectedTask.id}`)}
                        />
                    ))}
                    {filteredTasks.length === 0 && (
                        <div className="tech-empty-state">Khong co cong viec phu hop bo loc.</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default TechHome;
