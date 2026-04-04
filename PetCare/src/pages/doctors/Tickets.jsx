import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../layouts/DoctorLayout';
import TicketCard from '../../components/doctor/TicketCard';
import TabStatus from '../../components/doctor/TabStatus';
import './Tickets.css';
import "@fontsource/roboto/500.css";

import { Search, Bell, ChevronLeft } from 'lucide-react';
import receptionService from '../../api/receptionService';
import useHeaderProfile from '../../hooks/useHeaderProfile';

const SearchIcon = () => <Search size={20} color="#209D80" />;
const BellIcon = () => <Bell size={24} color="#111827" />;
const BackIcon = () => <ChevronLeft size={22} color="#111827" />;
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

const parseBackendDate = (rawValue) => {
    if (!rawValue) return Number.NaN;
    if (rawValue instanceof Date) return rawValue.getTime();

    let value = String(rawValue).trim();
    if (!value) return Number.NaN;

    // Normalize common backend LocalDateTime formats: "2026-04-03 10:15:30.123456".
    value = value.replace(' ', 'T');
    value = value.replace(/\.(\d{3})\d+/, '.$1');

    let parsed = new Date(value).getTime();
    if (!Number.isNaN(parsed)) return parsed;

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return Number.NaN;

    const [, year, month, day, hour, minute, second = '0'] = match;
    const asLocalDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
    );
    parsed = asLocalDate.getTime();
    return Number.isNaN(parsed) ? Number.NaN : parsed;
};

const isEmergencyCase = (record) => Boolean(
    record?.isEmergency
    ?? record?.emergency
    ?? record?.examForm?.isEmergency
    ?? record?.examForm?.emergency
);

const resolvePetWeightLabel = (record) => {
    const rawWeight = record?.weight
        ?? record?.weightKg
        ?? record?.petWeight
        ?? record?.pet?.weight
        ?? record?.pet?.weightKg;

    if (rawWeight == null || rawWeight === '') return '--kg';

    const parsed = typeof rawWeight === 'number' ? rawWeight : Number(String(rawWeight).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(parsed)) return '--kg';

    return `${parsed}kg`;
};

