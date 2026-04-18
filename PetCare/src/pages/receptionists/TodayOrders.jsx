import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, UserRound, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReceptionistLayout from '../../layouts/ReceptionistLayout';
import ReceptionCard from '../../components/receptionist/ReceptionCard';
import ReceivedCard from '../../components/receptionist/ReceivedCard';
import ReceivedDetailLayout from '../../components/receptionist/ReceivedDetailLayout';
import { RECEPTIONIST_PATHS } from '../../routes/receptionistPaths';
import receptionService from '../../api/receptionService';
import paymentService from '../../api/paymentService';
import customerService from '../../api/customerService';
import authService from '../../api/authService';
import useHeaderProfile from '../../hooks/useHeaderProfile';
import { useNotificationSSE } from '../../hooks/useNotificationSSE.jsx';
import AppTopHeader from '../../components/common/AppTopHeader';
import { toTitleCase } from '../../utils/textFormat';
import './TodayOrders.css';

const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];
const SPECIES_LABELS = {
    cho: 'Chó',
    meo: 'Mèo',
    khac: 'Khác',
};

const ORDER_STATUS = {
    RECEIVED: 'chờ thực hiện',
    WAITING_PAYMENT: 'chờ thanh toán',
    PAID: 'đã thanh toán',
    ALL: 'tất cả'
};

const RECEIVED_GROUP = ['chờ thực hiện', 'đang thực hiện', 'chờ kết luận'];

const TAB_STATES = {
    [ORDER_STATUS.RECEIVED]: RECEIVED_GROUP,
    [ORDER_STATUS.WAITING_PAYMENT]: [ORDER_STATUS.WAITING_PAYMENT],
    [ORDER_STATUS.PAID]: [ORDER_STATUS.PAID],
    [ORDER_STATUS.ALL]: [],
};

const initialOrders = [];

const buildCustomerAvatar = (name) => {
    const initials = String(name || 'KH')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    return `https://placehold.co/80x80/e0f2ef/209D80?text=${initials || 'KH'}`;
};

