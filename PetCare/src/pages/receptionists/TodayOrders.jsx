import React, { useState, useMemo, useEffect } from 'react';
import { Search, Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, UserRound, PlusCircle, LogOut } from 'lucide-react';
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
import './TodayOrders.css';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

const initialOrders = [
    // {
    //     id: 1,
    //     customerName: 'Nguyễn Anh Đức',
    //     phone: '0912345678',
    //     ticketId: '2141441',
    //     status: ORDER_STATUS.RECEIVED,
    //     statusLabel: 'Đã tiếp đón',
    //     createdAt: 'Tiếp đón lúc 10:03 - 20/03/2026',
    //     date: 20,
    //     species: 'cho',
    //     hasAdvance: true,
    //     pets: [{ name: 'Kuro', breed: 'Chó Poodle', gender: 'male', weight: '4.5kg' }],
    //     sourceOrder: '2141441',
    //     paymentEnabled: true,
    //     hideSource: false,
    //     avatar: 'https://placehold.co/80x80/e0f2ef/209D80?text=NAD'
    // },
    // {
    //     id: 2,
    //     customerName: 'Lê Huyền Linh',
    //     phone: '0816278274',
    //     ticketId: '2141442',
    //     status: ORDER_STATUS.RECEIVED,
    //     statusLabel: 'Đã tiếp đón',
    //     createdAt: 'Tiếp đón lúc 11:10 - 20/03/2026',
    //     date: 20,
    //     species: 'meo',
    //     hasAdvance: false,
    //     pets: [{ name: 'Mike', breed: 'Mèo Anh lông ngắn', gender: 'male', weight: '2.5kg' }],
    //     sourceOrder: null,
    //     paymentEnabled: true,
    //     hideSource: false,
    //     avatar: 'https://placehold.co/80x80/e0f2ef/209D80?text=LHL'
    // },
    // {
    //     id: 3,
    //     customerName: 'Nguyễn Duy Ngọc',
    //     phone: '0908264671',
    //     ticketId: '2141551',
    //     status: ORDER_STATUS.WAITING_PAYMENT,
    //     statusLabel: 'Chờ thanh toán',
    //     createdAt: 'Lập phiếu lúc 09:03 - 20/03/2026',
    //     date: 20,
    //     species: 'cho',
    //     hasAdvance: true,
    //     pets: [{ name: 'Milo', breed: 'Chó Corgi', gender: 'male', weight: '7kg' }],
    //     sourceOrder: null,
    //     serviceSummary: '82 Hug × 16 Hug',
    //     totalAmount: '251.000đ',
    //     paymentEnabled: true,
    //     hideSource: false,
    //     avatar: 'https://placehold.co/80x80/e0f2ef/209D80?text=NDN'
    // },
    // {
    //     id: 4,
    //     customerName: 'Trần Minh Hạnh',
    //     phone: '0902627274',
    //     ticketId: '2141999',
    //     status: ORDER_STATUS.WAITING_PAYMENT,
    //     statusLabel: 'Chờ thanh toán',
    //     createdAt: 'Lập phiếu lúc 08:50 - 20/03/2026',
    //     date: 20,
    //     species: 'khac',
    //     hasAdvance: false,
    //     pets: [{ name: 'Peach', breed: 'Thỏ Mini', gender: 'female', weight: '1.1kg' }],
    //     sourceOrder: null,
    //     serviceSummary: '12 Hug × 04 Hug',
    //     totalAmount: '179.000đ',
    //     paymentEnabled: true,
    //     hideSource: false,
    //     avatar: 'https://placehold.co/80x80/e0f2ef/209D80?text=TMH'
    // },
    // {
    //     id: 5,
    //     customerName: 'Hà An Huy',
    //     phone: '0977771234',
    //     ticketId: '2141777',
    //     status: ORDER_STATUS.PAID,
    //     statusLabel: 'Đã thanh toán',
    //     createdAt: 'Thanh toán lúc 07:45 - 20/03/2026',
    //     date: 20,
    //     species: 'cho',
    //     hasAdvance: true,
    //     pets: [{ name: 'Pika', breed: 'Chó Phốc sóc', gender: 'female', weight: '2.3kg' }],
    //     sourceOrder: '2141333',
    //     serviceSummary: '64 Hug × 08 Hug',
    //     totalAmount: '368.000đ',
    //     paymentEnabled: false,
    //     hideSource: false,
    //     avatar: 'https://placehold.co/80x80/e0f2ef/209D80?text=HAH'
    // },
    // {
    //     id: 6,
    //     customerName: 'Phạm Ngọc Vy',
    //     phone: '0933338899',
    //     ticketId: '2141880',
    //     status: ORDER_STATUS.PAID,
    //     statusLabel: 'Đã thanh toán',
    //     createdAt: 'Thanh toán lúc 13:25 - 20/03/2026',
    //     date: 20,
    //     species: 'meo',
    //     hasAdvance: true,
    //     pets: [{ name: 'Bông', breed: 'Mèo Ba Tư', gender: 'female', weight: '3.2kg' }],
    //     sourceOrder: null,
    //     serviceSummary: '31 Hug × 06 Hug',
    //     totalAmount: '205.000đ',
    //     paymentEnabled: false,
    //     hideSource: false,
    //     avatar: 'https://placehold.co/80x80/e0f2ef/209D80?text=PNV'
    // }
];

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
    customerName: client?.fullName || client?.name || 'Khách hàng',
    phone: client?.phoneNumber || client?.phone || '--',
    pets: [],
    avatar: buildCustomerAvatar(client?.fullName || client?.name),
});

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