const Tickets = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const normalizeTabId = (rawTab) => {
        const tab = String(rawTab || '').trim().toLowerCase();
        if (tab === 'pending' || tab === 'in_progress' || tab === 'completed' || tab === 'all') {
            return tab;
        }
        return 'pending';
    };

    const { profile } = useHeaderProfile({
        fallbackName: 'Bác sĩ',
        fallbackRoleLabel: 'Bác sĩ',
    });
    const [activeTab, setActiveTab] = useState(() => normalizeTabId(location.state?.initialTab));
    const [searchTerm, setSearchTerm] = useState('');
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setActiveTab(normalizeTabId(location.state?.initialTab));
    }, [location.state?.initialTab]);

    useEffect(() => {
        let isMounted = true;

        const toDoctorTabStatus = (rawStatus) => {
            const status = String(rawStatus || '').toLowerCase();
            if (status.includes('đã thanh toán') || status.includes('paid')) return 'completed';
            if (status.includes('chờ thanh toán') || status.includes('waiting_payment')) return 'completed';
            if (status.includes('chờ kết luận') || status.includes('waiting_conclusion')) return 'in_progress';
            if (status.includes('đang thực hiện') || status.includes('in_progress')) return 'in_progress';
            return 'pending';
        };

        const fetchTickets = async () => {
            setIsLoading(true);
            try {
                const response = await receptionService.getMyDoctorReceptions({});
                const records = response?.normalizedData || [];
                if (!isMounted) return;

                const now = Date.now();
                const cutoff = now - SEVEN_DAYS_IN_MS;

                const filtered = records.filter((record) => {
                    const receivedTime = parseBackendDate(record?.receptionTime);
                    if (Number.isNaN(receivedTime)) return true;
                    return receivedTime >= cutoff && receivedTime <= now;
                });

                const sorted = [...filtered].sort((left, right) => {
                    const leftEmergency = isEmergencyCase(left);
                    const rightEmergency = isEmergencyCase(right);

                    if (leftEmergency !== rightEmergency) {
                        return leftEmergency ? -1 : 1;
                    }

                    const leftTime = parseBackendDate(left?.receptionTime);
                    const rightTime = parseBackendDate(right?.receptionTime);
                    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0;
                    if (Number.isNaN(leftTime)) return 1;
                    if (Number.isNaN(rightTime)) return -1;
                    return leftTime - rightTime;
                });

                const mapped = sorted.map((record) => {
                    const createdAt = record?.receptionTime;
                    const createdAtTs = parseBackendDate(createdAt);
                    const displayDate = createdAt
                        ? (Number.isNaN(createdAtTs)
                            ? '--:-- - --/--/----'
                            : new Date(createdAtTs).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(',', ' -'))
                        : '--:-- - --/--/----';
                    const petName = record?.pet?.name || 'Chưa có tên';
                    const serviceName = record?.examForm?.examType || 'Khám lâm sàng';
                    const mappedStatus = toDoctorTabStatus(record?.status);
                    return {
                        id: record?.id,
                        code: `PK${record?.id || ''}`,
                        status: mappedStatus,
                        customerName: record?.client?.fullName || 'Khách hàng',
                        dateTime: displayDate,
                        pet: {
                            name: petName,
                            breed: record?.pet?.breed || record?.pet?.species || 'Chưa rõ giống',
                            gender: (record?.pet?.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
                            weight: resolvePetWeightLabel(record),
                            hasAlert: isEmergencyCase(record)
                        },
                        services: [{ name: serviceName, status: mappedStatus }],
                    };
                });

                setTickets(mapped);
            } catch {
                if (!isMounted) return;
                setTickets([]);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchTickets();
        return () => {
            isMounted = false;
        };
    }, []);

    const filteredTickets = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const status = ticket?.status || 'pending';
            const matchesTab = activeTab === 'all' || status === activeTab;

            const text = `${ticket.customerName} ${ticket.pet.name} ${ticket.pet.breed} ${ticket.code}`.toLowerCase();
            const matchesSearch = !keyword || text.includes(keyword);

            return matchesTab && matchesSearch;
        });
    }, [activeTab, searchTerm, tickets]);

    const handleOpenTicket = (ticket) => {
        console.log('Opening ticket', ticket);
        const status = ticket?.status || 'pending';
        if (status === 'in_progress'||status === 'completed') {
            navigate(`/doctors/service-order/${ticket.id}`);
            return;
        }
        navigate(`/doctors/tickets/${ticket.id}`);
    };

    const tabItems = useMemo(() => {
        const counts = tickets.reduce((acc, ticket) => {
            const status = ticket?.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            acc.all += 1;
            return acc;
        }, { pending: 0, in_progress: 0, completed: 0, all: 0 });

        return [
            { id: 'pending', label: 'Chờ thực hiện', count: counts.pending },
            { id: 'in_progress', label: 'Đang thực hiện', count: counts.in_progress },
            { id: 'completed', label: 'Hoàn thành', count: counts.completed },
            { id: 'all', label: 'Tất cả', count: counts.all },
        ];
    }, [tickets]);

    return (
        <DoctorLayout>
            <div className="tickets-page">
                <div className="tickets-header-area">
                    <div className="tickets-top-bar">
                        <div className="tickets-title-wrap">
                            <button className="tickets-back-btn" type="button" onClick={() => navigate('/doctors/home')} aria-label="Ve trang truoc">
                                <BackIcon />
                            </button>
                            <div className="tickets-page-title-group">
                                <h1 className="tickets-title">Phiếu khám</h1>
                                <span className="tickets-subtitle">{profile.roleLabel} {profile.displayName}</span>
                            </div>
                        </div>
                        <button
                            className="notification-btn"
                            aria-label="Thông báo"
                            onClick={() => navigate('/doctors/notifications')}
                        >
                            <BellIcon />
                        </button>
                    </div>

                    <div className="search-box">
                        <span className="search-icon"><SearchIcon /></span>
                        <input
                            type="text"
                            placeholder="Search"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                        <TabStatus activeTab={activeTab} onTabChange={setActiveTab} tabs={tabItems} />
                    </div>
                </div>

                <div className="tickets-content-area">
                    <div className="tickets-list">
                        {isLoading && <div className="tickets-empty-state">Đang tải dữ liệu phiếu khám...</div>}
                        {filteredTickets.map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                {...ticket}
                                onClick={() => handleOpenTicket(ticket)}
                            />
                        ))}
                        {!isLoading && filteredTickets.length === 0 && (
                            <div className="tickets-empty-state">Không có phiếu khám phù hợp bộ lọc.</div>
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
};

export default Tickets;
