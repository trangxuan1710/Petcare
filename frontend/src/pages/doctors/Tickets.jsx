import React, { useMemo, useState } from 'react';
import DoctorLayout from '../../layouts/DoctorLayout';
import TicketCard from '../../components/doctor/TicketCard';
import TabStatus from '../../components/doctor/TabStatus';
import './Tickets.css';

import { Search, Bell } from 'lucide-react';

const SearchIcon = () => <Search size={20} color="#209D80" />;
const BellIcon = () => <Bell size={22} color="#111827" strokeWidth={1.8} />;

const Tickets = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const dummyTickets = [
        {
            id: 1,
            code: 'PK2141441',
            customerName: 'Nguyễn Anh Đức',
            dateTime: '10:03 - 20/03/2026',
            paidAmount: '0đ',
            totalAmount: '/1.000.000đ',
            pet: {
                name: 'Kuro',
                breed: 'Chó Poodle',
                gender: 'male',
                age: '3 Tuổi',
                weight: '4.5kg',
                hasAlert: true
            },
            services: [
                { name: 'Điều trị ngoại trú', status: 'pending' },
                { name: 'Điều trị nội trú', status: 'completed' },
                { name: 'Khám lâm sàng', status: 'completed' }
            ]
        },
        {
            id: 2,
            code: 'PK2141442',
            customerName: 'Nguyễn Anh Đức',
            dateTime: '10:03 - 20/03/2026',
            paidAmount: '0đ',
            totalAmount: '/1.000.000đ',
            pet: {
                name: 'Kuro',
                breed: 'Chó Poodle',
                gender: 'male',
                age: '3 Tuổi',
                weight: '4.5kg',
                hasAlert: false
            },
            services: [
                { name: 'Khám lâm sàng', status: 'pending' }
            ]
        },
        {
            id: 3,
            code: 'PK2141443',
            customerName: 'Nguyễn Anh Đức',
            dateTime: '10:03 - 20/03/2026',
            paidAmount: '0đ',
            totalAmount: '/1.000.000đ',
            pet: {
                name: 'Kuro',
                breed: 'Chó Poodle',
                gender: 'male',
                age: '3 Tuổi',
                weight: '4.5kg',
                hasAlert: false
            },
            services: [
                { name: 'Khám lâm sàng', status: 'pending' }
            ]
        },
        {
            id: 4,
            code: 'PK2142001',
            customerName: 'Lê Huyền Linh',
            dateTime: '11:45 - 20/03/2026',
            paidAmount: '200.000đ',
            totalAmount: '/1.200.000đ',
            pet: {
                name: 'Milo',
                breed: 'Mèo Anh lông ngắn',
                gender: 'female',
                age: '2 Tuổi',
                weight: '3.2kg',
                hasAlert: true
            },
            services: [
                { name: 'Khám lâm sàng', status: 'completed' },
                { name: 'Xét nghiệm máu', status: 'completed' }
            ]
        }
    ];

    const inferStatus = (services) => {
        if (services.length === 0) return 'pending';
        const hasPending = services.some((service) => service.status === 'pending');
        const hasCompleted = services.some((service) => service.status === 'completed');
        if (hasPending && hasCompleted) return 'in_progress';
        if (hasPending) return 'pending';
        return 'completed';
    };

    const filteredTickets = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return dummyTickets.filter((ticket) => {
            const status = inferStatus(ticket.services);
            const matchesTab = activeTab === 'all' || status === activeTab;

            const text = `${ticket.customerName} ${ticket.pet.name} ${ticket.pet.breed} ${ticket.code}`.toLowerCase();
            const matchesSearch = !keyword || text.includes(keyword);

            return matchesTab && matchesSearch;
        });
    }, [activeTab, searchTerm]);

    return (
        <DoctorLayout>
            <div className="tickets-page">
                <div className="tickets-header-area">
                    <div className="tickets-top-bar">
                        <h1 className="tickets-title">Phiếu khám</h1>
                        <button className="icon-btn">
                            <BellIcon />
                        </button>
                    </div>

                    <div className="search-box">
                        <span className="search-icon"><SearchIcon /></span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                        <TabStatus activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>
                </div>

                <div className="tickets-content-area">
                    <div className="tickets-list">
                        {filteredTickets.map((ticket) => (
                            <TicketCard key={ticket.id} {...ticket} />
                        ))}
                        {filteredTickets.length === 0 && (
                            <div className="tickets-empty-state">Không có phiếu khám phù hợp bộ lọc.</div>
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
};

export default Tickets;
