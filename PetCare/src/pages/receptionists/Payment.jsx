import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';
import StaffTopHeader from '../../components/receptionist/StaffTopHeader';
import StaffPaymentInfoCard from '../../components/receptionist/StaffPaymentInfoCard';
import StaffCostSummaryCard from '../../components/receptionist/StaffCostSummaryCard';
import StaffPaymentFooterBar from '../../components/receptionist/StaffPaymentFooterBar';
import StaffPaymentModal from '../../components/receptionist/StaffPaymentModal';
import ReceptionistLayout from '../../layouts/ReceptionistLayout';
import { RECEPTIONIST_PATHS } from '../../routes/receptionistPaths';
import paymentService from '../../api/paymentService';
import userService from '../../api/userService';

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const UNIT_LABEL_MAP = {
    tablet: 'viên',
    tablets: 'viên',
    pill: 'viên',
    pills: 'viên',
    capsule: 'viên nang',
    capsules: 'viên nang',
    cap: 'viên nang',
    vial: 'lọ',
    bottle: 'chai',
    box: 'hộp',
    pack: 'gói',
    packet: 'gói',
    sachet: 'gói',
    tube: 'tuýp',
    ampoule: 'ống',
    ampule: 'ống',
    bag: 'túi',
    unit: 'đơn vị',
};