const TodayOrders = () => {
    const navigate = useNavigate();
    const { profile } = useHeaderProfile({
        fallbackName: 'Lễ tân',
        fallbackRoleLabel: 'Lễ tân',
    });
    const [activeStatus, setActiveStatus] = useState(ORDER_STATUS.RECEIVED);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
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

    const today = new Date();
    const todayDate = today.getDate();
    const fallbackDate = initialOrders[0]?.date || todayDate;
    const defaultSelectedDate = initialOrders.some((order) => order.date === todayDate)
        ? todayDate
        : fallbackDate;

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
    const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);

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

    const selectedDateIso = useMemo(() => {
        const date = new Date(viewYear, viewMonth, selectedDate || 1);
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, [viewYear, viewMonth, selectedDate]);

    useEffect(() => {
        let isMounted = true;

        const mapStatus = (rawStatus) => {
            const status = String(rawStatus || '').trim().toLowerCase();
            if (status === 'đã thanh toán' || status === 'paid') {
                return ORDER_STATUS.PAID;
            }
            if (status === 'chờ thanh toán' || status === 'waiting_payment') {
                return ORDER_STATUS.WAITING_PAYMENT;
            }
            if (
                status === 'đang thực hiện'
                || status === 'chờ kết luận'
                || status === 'chờ thực hiện'
                || status === 'in_progress'
                || status === 'waiting_conclusion'
                || status === 'waiting_execution'
            ) {
                return ORDER_STATUS.RECEIVED;
            }
            return ORDER_STATUS.RECEIVED;
        };

        const mapOrder = (record) => {
            const mappedStatus = mapStatus(record?.status);
            const dateObj = record?.receptionTime ? new Date(record.receptionTime) : new Date();
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
                customerName: record?.client?.fullName || 'Khách hàng',
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
                species: record?.pet?.species || '',
                hasAdvance: false,
                pets: [
                    {
                        id: record?.pet?.id,
                        name: record?.pet?.name || 'Chưa có tên',
                        breed: record?.pet?.breed || record?.pet?.species || '--',
                        gender: String(record?.pet?.gender || '').toLowerCase() === 'female' ? 'female' : 'male',
                        weight: record?.pet?.weight ? `${record?.pet?.weight}kg` : '--',
                    },
                ],
                sourceOrder: null,
                totalAmount,
                paymentEnabled: mappedStatus === ORDER_STATUS.WAITING_PAYMENT,
                hideSource: false,
                avatar: `https://placehold.co/80x80/e0f2ef/209D80?text=${initials || 'KH'}`,
                receptionRecord: record,
            };
        };

        const enrichOrderTotals = async (mappedOrders) => {
            const candidates = mappedOrders.filter((order) =>
                order?.id
                && !order?.totalAmount
                && (order?.status === ORDER_STATUS.WAITING_PAYMENT || order?.status === ORDER_STATUS.PAID)
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
                const totalAmount = Number(result.value?.data?.totalAmount || 0);
                if (!orderId || totalAmount <= 0) {
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
                const activeRequest = activeStatus === ORDER_STATUS.ALL
                    ? receptionService.getReceptions({ date: selectedDateIso })
                    : receptionService.getReceptionsByStates(TAB_STATES[activeStatus] || [], { date: selectedDateIso });

                const summaryRequest = activeStatus === ORDER_STATUS.ALL
                    ? activeRequest
                    : receptionService.getReceptions({ date: selectedDateIso });

                const [activeResult, summaryResult] = await Promise.allSettled([activeRequest, summaryRequest]);
                if (activeResult.status !== 'fulfilled') {
                    throw new Error('ACTIVE_ORDERS_FETCH_FAILED');
                }

                const records = activeResult.value?.normalizedData || [];
                if (!isMounted) return;

                const mappedOrders = records.map(mapOrder);
                const ordersWithTotals = await enrichOrderTotals(mappedOrders);
                if (!isMounted) return;
                setOrders(ordersWithTotals);

                if (summaryResult.status === 'fulfilled') {
                    const summaryMappedOrders = (summaryResult.value?.normalizedData || []).map(mapOrder);
                    setTabCounts(buildTabCounts(summaryMappedOrders));
                } else {
                    setTabCounts((prev) => ({
                        ...prev,
                        [activeStatus]: mappedOrders.length,
                    }));
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
    }, [selectedDateIso, reloadKey, activeStatus]);

    // Build the full month grid
    const monthGrid = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        // getDay() returns 0=Sun, we need Mon=0
        let startWeekday = firstDay.getDay() - 1;
        if (startWeekday < 0) startWeekday = 6;

        const cells = [];
        // Empty leading cells
        for (let i = 0; i < startWeekday; i++) {
            cells.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(d);
        }
        return cells;
    }, [viewYear, viewMonth]);

    // Get week row that contains the selected date
    const currentWeek = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        let startWeekday = firstDay.getDay() - 1;
        if (startWeekday < 0) startWeekday = 6;
        const offset = startWeekday + selectedDate - 1; // index in monthGrid
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
        if (newMonth < 0) { newMonth = 11; newYear--; }
        if (newMonth > 11) { newMonth = 0; newYear++; }
        setViewMonth(newMonth);
        setViewYear(newYear);
        setSelectedDate(1);
    };

    const badgeData = useMemo(() => {
        const map = {};
        orders.forEach((order) => {
            map[order.date] = (map[order.date] || 0) + 1;
        });
        return map;
    }, [orders]);

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

        const name = String(newCustomer.name || '').trim();
        const phone = String(newCustomer.phone || '').trim();

        if (!name || !phone) {
            showToast('error', 'Vui lòng nhập tên khách hàng và số điện thoại.');
            return;
        }

        setIsCreatingCustomer(true);
        try {
            const response = await customerService.createCustomer({ name, phone });
            const createdClient = response?.data?.data || response?.data || { name, phone };
            const normalizedClient = normalizeClient(createdClient);

            setShowNewCustomerModal(false);
            setNewCustomer({ name: '', phone: '' });
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
                <div className="to-header-area">
                    <div className="to-header">
                        <div className="to-header-user">
                            <div className="to-header-avatar">
                                <img src={profile.avatarUrl} alt={profile.displayName} />
                            </div>
                            <div className="to-header-texts">
                                <p className="to-header-greeting">Xin chào</p>
                                <h1 className="to-header-name">{profile.roleLabel} {profile.displayName}</h1>
                            </div>
                        </div>
                        <div className="to-header-actions">
                            <button
                                className="to-header-bell-btn"
                                type="button"
                                aria-label="Thông báo"
                                onClick={handleGoToNotifications}
                            >
                                <Bell size={20} color="#1a1a1a" strokeWidth={2} />
                            </button>
                            <button
                                className="to-header-bell-btn to-header-logout-btn"
                                type="button"
                                aria-label="Đăng xuất"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut size={20} color="#b91c1c" strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Strip */}
                <div className="to-calendar-section">
                    <div className="to-month-header">
                        {calendarExpanded && (
                            <button className="to-month-nav-btn" onClick={() => goMonth(-1)}>
                                <ChevronLeft size={18} color="#209D80" />
                            </button>
                        )}
                        <div className="to-month-label">
                            <span className="to-month-text">{MONTH_NAMES[viewMonth]}</span>
                            <ChevronDown size={16} color="#209D80" />
                        </div>
                        {calendarExpanded && (
                            <button className="to-month-nav-btn" onClick={() => goMonth(1)}>
                                <ChevronRight size={18} color="#209D80" />
                            </button>
                        )}
                    </div>

                    {/* Day-of-week header row (always visible) */}
                    <div className="to-week-strip to-day-header-row">
                        {DAY_LABELS.map((lbl, idx) => (
                            <div key={idx} className="to-day-col">
                                <span className="to-day-label">{lbl}</span>
                            </div>
                        ))}
                    </div>

                    {!calendarExpanded ? (
                        /* Collapsed: show only current week */
                        <div className="to-week-strip">
                            {currentWeek.map((date, idx) => (
                                <div key={idx} className="to-day-col">
                                    {date ? (
                                        <div
                                            className={`to-day-circle ${date === selectedDate ? 'active' : ''}`}
                                            onClick={() => setSelectedDate(date)}
                                        >
                                            {badgeData[date] && (
                                                <span className="to-day-badge">{badgeData[date]}</span>
                                            )}
                                            <span className="to-day-number">{date}</span>
                                        </div>
                                    ) : (
                                        <div className="to-day-circle empty"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Expanded: show full month grid */
                        <div className="to-month-grid">
                            {monthGrid.map((date, idx) => (
                                <div key={idx} className="to-day-col">
                                    {date ? (
                                        <div
                                            className={`to-day-circle ${date === selectedDate ? 'active' : ''}`}
                                            onClick={() => setSelectedDate(date)}
                                        >
                                            {badgeData[date] && (
                                                <span className="to-day-badge">{badgeData[date]}</span>
                                            )}
                                            <span className="to-day-number">{date}</span>
                                        </div>
                                    ) : (
                                        <div className="to-day-circle empty"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="to-collapse-indicator" onClick={() => setCalendarExpanded(!calendarExpanded)}>
                        {calendarExpanded ? <ChevronUp size={20} color="#209D80" /> : <ChevronDown size={20} color="#209D80" />}
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
                                    <ReceptionCard
                                        key={c.id}
                                        name={c.customerName}
                                        phone={c.phone}
                                        avatar={c.avatar}
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
                                        <PlusCircle size={16} color="#209D80" strokeWidth={2.25} />
                                    </span>
                                    <span>Tạo mới khách hàng</span>
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
                                sourceOrder={order.sourceOrder}
                                serviceSummary={order.serviceSummary}
                                totalAmount={order.totalAmount}
                                paymentEnabled={order.paymentEnabled}
                                paymentButtonLabel={
                                    order.status === ORDER_STATUS.PAID ? 'Đã thanh toán' : 'Tổng hóa đơn'
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
                                <PlusCircle size={32} color="#209D80" />
                            </span>
                            <span>Tạo mới khách hàng</span>
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
                            <div className="to-modal-field">
                                <label className="to-modal-label">Khách hàng <span className="to-modal-req">*</span></label>
                                <input
                                    type="text"
                                    className="to-modal-input"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div className="to-modal-field">
                                <label className="to-modal-label">Số điện thoại <span className="to-modal-req">*</span></label>
                                <input
                                    type="text"
                                    className="to-modal-input"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                        </div>

                        <div className="to-modal-actions">
                            <button className="to-modal-btn-cancel" onClick={() => setShowNewCustomerModal(false)}>Hủy bỏ</button>
                            <button
                                className="to-modal-btn-submit"
                                onClick={handleCreateCustomer}
                                disabled={isCreatingCustomer}
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
