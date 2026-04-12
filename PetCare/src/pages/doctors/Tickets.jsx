import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../layouts/DoctorLayout';
import TicketCard from '../../components/doctor/TicketCard';
import TabStatus from '../../components/doctor/TabStatus';
import './Tickets.css';
import "@fontsource/roboto/500.css";

import { Search } from 'lucide-react';
import receptionService from '../../api/receptionService';
import useHeaderProfile from '../../hooks/useHeaderProfile';
import { useNotificationSSE } from '../../hooks/useNotificationSSE';
import AppTopHeader from '../../components/common/AppTopHeader';
import { toTitleCase } from '../../utils/textFormat';

const SearchIcon = () => <Search size={20} color="#209D80" />;
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

const resolveRawStatus = (rawStatus) => {
    if (rawStatus == null) return '';
    if (typeof rawStatus === 'object') {
        return rawStatus.value || rawStatus.name || rawStatus.label || '';
    }
    return String(rawStatus);
};

const repairMojibakeUtf8 = (value) => {
    const input = String(value || '').trim();
    if (!input) return input;

    // Typical UTF-8 interpreted as Latin-1 markers from backend payloads.
    if (!/[ÃÄÂá»]/.test(input)) {
        return input;
    }

    try {
        const bytes = Uint8Array.from([...input].map((char) => char.charCodeAt(0) & 0xff));
        const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes).trim();
        return decoded || input;
    } catch {
        return input;
    }
};

const stripDiacritics = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toSearchableStatus = (rawStatus) => {
    const statusValue = resolveRawStatus(rawStatus);
    const repairedStatus = repairMojibakeUtf8(statusValue);

    // Keep ASCII letters/digits/underscores/spaces only for stable matching.
    return stripDiacritics(repairedStatus)
        .toLowerCase()
        .replace(/[^a-z0-9_\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const normalizeDoctorStatusKey = (rawStatus) => {
    const status = toSearchableStatus(rawStatus);

    // Waiting/paid payment states all belong to completed tab.
    if (
        status.includes('waiting_payment')
        || status.includes('paid')
        || status.includes('completed')
        || status.includes('thanh toan')
        || status.includes('thanh to')
    ) {
        return 'paid';
    }

    if (status.includes('waiting_conclusion') || status.includes('ket luan')) return 'waiting_conclusion';
    if (status.includes('in_progress') || status.includes('dang thuc hien')) return 'in_progress';

    // Mojibake-tolerant fallback for statuses containing broken "...thuc hien".
    if (status.includes('thuc hi')) {
        const likelyWaitingExecution =
            status.includes('cho thuc')
            || status.startsWith('ch ')
            || status.startsWith('cha ')
            || status.includes(' da tiep ')
            || status.startsWith('da tiep');

        return likelyWaitingExecution ? 'waiting_execution' : 'in_progress';
    }

    if (status.includes('lua n') || status.includes('lu n')) {
        return 'waiting_conclusion';
    }

    if (
        status.includes('waiting_execution')
        || status.includes('received')
        || status.includes('pending')
        || status.includes('cho thuc hien')
        || status.includes('da tiep don')
    ) {
        return 'waiting_execution';
    }

    return 'waiting_execution';
};

const toDoctorTabStatus = (normalizedStatusKey) => {
    if (normalizedStatusKey === 'paid') return 'completed';
    if (normalizedStatusKey === 'in_progress' || normalizedStatusKey === 'waiting_conclusion') return 'in_progress';
    return 'pending';
};

const normalizeEmergencyOnly = (rawEmergencyOnly) => rawEmergencyOnly === true;

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
    const { unreadCount, clearUnread } = useNotificationSSE();
    const [activeTab, setActiveTab] = useState(() => normalizeTabId(location.state?.initialTab));
    const [emergencyOnlyFilter, setEmergencyOnlyFilter] = useState(() => normalizeEmergencyOnly(location.state?.emergencyOnly));
    const [searchTerm, setSearchTerm] = useState('');
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setActiveTab(normalizeTabId(location.state?.initialTab));
        setEmergencyOnlyFilter(normalizeEmergencyOnly(location.state?.emergencyOnly));
    }, [location.state?.initialTab, location.state?.emergencyOnly]);

    useEffect(() => {
        let isMounted = true;

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
                    const normalizedStatusKey = normalizeDoctorStatusKey(record?.status);
                    const mappedStatus = toDoctorTabStatus(normalizedStatusKey);
                    return {
                        id: record?.id,
                        code: `PK${record?.id || ''}`,
                        status: mappedStatus,
                        customerName: toTitleCase(record?.client?.fullName || 'Khách hàng') || 'Khách hàng',
                        dateTime: displayDate,
                        pet: {
                            name: toTitleCase(petName) || petName,
                            breed: toTitleCase(record?.pet?.breed || record?.pet?.species || 'Chưa rõ giống') || 'Chưa rõ giống',
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

    const handleTabChange = (nextTab) => {
        setActiveTab(nextTab);
        setEmergencyOnlyFilter(false);
    };

    const filteredTickets = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const status = ticket?.status || 'pending';
            const matchesTab = activeTab === 'all' || status === activeTab;
            const matchesEmergencyOnly = !emergencyOnlyFilter || Boolean(ticket?.pet?.hasAlert);

            const text = `${ticket.customerName} ${ticket.pet.name} ${ticket.pet.breed} ${ticket.code}`.toLowerCase();
            const matchesSearch = !keyword || text.includes(keyword);

            return matchesTab && matchesEmergencyOnly && matchesSearch;
        });
    }, [activeTab, emergencyOnlyFilter, searchTerm, tickets]);

    const handleOpenTicket = (ticket) => {
        console.log('Opening ticket', ticket);
        const status = ticket?.status || 'pending';
        if (status === 'in_progress' || status === 'completed') {
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
                <AppTopHeader
                    profile={profile}
                    notificationCount={unreadCount}
                    onNotificationClick={() => {
                        clearUnread();
                        navigate('/doctors/notifications');
                    }}
                />

                <div className="tickets-header-area">

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
                        <TabStatus activeTab={activeTab} onTabChange={handleTabChange} tabs={tabItems} />
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