const toVietnameseUnit = (rawUnit) => {
    const normalized = String(rawUnit || '').trim().toLowerCase().replace(/^\//, '');
    if (!normalized) return 'đơn vị';
    return UNIT_LABEL_MAP[normalized] || normalized;
};

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [invoicePreview, setInvoicePreview] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [cashierInfo, setCashierInfo] = useState({ name: 'Thu ngân', phone: '--' });
    const [cashierId, setCashierId] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [toast, setToast] = useState(null);

    const receptionId = location.state?.receptionId;

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchPaymentData = async () => {
            setIsLoading(true);
            setPaymentError('');

            try {
                const [methodsRes, userRes] = await Promise.allSettled([
                    paymentService.getPaymentMethods(),
                    userService.getUsers(),
                ]);

                let previewRes = { status: 'fulfilled', value: { data: null, notFound: false } };

                if (receptionId) {
                    previewRes = await Promise.resolve(paymentService.getInvoicePreview(receptionId))
                        .then((value) => ({ status: 'fulfilled', value }))
                        .catch((reason) => ({ status: 'rejected', reason }));
                }

                if (!isMounted) return;

                const failedRequests = [];
                const previewNotFound = previewRes.status === 'fulfilled' && previewRes.value?.notFound;
                if (previewRes.status === 'rejected') failedRequests.push('xem trước hóa đơn');
                if (methodsRes.status === 'rejected') failedRequests.push('phương thức thanh toán');
                if (userRes.status === 'rejected') failedRequests.push('thông tin thu ngân');

                if (failedRequests.length > 0) {
                    const message = `Không thể tải đầy đủ dữ liệu: ${failedRequests.join(', ')}.`;
                    setPaymentError(message);
                    showToast('error', message);
                }

                setInvoicePreview(previewRes.status === 'fulfilled' ? previewRes.value?.data || null : null);
                setPaymentMethods(methodsRes.status === 'fulfilled' ? (methodsRes.value?.data || []).slice(0, 3) : []);

                if (previewNotFound) {
                    showToast('success', 'Phiếu này chưa có dữ liệu hóa đơn để xác nhận thanh toán.');
                }

                const user = userRes.status === 'fulfilled' ? userRes.value?.data : null;
                if (user) {
                    setCashierInfo({
                        name: user?.fullName || 'Thu ngân',
                        phone: user?.phoneNumber || '--',
                    });
                    setCashierId(user?.id || null);
                }
            } catch {
                if (!isMounted) return;
                setPaymentError('Không thể tải thông tin thanh toán.');
                showToast('error', 'Tải dữ liệu thanh toán thất bại.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPaymentData();

        return () => {
            isMounted = false;
        };
    }, [receptionId, reloadKey]);

    const goToTodayOrders = () => {
        navigate(RECEPTIONIST_PATHS.TODAY_ORDERS, { replace: true });
    };

    const goBack = () => {
        navigate(-1);
    };

    const handlePrintInvoice = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

    const chargeItems = useMemo(() => toArray(invoicePreview?.chargeItems), [invoicePreview]);

    const isInvoicePaid = useMemo(
        () => String(invoicePreview?.status || '').trim().toUpperCase() === 'PAID',
        [invoicePreview]
    );

    const paymentSummary = useMemo(() => {
        const subtotalFromItems = chargeItems.reduce(
            (sum, item) => sum + Number(item?.amount || 0),
            0
        );
        const subtotal = Number(invoicePreview?.totalAmount ?? subtotalFromItems);
        const discount = chargeItems.reduce(
            (sum, item) => sum + Number(item?.discount || 0),
            0
        );
        const insurance = chargeItems.reduce(
            (sum, item) => sum + Number(item?.insurance || 0),
            0
        );
        const paidAmount = isInvoicePaid ? subtotal : 0;
        const remain = Math.max(subtotal - paidAmount, 0);

        return {
            subtotal,
            discount,
            insurance,
            total: remain,
            paidAmount,
        };
    }, [chargeItems, invoicePreview, isInvoicePaid]);

    const costGroups = useMemo(() => {
        if (chargeItems.length === 0) {
            const fallbackAmount = Number(invoicePreview?.totalAmount || 0);
            if (fallbackAmount <= 0) {
                return [];
            }
            return [{
                id: 'fallback-total',
                title: 'Chi phí khám và điều trị',
                subtitle: 'Dịch vụ',
                insuranceAmount: 0,
                totalAmount: fallbackAmount,
                feeRows: [{
                    name: 'Chi phí khám và điều trị',
                    unit: '01/lượt',
                    price: fallbackAmount,
                    discount: 0,
                    amount: fallbackAmount,
                }],
            }];
        }

        const toFeeRow = (item, index) => {
            const quantity = Math.max(Number(item?.quantity || 1), 1);
            const unitLabel = toVietnameseUnit(item?.unit);
            const unitDisplay = `${String(quantity).padStart(2, '0')}/${unitLabel}`;
            return {
                name: item?.name || `Dịch vụ #${index + 1}`,
                unit: unitDisplay,
                price: Number(item?.unitPrice || 0),
                discount: Number(item?.discount || 0),
                insurance: Number(item?.insurance || 0),
                amount: Number(item?.amount || 0),
                type: String(item?.type || '').toUpperCase(),
            };
        };

        const serviceItems = chargeItems.filter((item) => String(item?.type || '').toUpperCase() === 'SERVICE');
        const medicineItems = chargeItems.filter((item) => String(item?.type || '').toUpperCase() === 'MEDICINE');

        if (serviceItems.length === 0) {
            const medicineRows = medicineItems.map(toFeeRow);
            const totalAmount = medicineRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
            const insuranceAmount = medicineRows.reduce((sum, row) => sum + Number(row.insurance || 0), 0);
            return [{
                id: 'medicine-group',
                title: 'Thuốc & vật tư',
                subtitle: 'Thuốc & vật tư',
                insuranceAmount,
                totalAmount,
                feeRows: medicineRows,
            }];
        }

        const serviceGroups = serviceItems.map((item, index) => {
            const feeRow = toFeeRow(item, index);
            return {
                id: `${item?.type || 'SERVICE'}-${item?.id || index}`,
                title: item?.name || `Dịch vụ #${index + 1}`,
                subtitle: 'Dịch vụ',
                insuranceAmount: Number(item?.insurance || 0),
                totalAmount: Number(item?.amount || 0),
                feeRows: [feeRow],
            };
        });

        if (medicineItems.length > 0) {
            const targetServiceIndex = serviceGroups.findIndex((group) => /khám/i.test(String(group?.title || '')));
            const attachIndex = targetServiceIndex >= 0 ? targetServiceIndex : 0;
            const medicineRows = medicineItems.map(toFeeRow);
            const medicineTotal = medicineRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
            const medicineInsurance = medicineRows.reduce((sum, row) => sum + Number(row.insurance || 0), 0);

            serviceGroups[attachIndex] = {
                ...serviceGroups[attachIndex],
                subtitle: 'Dịch vụ & thuốc',
                totalAmount: Number(serviceGroups[attachIndex].totalAmount || 0) + medicineTotal,
                insuranceAmount: Number(serviceGroups[attachIndex].insuranceAmount || 0) + medicineInsurance,
                feeRows: [...serviceGroups[attachIndex].feeRows, ...medicineRows],
            };
        }

        return serviceGroups;
    }, [chargeItems, invoicePreview]);

    const petInfo = useMemo(() => {
        const backendPet = invoicePreview?.pet;
        const weight = backendPet?.weight;

        return {
            name: backendPet?.name || 'Thú cưng',
            breed: backendPet?.breed || backendPet?.species || '--',
            gender: backendPet?.gender || null,
            weight: weight == null || weight === '' ? '--' : `${weight}kg`,
        };
    }, [invoicePreview]);

    const customerInfo = useMemo(() => {
        const backendCustomer = invoicePreview?.customer;
        return {
            name: backendCustomer?.fullName || location.state?.customerName || 'Khách hàng',
            phone: backendCustomer?.phoneNumber || location.state?.customerPhone || '--',
        };
    }, [invoicePreview, location.state]);

    const previewTimeLabel = useMemo(() => {
        const raw = invoicePreview?.createdAt || invoicePreview?.receptionTime;
        if (!raw) return 'Chưa có thời gian lập hóa đơn';
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return 'Chưa có thời gian lập hóa đơn';
        return date.toLocaleString('vi-VN');
    }, [invoicePreview]);

    const handleConfirmPayment = async ({ amount, note, paymentMethodId }) => {
        if (isSubmitting) return;

        const amountValue = Number(String(amount || '').replace(/\D/g, ''));
        if (!paymentMethodId) {
            setPaymentError('Vui lòng chọn phương thức thanh toán.');
            showToast('error', 'Thiếu phương thức thanh toán.');
            return;
        }
        if (!amountValue || amountValue <= 0) {
            setPaymentError('Vui lòng nhập số tiền hợp lệ.');
            showToast('error', 'Số tiền thanh toán không hợp lệ.');
            return;
        }

        setIsSubmitting(true);
        setPaymentError('');
        try {
            const remainAmount = Number(paymentSummary.total || 0);
            const medicalRecordId = invoicePreview?.medicalRecord?.id || invoicePreview?.medicalRecordId;
            const canCreateInvoice = Boolean(medicalRecordId);

            if (!canCreateInvoice) {
                throw new Error('Phiếu hiện chưa đủ dữ liệu để xác nhận thanh toán.');
            }

            if (remainAmount <= 0) {
                throw new Error('Phiếu này đã được thanh toán đủ.');
            }

            if (amountValue < remainAmount) {
                throw new Error('Số tiền xác nhận thanh toán phải lớn hơn hoặc bằng số tiền còn lại.');
            }

            const invoicePayload = paymentService.buildInvoicePayload({
                medicalRecordId,
                paymentMethodId,
                totalAmount: remainAmount,
                receptionistId: cashierId,
                note,
            });

            const invoiceId = Number(invoicePreview?.id || 0);
            if (invoiceId > 0) {
                await paymentService.patchInvoiceById(invoiceId, {
                    paymentMethod: { id: Number(paymentMethodId) },
                    receptionist: cashierId ? { id: Number(cashierId) } : undefined,
                    totalAmount: remainAmount,
                    status: 'PAID',
                    note: note || 'Thanh toán tại quầy',
                });
            } else {
                await paymentService.createInvoice(invoicePayload);
            }

            setIsModalOpen(false);
            showToast('success', 'Ghi nhận thanh toán thành công.');
            setReloadKey((prev) => prev + 1);
            goToTodayOrders();
        } catch (error) {
            const message = error?.message || 'Không thể ghi nhận thanh toán. Vui lòng thử lại.';
            setPaymentError(message);
            showToast('error', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetryPaymentData = () => {
        setReloadKey((prev) => prev + 1);
        showToast('success', 'Đang tải lại dữ liệu thanh toán...');
    };

    return (
        <ReceptionistLayout>
        <div className="staff-payment-page">
            <div className="staff-payment-shell">
                <StaffTopHeader
                    title="Thanh toán"
                    onBack={goBack}
                    size="normal"
                    rightNode={<div className="staff-payment-avatar" aria-label="Nhân viên" />}
                />

                {paymentError && (
                    <div className="staff-payment-error-row">
                        <p className="staff-payment-error">{paymentError}</p>
                        <button type="button" className="staff-payment-retry-btn" onClick={handleRetryPaymentData}>Thử lại</button>
                    </div>
                )}

                <div className="staff-payment-content">
                    {isLoading ? (
                        <>
                            <div className="staff-payment-skeleton-card" aria-hidden="true">
                                <div className="staff-payment-skeleton-line staff-payment-skeleton-line-lg"></div>
                                <div className="staff-payment-skeleton-line"></div>
                                <div className="staff-payment-skeleton-line staff-payment-skeleton-line-sm"></div>
                            </div>
                            <div className="staff-payment-skeleton-card" aria-hidden="true">
                                <div className="staff-payment-skeleton-line staff-payment-skeleton-line-lg"></div>
                                <div className="staff-payment-skeleton-line"></div>
                                <div className="staff-payment-skeleton-line"></div>
                                <div className="staff-payment-skeleton-line staff-payment-skeleton-line-sm"></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <StaffPaymentInfoCard
                                time={previewTimeLabel}
                                customer={customerInfo}
                                cashier={cashierInfo}
                                onPrintInvoice={handlePrintInvoice}
                            />
                            <StaffCostSummaryCard
                                petInfo={petInfo}
                                costGroups={costGroups}
                                paymentSummary={paymentSummary}
                                paymentHistoryAmount={paymentSummary.paidAmount}
                            />
                        </>
                    )}
                </div>
            </div>

            <StaffPaymentFooterBar
                onPayClick={() => setIsModalOpen(true)}
                onBackClick={goBack}
                remainAmount={formatCurrency(paymentSummary.total)}
            />

            <StaffPaymentModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPayment}
                remainAmount={formatCurrency(paymentSummary.total)}
                defaultAmount={paymentSummary.total}
                paymentMethods={paymentMethods}
                isSubmitting={isSubmitting}
                preferredPaymentMethodId={1}
            />

            {toast && (
                <div className={`staff-payment-toast staff-payment-toast-${toast.type}`} role="status" aria-live="polite">
                    {toast.message}
                </div>
            )}
        </div>
        </ReceptionistLayout>
    );
};

export default Payment;
