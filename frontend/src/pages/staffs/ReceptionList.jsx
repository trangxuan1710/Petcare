import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReceptionList.css';
import { Search, Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import StaffNavBar from '../../components/staffs/StaffNavBar';
import StaffStatusTabs from '../../components/staffs/StaffStatusTabs';
import StaffReceptionCard from '../../components/staffs/StaffReceptionCard';
import StaffCompletedReceptionCard from '../../components/staffs/StaffCompletedReceptionCard';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const demoCards = [
    {
        id: 1,
        customer: 'Nguyễn Anh Đức',
        phone: '0912345678',
        code: '2141441',
        createdAt: '10:03 - 20/03/2026',
        status: 'received',
        pets: [
            { name: 'Kuro', breed: 'Chó Poodle', type: 'Chó', age: '3 Tuổi', weight: '4.5kg' }
        ],
        total: '1.000.000đ'
    },
    {
        id: 2,
        customer: 'Nguyễn Duy Ngọc',
        phone: '0908264671',
        code: '2141441',
        createdAt: '10:03 - 20/03/2026',
        status: 'exam',
        pets: [
            { name: 'Kuro', breed: 'Chó Poodle', type: 'Chó', age: '3 Tuổi', weight: '4.5kg' },
            { name: 'Mike', breed: 'Mèo Anh lông ngắn', type: 'Mèo', age: '2 Tuổi', weight: '2.5kg' }
        ],
        total: '3.000.000đ'
    },
    {
        id: 3,
        customer: 'Hà An Huy',
        phone: '0908264671',
        code: '2141441',
        createdAt: '10:03 - 20/03/2026',
        status: 'done',
        pets: [
            { name: 'Kuro', breed: 'Chó Poodle', type: 'Chó', age: '3 Tuổi', weight: '4.5kg' },
            { name: 'Mike', breed: 'Mèo Anh lông ngắn', type: 'Mèo', age: '2 Tuổi', weight: '2.5kg', alert: true }
        ],
        total: '3.000.000đ'
    }
];

const ReceptionList = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('cho');
    const [onlyUnpaid, setOnlyUnpaid] = useState(false);
    const [calendarExpanded, setCalendarExpanded] = useState(false);

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(today.getDate());

    const tabStatusMap = {
        cho: 'received',
        da: 'exam',
        huy: 'cancelled',
        hoanthanh: 'done'
    };

    const monthGrid = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        let startWeekday = firstDay.getDay() - 1;
        if (startWeekday < 0) startWeekday = 6;

        const cells = [];
        for (let i = 0; i < startWeekday; i++) {
            cells.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(d);
        }
        return cells;
    }, [viewYear, viewMonth]);

    const currentWeek = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        let startWeekday = firstDay.getDay() - 1;
        if (startWeekday < 0) startWeekday = 6;

        const safeSelectedDate = Math.min(
            selectedDate,
            new Date(viewYear, viewMonth + 1, 0).getDate()
        );

        const offset = startWeekday + safeSelectedDate - 1;
        const weekStart = Math.floor(offset / 7) * 7;
        const week = [];

        for (let i = 0; i < 7; i++) {
            const cell = monthGrid[weekStart + i];
            week.push(cell ?? null);
        }

        return week;
    }, [viewYear, viewMonth, selectedDate, monthGrid]);

    const goMonth = (delta) => {
        let newMonth = viewMonth + delta;
        let newYear = viewYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }
        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        setViewMonth(newMonth);
        setViewYear(newYear);
        setSelectedDate(1);
    };

    // Filter cards based on tab and query
    const filteredCards = demoCards.filter((card) => {
        const keyword = query.trim().toLowerCase();
        const searchable = `${card.customer} ${card.phone} ${card.code} ${card.pets.map((pet) => pet.name).join(' ')}`.toLowerCase();
        const matchQuery = !keyword || searchable.includes(keyword);
        const unpaid = card.status !== 'done';
        const matchUnpaid = !onlyUnpaid || unpaid;

        if (activeTab === 'all') {
            return matchQuery && matchUnpaid;
        }

        const expectedStatus = tabStatusMap[activeTab];
        if (!expectedStatus) {
            return false;
        }

        return matchQuery && matchUnpaid && card.status === expectedStatus;
    });

    const isCompletedTab = activeTab === 'hoanthanh';

    return (
        <div className="staff-page">
            <div className="staff-content">
                <div className="staff-header">
                    <div className="staff-header-user">
                        <div className="staff-avatar" />
                        <div className="staff-header-texts">
                            <p className="staff-header-greeting">Xin chào</p>
                            <h1 className="staff-header-name">Lễ tân Thu Trang</h1>
                        </div>
                    </div>
                    <button className="staff-header-bell-btn" type="button" aria-label="Thông báo">
                        <Bell size={20} color="#1a1a1a" strokeWidth={2} />
                    </button>
                </div>

                <div className="staff-calendar-section">
                    <div className="staff-month-header">
                        {calendarExpanded && (
                            <button className="staff-month-nav-btn" onClick={() => goMonth(-1)}>
                                <ChevronLeft size={18} color="#209D80" />
                            </button>
                        )}
                        <div className="staff-month-label">
                            <span className="staff-month-text">{MONTH_NAMES[viewMonth]}</span>
                            <ChevronDown size={16} color="#209D80" />
                        </div>
                        {calendarExpanded && (
                            <button className="staff-month-nav-btn" onClick={() => goMonth(1)}>
                                <ChevronRight size={18} color="#209D80" />
                            </button>
                        )}
                    </div>

                    <div className="staff-week-strip staff-day-header-row">
                        {DAY_LABELS.map((lbl, idx) => (
                            <div key={idx} className="staff-day-col">
                                <span className="staff-day-label">{lbl}</span>
                            </div>
                        ))}
                    </div>

                    {!calendarExpanded ? (
                        <div className="staff-week-strip">
                            {currentWeek.map((date, idx) => (
                                <div key={idx} className="staff-day-col">
                                    {date ? (
                                        <div
                                            className={`staff-day-circle ${date === selectedDate ? 'active' : ''}`}
                                            onClick={() => setSelectedDate(date)}
                                        >
                                            <span className="staff-day-number">{date}</span>
                                        </div>
                                    ) : (
                                        <div className="staff-day-circle empty"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="staff-month-grid">
                            {monthGrid.map((date, idx) => (
                                <div key={idx} className="staff-day-col">
                                    {date ? (
                                        <div
                                            className={`staff-day-circle ${date === selectedDate ? 'active' : ''}`}
                                            onClick={() => setSelectedDate(date)}
                                        >
                                            <span className="staff-day-number">{date}</span>
                                        </div>
                                    ) : (
                                        <div className="staff-day-circle empty"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="staff-collapse-indicator" onClick={() => setCalendarExpanded(!calendarExpanded)}>
                        {calendarExpanded ? <ChevronUp size={20} color="#209D80" /> : <ChevronDown size={20} color="#209D80" />}
                    </div>
                </div>

                <div className="staff-search-row">
                    <div className="staff-search-box">
                        <Search size={20} color="#209D80" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="staff-search-input"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </div>

                {/* <label className="staff-inline-filter">
                    <input
                        type="checkbox"
                        checked={onlyUnpaid}
                        onChange={(event) => setOnlyUnpaid(event.target.checked)}
                    />
                    Chỉ hiển thị hồ sơ chưa thanh toán
                </label> */}

                <div className="staff-tabs-wrap">
                    <StaffStatusTabs onChange={(key) => setActiveTab(key)} />
                </div>

                <div className="staff-cards">
                    {filteredCards.map((card) => (
                        isCompletedTab ? (
                            <StaffCompletedReceptionCard 
                                key={card.id}
                                customer={card.customer}
                                phone={card.phone}
                                code={card.code}
                                createdAt={card.createdAt}
                                pets={card.pets.map((pet) => ({
                                    name: pet.name,
                                    breed: pet.breed,
                                    gender: pet.type === 'Mèo' ? 'female' : 'male',
                                    age: pet.age,
                                    weight: pet.weight
                                }))}
                                totalAmount={card.total}
                            />
                        ) : (
                            <StaffReceptionCard
                                key={card.id}
                                {...card}
                                onPay={() => navigate('/staffs/payment')}
                            />
                        )
                    ))}
                    {filteredCards.length === 0 && (
                        <div className="staff-empty">Không có hồ sơ phù hợp bộ lọc.</div>
                    )}
                </div>
            </div>

            {/* <StaffNavBar /> */}
        </div>
    );
};

export default ReceptionList;
