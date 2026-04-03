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
    const receptionStatus = location.state?.receptionStatus;

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
                const canLoadPaymentData = receptionStatus === 'chờ thanh toán' || receptionStatus === 'đã thanh toán';

                const [methodsRes, userRes] = await Promise.allSettled([
                    paymentService.getPaymentMethods(),
                    userService.getUsers(),
                ]);

                let previewRes = { status: 'fulfilled', value: { data: null, notFound: false } };

                if (canLoadPaymentData && receptionId) {
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

                if (!canLoadPaymentData) {
                    setPaymentError('Phiếu này chưa ở trạng thái thanh toán.');
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
    }, [receptionId, receptionStatus, reloadKey]);

    const goToTodayOrders = () => {
        navigate(RECEPTIONIST_PATHS.TODAY_ORDERS);
    };

    const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

    const paymentSummary = useMemo(() => {
        const subtotal = Number(invoicePreview?.totalAmount || 0);
        const paidAmount = 0;
        const remain = subtotal;
        return {
            subtotal,
            discount: 0,
            insurance: 0,
            total: remain,
            paidAmount,
        };
    }, [invoicePreview]);

    const feeRows = useMemo(() => [
        {
            name: 'Chi phí khám và điều trị',
            unit: '01/lượt',
            price: Number(invoicePreview?.totalAmount || 0).toLocaleString('vi-VN'),
            discount: '0',
            amount: Number(invoicePreview?.totalAmount || 0).toLocaleString('vi-VN'),
        },
    ], [invoicePreview]);

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
            await paymentService.createInvoice(invoicePayload);

            setIsModalOpen(false);
            showToast('success', 'Ghi nhận thanh toán thành công.');
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
                    onBack={goToTodayOrders}
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
                                time={invoicePreview?.createdAt || 'Chưa có thời gian lập hóa đơn'}
                                customer={{
                                    name: location.state?.customerName || 'Khách hàng',
                                    phone: location.state?.customerPhone || '--',
                                }}
                                cashier={cashierInfo}
                            />
                            <StaffCostSummaryCard
                                petInfo={{
                                    name: 'Thú cưng',
                                    breed: '--',
                                    age: '--',
                                    weight: '--',
                                }}
                                feeRows={feeRows}
                                paymentSummary={paymentSummary}
                                paymentHistoryAmount={paymentSummary.paidAmount}
                            />
                        </>
                    )}
                </div>
            </div>

            <StaffPaymentFooterBar
                onPayClick={() => setIsModalOpen(true)}
                onBackClick={goToTodayOrders}
                remainAmount={formatCurrency(paymentSummary.total)}
            />

            <StaffPaymentModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPayment}
                remainAmount={formatCurrency(paymentSummary.total)}
                paymentMethods={paymentMethods}
                isSubmitting={isSubmitting}
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