const normalizeClient = (client = {}) => ({
    id: client?.id,
    customerId: client?.id,
    customerName: toTitleCase(client?.fullName || client?.name || 'Khách hàng') || 'Khách hàng',
    phone: client?.phoneNumber || client?.phone || '--',
    pets: [],
    avatar: buildCustomerAvatar(client?.fullName || client?.name),
});

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseBackendDate = (rawValue) => {
    if (!rawValue) return Number.NaN;
    if (rawValue instanceof Date) return rawValue.getTime();

    let value = String(rawValue).trim();
    if (!value) return Number.NaN;

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
    if (!/[ÃƒÃ„Ã‚Ã¡Â»]/.test(input)) {
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

    return stripDiacritics(repairedStatus)
        .toLowerCase()
        .replace(/[^a-z0-9_\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const isEmergencyCase = (record) => Boolean(
    record?.isEmergency
    ?? record?.emergency
    ?? record?.examForm?.isEmergency
    ?? record?.examForm?.emergency
);

const CUSTOMER_NAME_ALLOWED_PATTERN = /^[\p{L}\p{M}\s]+$/u;
const CUSTOMER_PHONE_PATTERN = /^0\d{9}$/;

const normalizeCustomerName = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const validateCustomerName = (value = '') => {
    const normalized = normalizeCustomerName(value);
    if (!normalized) {
        return 'Vui lòng nhập tên khách hàng.';
    }
    if (!CUSTOMER_NAME_ALLOWED_PATTERN.test(normalized)) {
        return 'Tên chỉ được chứa chữ tiếng Việt và khoảng trắng.';
    }
    return '';
};

const validateCustomerPhone = (value = '') => {
    const phone = String(value).trim();
    if (!phone) {
        return 'Vui lòng nhập số điện thoại.';
    }
    if (!CUSTOMER_PHONE_PATTERN.test(phone)) {
        return 'Số điện thoại phải bắt đầu bằng 0 và gồm đúng 10 số.';
    }
    return '';
};

const buildNewCustomerErrors = (payload = {}) => ({
    name: validateCustomerName(payload?.name || ''),
    phone: validateCustomerPhone(payload?.phone || ''),
});

const TodayOrders = () => {
    const navigate = useNavigate();
    const { profile } = useHeaderProfile({
        fallbackName: 'Lễ tân',
        fallbackRoleLabel: 'Lễ tân',
    });
    const { unreadCount, clearUnread } = useNotificationSSE();
    const [activeStatus, setActiveStatus] = useState(ORDER_STATUS.RECEIVED);
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState(initialOrders);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [ordersError, setOrdersError] = useState('');
    const [customerSearchError, setCustomerSearchError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [toast, setToast] = useState(null);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [searchedCustomers, setSearchedCustomers] = useState([]);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [selectedReceivedOrder, setSelectedReceivedOrder] = useState(null);
    const [tabCounts, setTabCounts] = useState({
        [ORDER_STATUS.RECEIVED]: 0,
        [ORDER_STATUS.WAITING_PAYMENT]: 0,
        [ORDER_STATUS.PAID]: 0,
        [ORDER_STATUS.ALL]: 0,
    });
    const [newCustomer, setNewCustomer] = useState({
        name: '', phone: ''
    });
    const [newCustomerErrors, setNewCustomerErrors] = useState({
        name: '',
        phone: '',
    });
    const isNewCustomerFormInvalid = useMemo(() => {
        const errors = buildNewCustomerErrors({
            name: newCustomer.name,
            phone: newCustomer.phone,
        });
        return Boolean(errors.name || errors.phone);
    }, [newCustomer.name, newCustomer.phone]);

    const today = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);
    const viewMonth = today.getMonth(); // 0-indexed
    const [receivedBadgeCounts, setReceivedBadgeCounts] = useState({});

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2800);
    };

    const buildTabCounts = (mappedOrders = []) => {
        const next = {
            [ORDER_STATUS.RECEIVED]: 0,
            [ORDER_STATUS.WAITING_PAYMENT]: 0,
            [ORDER_STATUS.PAID]: 0,
            [ORDER_STATUS.ALL]: mappedOrders.length,
        };

        mappedOrders.forEach((order) => {
            if (order.status === ORDER_STATUS.RECEIVED) next[ORDER_STATUS.RECEIVED] += 1;
            if (order.status === ORDER_STATUS.WAITING_PAYMENT) next[ORDER_STATUS.WAITING_PAYMENT] += 1;
            if (order.status === ORDER_STATUS.PAID) next[ORDER_STATUS.PAID] += 1;
        });

        return next;
    };

    const buildReceivedBadgeCounts = (mappedOrders = []) => {
        return mappedOrders.reduce((counts, order) => {
            if (order.status !== ORDER_STATUS.RECEIVED || !order.dateKey) {
                return counts;
            }
            counts[order.dateKey] = (counts[order.dateKey] || 0) + 1;
            return counts;
        }, {});
    };

    const lastSevenDaysRange = useMemo(() => {
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);

        return {
            fromDate: toIsoDate(startDate),
            toDate: toIsoDate(endDate),
        };
    }, [today]);

    const calendarDays = useMemo(() => {
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(endDate);
            date.setDate(endDate.getDate() - (6 - index));

            return {
                dayNumber: date.getDate(),
                dateKey: toIsoDate(date),
                dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            };
        });
    }, [today]);

    useEffect(() => {
        let isMounted = true;

        const mapStatus = (rawStatus) => {
            const status = toSearchableStatus(rawStatus);
            if (status.includes('waiting_payment') || status.includes('cho thanh toan')) {
                return ORDER_STATUS.WAITING_PAYMENT;
            }
            if (
                status.includes('paid')
                || status.includes('completed')
                || (status.includes('thanh toan') && !status.includes('cho thanh toan'))
            ) {
                return ORDER_STATUS.PAID;
            }
            if (
                status.includes('in_progress')
                || status.includes('dang thuc hien')
                || status.includes('waiting_conclusion')
                || status.includes('ket luan')
                || status.includes('waiting_execution')
                || status.includes('cho thuc hien')
                || status.includes('received')
                || status.includes('pending')
            ) {
                return ORDER_STATUS.RECEIVED;
            }
            return ORDER_STATUS.RECEIVED;
        };

        const mapOrder = (record) => {
            const mappedStatus = mapStatus(record?.status);
            const receptionTs = parseBackendDate(record?.receptionTime);
            const dateObj = Number.isNaN(receptionTs) ? new Date() : new Date(receptionTs);
            const rawTotalAmount = record?.invoice?.totalAmount ?? record?.totalAmount ?? null;
            const totalAmount = rawTotalAmount == null ? null : formatCurrency(rawTotalAmount);
            const statusLabel =
                mappedStatus === ORDER_STATUS.PAID
                    ? 'Đã thanh toán'
                    : mappedStatus === ORDER_STATUS.WAITING_PAYMENT
                        ? 'Chờ thanh toán'
                        : 'Đã tiếp đón';
            const initials = (record?.client?.fullName || 'KH')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('');


            return {
                id: record?.id,
                customerId: record?.client?.id,
                customerName: toTitleCase(record?.client?.fullName || 'Khách hàng') || 'Khách hàng',
                phone: record?.client?.phoneNumber || '--',
                ticketId: `REC${record?.id || ''}`,
                status: mappedStatus,
                statusLabel,
                createdAt: dateObj.toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).replace(',', ' -'),
                date: dateObj.getDate(),
                dateKey: toIsoDate(dateObj),
                species: record?.pet?.species || '',
                hasAdvance: false,
                pets: [
                    {
                        id: record?.pet?.id,
                        name: toTitleCase(record?.pet?.name || 'Chưa có tên') || 'Chưa có tên',
                        species: String(record?.pet?.species || '').toLowerCase(),
                        speciesLabel: (SPECIES_LABELS[String(record?.pet?.species || '').toLowerCase()] || record?.pet?.species || '').trim(),
                        breed: record?.pet?.breed || '',
                        displayBreed: toTitleCase(`${(SPECIES_LABELS[String(record?.pet?.species || '').toLowerCase()] || record?.pet?.species || '').trim()} ${record?.pet?.breed || ''}`.trim()),
                        dateOfBirth: record?.pet?.dateOfBirth || '',
                        gender: String(record?.pet?.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
                        weight: record?.weight ?? record?.pet?.weight ?? null,
                    },
                ],
                sourceOrder: null,
                totalAmount,
                paymentEnabled: mappedStatus === ORDER_STATUS.WAITING_PAYMENT,
                hideSource: false,
                avatar: `https://placehold.co/80x80/e0f2ef/209D80?text=${initials || 'KH'}`,
                receptionRecord: record,
                isEmergency: isEmergencyCase(record),
            };
        };

        const enrichOrderTotals = async (mappedOrders) => {
            const candidates = mappedOrders.filter((order) =>
                order?.id
                && (
                    order?.status === ORDER_STATUS.WAITING_PAYMENT
                    || (order?.status === ORDER_STATUS.PAID && !order?.totalAmount)
                )
            );

            if (candidates.length === 0) {
                return mappedOrders;
            }

            const previewResults = await Promise.allSettled(
                candidates.map((order) => paymentService.getInvoicePreview(order.id))
            );

            const totalById = new Map();
            previewResults.forEach((result, index) => {
                if (result.status !== 'fulfilled') {
                    return;
                }
                const orderId = candidates[index]?.id;
                const totalAmount = Number(result.value?.data?.totalAmount);
                if (!orderId || !Number.isFinite(totalAmount)) {
                    return;
                }
                totalById.set(orderId, formatCurrency(totalAmount));
            });

            if (totalById.size === 0) {
                return mappedOrders;
            }

            return mappedOrders.map((order) => {
                if (!totalById.has(order.id)) {
                    return order;
                }
                return {
                    ...order,
                    totalAmount: totalById.get(order.id),
                };
            });
        };

        const fetchOrdersByTab = async () => {
            setIsLoadingOrders(true);
            setOrdersError('');
            try {
                const rangeParams = {
                    fromDate: lastSevenDaysRange.fromDate,
                    toDate: lastSevenDaysRange.toDate,
                };
                const activeRequest = activeStatus === ORDER_STATUS.ALL
                    ? receptionService.getReceptions(rangeParams)
                    : receptionService.getReceptionsByStates(TAB_STATES[activeStatus] || [], rangeParams);

                const summaryRequest = activeStatus === ORDER_STATUS.ALL
                    ? activeRequest
                    : receptionService.getReceptions(rangeParams);

                const [activeResult, summaryResult] = await Promise.allSettled([activeRequest, summaryRequest]);
                if (activeResult.status !== 'fulfilled') {
                    throw new Error('ACTIVE_ORDERS_FETCH_FAILED');
                }

                const records = activeResult.value?.normalizedData || [];
                if (!isMounted) return;

                const mappedOrders = records
                    .map(mapOrder)
                    .sort((a, b) => {
                        if (a.isEmergency !== b.isEmergency) {
                            return a.isEmergency ? -1 : 1;
                        }
                        const leftTime = parseBackendDate(a?.receptionRecord?.receptionTime);
                        const rightTime = parseBackendDate(b?.receptionRecord?.receptionTime);
                        if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0;
                        if (Number.isNaN(leftTime)) return 1;
                        if (Number.isNaN(rightTime)) return -1;
                        return rightTime - leftTime;
                    });
                const ordersWithTotals = await enrichOrderTotals(mappedOrders);
                if (!isMounted) return;
                setOrders(ordersWithTotals);

                if (summaryResult.status === 'fulfilled') {
                    const summaryMappedOrders = (summaryResult.value?.normalizedData || []).map(mapOrder);
                    setTabCounts(buildTabCounts(summaryMappedOrders));
                    setReceivedBadgeCounts(buildReceivedBadgeCounts(summaryMappedOrders));
                } else {
                    setTabCounts((prev) => ({
                        ...prev,
                        [activeStatus]: mappedOrders.length,
                    }));
                    setReceivedBadgeCounts(buildReceivedBadgeCounts(mappedOrders));
                }
            } catch {
                if (!isMounted) return;
                setOrders([]);
                setOrdersError('Không thể tải dữ liệu tiếp đón từ hệ thống.');
                showToast('error', 'Tải danh sách tiếp đón thất bại.');
            } finally {
                if (isMounted) {
                    setIsLoadingOrders(false);
                }
            }
        };

        fetchOrdersByTab();

        return () => {
            isMounted = false;
        };
    }, [lastSevenDaysRange, reloadKey, activeStatus]);

    const badgeData = useMemo(() => {
        const todayKey = lastSevenDaysRange.toDate;
        const todayCount = receivedBadgeCounts[todayKey] || 0;
        return todayCount > 0 ? { [todayKey]: todayCount } : {};
    }, [lastSevenDaysRange.toDate, receivedBadgeCounts]);

    const filteredBySearchAndFilters = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        return orders.filter((order) => {
            const searchable = `${order.customerName} ${order.phone} ${order.ticketId} ${order.pets[0]?.name || ''}`.toLowerCase();
            const matchesKeyword = !keyword || searchable.includes(keyword);
            return matchesKeyword;
        });
    }, [orders, searchTerm]);

    useEffect(() => {
        let isMounted = true;
        const keyword = searchTerm.trim();

        if (activeStatus !== ORDER_STATUS.RECEIVED) {
            setSearchedCustomers([]);
            setCustomerSearchError('');
            setIsSearchingCustomers(false);
            return undefined;
        }

        if (!keyword) {
            setSearchedCustomers([]);
            setCustomerSearchError('');
            setIsSearchingCustomers(false);
            return undefined;
        }

        const timer = setTimeout(async () => {
            setIsSearchingCustomers(true);
            setCustomerSearchError('');
            try {
                const response = await customerService.getCustomers({ phone: keyword });
                if (!isMounted) return;
                const mappedCustomers = (response?.data || []).map(normalizeClient);
                setSearchedCustomers(mappedCustomers);
            } catch {
                if (!isMounted) return;
                setSearchedCustomers([]);
                setCustomerSearchError('Không thể tìm khách hàng từ hệ thống.');
            } finally {
                if (isMounted) {
                    setIsSearchingCustomers(false);
                }
            }
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [searchTerm, activeStatus]);

    const statusTabs = useMemo(() => [
        { key: ORDER_STATUS.RECEIVED, label: 'Đã tiếp đón', count: tabCounts[ORDER_STATUS.RECEIVED] || 0 },
        { key: ORDER_STATUS.WAITING_PAYMENT, label: 'Chờ thanh toán', count: tabCounts[ORDER_STATUS.WAITING_PAYMENT] || 0 },
        { key: ORDER_STATUS.PAID, label: 'Đã thanh toán', count: tabCounts[ORDER_STATUS.PAID] || 0 },
        { key: ORDER_STATUS.ALL, label: 'Tất cả', count: tabCounts[ORDER_STATUS.ALL] || 0 },
    ], [tabCounts]);

    const receivedCustomers = useMemo(
        () => {
            const keyword = searchTerm.trim();
            if (keyword) {
                return searchedCustomers;
            }
            return filteredBySearchAndFilters.filter((order) => order.status === ORDER_STATUS.RECEIVED);
        },
        [filteredBySearchAndFilters, searchTerm, searchedCustomers]
    );

    const shouldUseSimpleReceptionCard = activeStatus === ORDER_STATUS.RECEIVED;

    const handleGoToNewReception = (customer = null) => {
        navigate(RECEPTIONIST_PATHS.NEW_RECEPTION, { state: customer ? { customer } : undefined });
    };

    const handleOpenCreateCustomerModal = () => {
        setNewCustomer({ name: '', phone: '' });
        setNewCustomerErrors({ name: '', phone: '' });
        setShowNewCustomerModal(true);
    };

    const handleOpenReceivedDetail = (order) => {
        console.log('Selected order for detail:', order);
        setSelectedReceivedOrder(order || null);
    };

    const handleCloseReceivedDetail = () => {
        setSelectedReceivedOrder(null);
    };

    const handleGoToNotifications = () => {
        clearUnread();
        navigate(RECEPTIONIST_PATHS.NOTIFICATIONS);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await authService.logout();
        } catch {
            // Session data is still cleared in authService.logout finally block.
        } finally {
            setIsLoggingOut(false);
            navigate('/login', { replace: true });
        }
    };

    const handleGoToPayment = (order) => {
        const orderStatus = order?.status || order?.receptionRecord?.status;
        if (orderStatus !== ORDER_STATUS.WAITING_PAYMENT && orderStatus !== ORDER_STATUS.PAID) {
            showToast('error', 'Chỉ phiếu chờ thanh toán hoặc đã thanh toán mới vào màn này.');
            return;
        }

        navigate(RECEPTIONIST_PATHS.PAYMENT, {
            state: {
                receptionId: order?.id,
                customerName: order?.customerName,
                customerPhone: order?.phone,
                receptionStatus: orderStatus,
            },
        });
    };

    const handleRetryOrders = () => {
        setReloadKey((prev) => prev + 1);
        showToast('success', 'Đang tải lại danh sách tiếp đón...');
    };

    const handleCreateCustomer = async () => {
        if (isCreatingCustomer) return;

        const name = normalizeCustomerName(newCustomer.name || '');
        const phone = String(newCustomer.phone || '').trim();
        const errors = buildNewCustomerErrors({ name, phone });

        setNewCustomerErrors(errors);

        if (errors.name || errors.phone) {
            showToast('error', errors.name || errors.phone);
            return;
        }

        setIsCreatingCustomer(true);
        try {
            const response = await customerService.createCustomer({ name, phone });
            const createdClient = response?.data?.data || response?.data || { name, phone };
            const normalizedClient = normalizeClient(createdClient);

            setShowNewCustomerModal(false);
            setNewCustomer({ name: '', phone: '' });
            setNewCustomerErrors({ name: '', phone: '' });
            setActiveStatus(ORDER_STATUS.RECEIVED);
            setSearchTerm(normalizedClient.phone === '--' ? phone : normalizedClient.phone);
            setSearchedCustomers([normalizedClient]);
            showToast('success', 'Tạo khách hàng thành công.');

            handleGoToNewReception({
                id: normalizedClient.customerId,
                name: normalizedClient.customerName,
                phone: normalizedClient.phone === '--' ? phone : normalizedClient.phone,
                pets: [],
            });
        } catch {
            showToast('error', 'Không thể tạo khách hàng. Vui lòng thử lại.');
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    if (selectedReceivedOrder) {
        return (
            <ReceptionistLayout>
                <ReceivedDetailLayout
                    order={selectedReceivedOrder}
                    onBack={handleCloseReceivedDetail}
                    onSubmit={() => handleGoToPayment(selectedReceivedOrder)}
                />

                {toast && (
                    <div className={`to-toast to-toast-${toast.type}`} role="status" aria-live="polite">
                        {toast.message}
                    </div>
                )}
            </ReceptionistLayout>
        );
    }

    return (
        <ReceptionistLayout>
            <div className="today-orders-page">
                {/* Header */}
                <AppTopHeader
                    profile={profile}
                    notificationCount={unreadCount}
                    onNotificationClick={handleGoToNotifications}
                    onLogout={handleLogout}
                    isLogoutDisabled={isLoggingOut}
                />

                {/* Calendar Strip */}
                <div className="to-calendar-section">
                    <div className="to-month-header">
                        <div className="to-month-label">
                            <span className="to-month-text">{MONTH_NAMES[viewMonth]}</span>
                        </div>
                    </div>

                    {/* Day-of-week header row (always visible) */}
                    <div className="to-week-strip to-day-header-row">
                        {calendarDays.map((day) => (
                            <div key={day.dateKey} className="to-day-col">
                                <span className="to-day-label">{day.dayLabel}</span>
                            </div>
                        ))}
                    </div>

                    <div className="to-week-strip">
                        {calendarDays.map((day) => (
                            <div key={day.dateKey} className="to-day-col">
                                <div className={`to-day-circle ${day.dateKey === lastSevenDaysRange.toDate ? 'active' : ''}`}>
                                    {badgeData[day.dateKey] && (
                                        <span className="to-day-badge">{badgeData[day.dateKey]}</span>
                                    )}
                                    <span className="to-day-number">{day.dayNumber}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Day selection is intentionally disabled; the reception list always shows the latest 7 days. */}
                    <div className="to-collapse-indicator to-collapse-indicator-static">
                        <ChevronDown size={20} color="#209D80" />
                    </div>
                </div>

                {/* Stats Row */}
                {/* <div className="to-stats-row">
                    <div className="to-stat-card">
                        <span className="to-stat-label">Đã tiếp đón</span>
                        <span className="to-stat-value">{statusTabs.find((tab) => tab.key === ORDER_STATUS.RECEIVED)?.count || 0}</span>
                    </div>
                    <div className="to-stat-card">
                        <span className="to-stat-label">Đã thanh toán</span>
                        <span className="to-stat-value">{statusTabs.find((tab) => tab.key === ORDER_STATUS.PAID)?.count || 0}</span>
                    </div>
                </div> */}

                {/* Search Bar */}
                <div className="to-search-container">
                    <div className="to-search-box">
                        <Search size={20} color="#209D80" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="to-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {ordersError && (
                    <div className="to-error-row">
                        <p className="to-empty-text">{ordersError}</p>
                        <button type="button" className="to-retry-btn" onClick={handleRetryOrders}>Thử lại</button>
                    </div>
                )}

                {customerSearchError && activeStatus === ORDER_STATUS.RECEIVED && (
                    <div className="to-error-row">
                        <p className="to-empty-text">{customerSearchError}</p>
                    </div>
                )}

                {/* Status Tabs */}
                <div className="to-status-tabs">
                    {statusTabs.map(tab => (
                        <div
                            key={tab.key}
                            className={`to-status-tab ${activeStatus === tab.key ? 'active' : ''}`}
                            onClick={() => {
                                setActiveStatus(tab.key);
                                if (tab.key !== ORDER_STATUS.RECEIVED) {
                                    setSearchedCustomers([]);
                                    setCustomerSearchError('');
                                }
                            }}
                        >
                            <span className="to-tab-label">{tab.label}</span>
                            <span className="to-tab-count">{tab.count}</span>
                        </div>
                    ))}
                </div>

                {/* Content by tab */}
                {isLoadingOrders && (
                    <div className="to-customers-list" aria-hidden="true">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="to-skeleton-card">
                                <div className="to-skeleton-line to-skeleton-line-lg"></div>
                                <div className="to-skeleton-line"></div>
                                <div className="to-skeleton-line to-skeleton-line-sm"></div>
                            </div>
                        ))}
                    </div>
                )}

                {isSearchingCustomers && activeStatus === ORDER_STATUS.RECEIVED && !isLoadingOrders && (
                    <div className="to-customers-list" aria-hidden="true">
                        {[1, 2].map((item) => (
                            <div key={item} className="to-skeleton-card">
                                <div className="to-skeleton-line to-skeleton-line-lg"></div>
                                <div className="to-skeleton-line"></div>
                            </div>
                        ))}
                    </div>
                )}

                {shouldUseSimpleReceptionCard && (
                    <>
                        {!isLoadingOrders && !isSearchingCustomers && receivedCustomers.length > 0 ? (
                            <div className="to-customers-list">
                                {receivedCustomers.map((c) => (
                                    c?.receptionRecord ? (
                                        <ReceivedCard
                                            key={c.id}
                                            customerName={c.customerName}
                                            phone={c.phone}
                                            status={c.statusLabel}
                                            createdAt={c.createdAt}
                                            pets={c.pets || []}
                                            selectedPetId={c?.receptionRecord?.pet?.id}
                                            showFooter={false}
                                            onCardClick={() => handleOpenReceivedDetail(c)}
                                            isEmergency={c.isEmergency}
                                        />
                                    ) : (
                                        <ReceptionCard
                                            key={c.id}
                                            name={c.customerName}
                                            phone={c.phone}
                                            avatar={c.avatar}
                                            pets={c.pets || []}
                                            onViewDetail={() => handleOpenReceivedDetail(c)}
                                            onAdd={() =>
                                                handleGoToNewReception({
                                                    id: c.customerId,
                                                    name: c.customerName,
                                                    phone: c.phone,
                                                    pets: c.pets || [],
                                                })
                                            }
                                        />
                                    )
                                ))}
                            </div>
                        ) : !isLoadingOrders && !isSearchingCustomers ? (
                            <div className="to-empty-state">
                                <div className="to-empty-icon">
                                    <UserRound size={32} color="#a1a1aa" />
                                </div>
                                <p className="to-empty-text">Không tìm thấy khách hàng</p>
                                <button className="to-empty-add-btn" onClick={handleOpenCreateCustomerModal}>
                                    <span className="to-empty-add-icon-wrap">
                                        <PlusCircle size={20} color="#209D80" strokeWidth={2.2} />
                                    </span>
                                    <span className="to-empty-add-text">Tạo mới khách hàng</span>
                                </button>
                            </div>
                        ) : null}
                    </>
                )}

                {!shouldUseSimpleReceptionCard && !isLoadingOrders && filteredBySearchAndFilters.length > 0 && (
                    <div className="to-customers-list">
                        {filteredBySearchAndFilters.map((order) => (
                            <ReceivedCard
                                key={order.id}
                                customerName={order.customerName}
                                phone={order.phone}
                                ticketId={order.ticketId}
                                status={order.statusLabel}
                                createdAt={order.createdAt}
                                pets={order.pets}
                                selectedPetId={order?.receptionRecord?.pet?.id}
                                showPets={false}
                                showFooter={order.status === ORDER_STATUS.WAITING_PAYMENT}
                                sourceOrder={order.sourceOrder}
                                serviceSummary={order.serviceSummary}
                                totalAmount={order.totalAmount}
                                paymentEnabled={order.paymentEnabled}
                                paymentButtonLabel={
                                    order.status === ORDER_STATUS.PAID ? 'Đã thanh toán' : 'Thanh toán'
                                }
                                hideSource={order.hideSource}
                                onPayment={() => handleGoToPayment(order)}
                            />
                        ))}
                    </div>
                )}

                {!shouldUseSimpleReceptionCard && !isLoadingOrders && filteredBySearchAndFilters.length === 0 && (
                    <div className="to-empty-state">
                        <div className="to-empty-icon">
                            <UserRound size={32} color="#a1a1aa" />
                        </div>
                        <p className="to-empty-text">Không có đơn phù hợp bộ lọc</p>
                        <button className="to-empty-add-btn" onClick={handleOpenCreateCustomerModal}>
                            <span className="to-empty-add-icon-wrap">
                                <PlusCircle size={20} color="#209D80" strokeWidth={2.2} />
                            </span>
                            <span className="to-empty-add-text">Tạo mới khách hàng</span>
                        </button>
                    </div>
                )}

                {toast && (
                    <div className={`to-toast to-toast-${toast.type}`} role="status" aria-live="polite">
                        {toast.message}
                    </div>
                )}
            </div>

            {/* New Customer Modal */}
            {showNewCustomerModal && (
                <>
                    <div className="to-modal-overlay" onClick={() => setShowNewCustomerModal(false)}></div>
                    <div className="to-modal-content">
                        <div className="to-modal-handle"></div>
                        <h2 className="to-modal-title">Tạo mới khách hàng</h2>

                        <div className="to-modal-form">
                            <div className="to-modal-field-group">
                                <div className={`to-modal-field ${newCustomerErrors.name ? 'is-invalid' : ''}`}>
                                    <label className="to-modal-label">Khách hàng <span className="to-modal-req">*</span></label>
                                    <input
                                        type="text"
                                        className="to-modal-input"
                                        placeholder="Tên khách hàng"
                                        value={newCustomer.name}
                                        onChange={(e) => {
                                            const nextName = e.target.value;
                                            setNewCustomer((prev) => ({ ...prev, name: nextName }));
                                            setNewCustomerErrors((prev) => ({
                                                ...prev,
                                                name: validateCustomerName(nextName),
                                            }));
                                        }}
                                        onBlur={(e) => {
                                            setNewCustomerErrors((prev) => ({
                                                ...prev,
                                                name: validateCustomerName(e.target.value),
                                            }));
                                        }}
                                        required
                                        aria-required="true"
                                        aria-invalid={Boolean(newCustomerErrors.name)}
                                    />
                                </div>
                                {newCustomerErrors.name && (
                                    <p className="to-modal-field-error">{newCustomerErrors.name}</p>
                                )}
                            </div>

                            <div className="to-modal-field-group">
                                <div className={`to-modal-field ${newCustomerErrors.phone ? 'is-invalid' : ''}`}>
                                    <label className="to-modal-label">Số điện thoại <span className="to-modal-req">*</span></label>
                                    <input
                                        type="tel"
                                        className="to-modal-input"
                                        placeholder="Số điện thoại"
                                        value={newCustomer.phone}
                                        onChange={(e) => {
                                            const sanitizedPhone = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
                                            setNewCustomer((prev) => ({ ...prev, phone: sanitizedPhone }));
                                            setNewCustomerErrors((prev) => ({
                                                ...prev,
                                                phone: '',
                                            }));
                                        }}
                                        onBlur={() => {
                                            setNewCustomerErrors((prev) => ({
                                                ...prev,
                                                phone: validateCustomerPhone(newCustomer.phone),
                                            }));
                                        }}
                                        required
                                        aria-required="true"
                                        aria-invalid={Boolean(newCustomerErrors.phone)}
                                    />
                                </div>
                                {newCustomerErrors.phone && (
                                    <p className="to-modal-field-error">{newCustomerErrors.phone}</p>
                                )}
                            </div>

                        </div>

                        <div className="to-modal-actions">
                            <button className="to-modal-btn-cancel" onClick={() => setShowNewCustomerModal(false)}>Hủy bỏ</button>
                            <button
                                className="to-modal-btn-submit"
                                onClick={handleCreateCustomer}
                                disabled={isCreatingCustomer || isNewCustomerFormInvalid}
                            >
                                {isCreatingCustomer ? 'Đang tạo...' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </ReceptionistLayout>
    );
};

export default TodayOrders;




