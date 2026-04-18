import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';
import StaffCostSummaryCard from '../../components/receptionist/StaffCostSummaryCard';
import StaffPaymentFooterBar from '../../components/receptionist/StaffPaymentFooterBar';
import PrintInvoice from '../../components/receptionist/PrintInvoice';
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

const PAYMENT_STEP = {
    CONFIRM: 'confirm',
    PRINT: 'print',
};

const PAYMENT_METHOD_TYPE = {
    CASH: 'cash',
    TRANSFER: 'transfer',
};

const normalizeText = (value) =>
    String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const isTransferMethodName = (methodName) => {
    const normalized = normalizeText(methodName);
    return /(chuyen\s*khoan|transfer|bank|qr)/i.test(normalized);
};

const isCashMethodName = (methodName) => {
    const normalized = normalizeText(methodName);
    return /(tien\s*mat|cash)/i.test(normalized);
};

const toSupportedPaymentMethods = (methods) => {
    if (!Array.isArray(methods)) {
        return [];
    }

    const mappedMethods = methods
        .map((method) => {
            const methodName = String(method?.name || '').trim();
            if (!methodName || method?.id == null) {
                return null;
            }

            if (isCashMethodName(methodName)) {
                return { ...method, type: PAYMENT_METHOD_TYPE.CASH, label: 'Tiền mặt' };
            }

            if (isTransferMethodName(methodName)) {
                return { ...method, type: PAYMENT_METHOD_TYPE.TRANSFER, label: 'Chuyển khoản' };
            }

            return null;
        })
        .filter(Boolean);

    const uniqueByType = [];
    const seenTypes = new Set();

    for (const method of mappedMethods) {
        if (seenTypes.has(method.type)) {
            continue;
        }
        seenTypes.add(method.type);
        uniqueByType.push(method);
    }

    return uniqueByType;
};

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [invoicePreview, setInvoicePreview] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
    const [paymentStep, setPaymentStep] = useState(PAYMENT_STEP.CONFIRM);
    const [cashierId, setCashierId] = useState(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
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

                const previewData = previewRes.status === 'fulfilled' ? previewRes.value?.data || null : null;
                setInvoicePreview(previewData);

                const availableMethods = methodsRes.status === 'fulfilled' ? (methodsRes.value?.data || []) : [];
                setPaymentMethods(availableMethods);
                setPaymentStep(
                    String(previewData?.status || '').trim().toUpperCase() === 'PAID'
                        ? PAYMENT_STEP.PRINT
                        : PAYMENT_STEP.CONFIRM
                );
                setIsQrModalOpen(false);

                if (previewNotFound) {
                    showToast('success', 'Phiếu này chưa có dữ liệu hóa đơn để xác nhận thanh toán.');
                }

                const user = userRes.status === 'fulfilled' ? userRes.value?.data : null;
                if (user) {
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
            const isMedicine = String(item?.type || '').toUpperCase() === 'MEDICINE';
            const unitLabel = isMedicine ? 'hộp' : toVietnameseUnit(item?.unit);
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
        const serviceNameById = new Map();
        serviceItems.forEach((item, index) => {
            const sid = Number(item?.serviceId || item?.id || 0);
            if (!Number.isFinite(sid) || sid <= 0) return;
            serviceNameById.set(sid, item?.serviceName || item?.name || `Dich vu #${index + 1}`);
        });

        const serviceGroups = serviceItems.map((item, index) => {
            const feeRow = toFeeRow(item, index);
            return {
                id: `${item?.type || 'SERVICE'}-${item?.id || index}`,
                title: item?.serviceName || item?.name || `Dich vu #${index + 1}`,
                subtitle: 'Dich vu',
                insuranceAmount: Number(item?.insurance || 0),
                totalAmount: Number(item?.amount || 0),
                feeRows: [feeRow],
            };
        });

        const medicineGroups = medicineItems.reduce((acc, item, index) => {
            const sidRaw = Number(item?.serviceId || 0);
            const hasService = Number.isFinite(sidRaw) && sidRaw > 0;
            const key = hasService ? `service-${sidRaw}` : 'service-unknown';

            if (!acc[key]) {
                const serviceName = hasService
                    ? (item?.serviceName || serviceNameById.get(sidRaw) || `Dich vu #${sidRaw}`)
                    : 'Dich vu chua xac dinh';
                acc[key] = {
                    id: `medicine-group-${key}`,
                    title: `Thuoc & vat tu - ${serviceName}`,
                    subtitle: 'Ke don',
                    insuranceAmount: 0,
                    totalAmount: 0,
                    feeRows: [],
                };
            }

            const row = toFeeRow(item, index);
            acc[key].feeRows.push(row);
            acc[key].insuranceAmount += Number(row.insurance || 0);
            acc[key].totalAmount += Number(row.amount || 0);
            return acc;
        }, {});

        return [...serviceGroups, ...Object.values(medicineGroups)];
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

    const supportedPaymentMethods = useMemo(
        () => toSupportedPaymentMethods(paymentMethods),
        [paymentMethods]
    );

    useEffect(() => {
        if (supportedPaymentMethods.length === 0) {
            setSelectedPaymentMethodId('');
            return;
        }

        const selectedExists = supportedPaymentMethods.some(
            (method) => String(method.id) === String(selectedPaymentMethodId)
        );

        if (!selectedExists) {
            setSelectedPaymentMethodId(String(supportedPaymentMethods[0].id));
        }
    }, [supportedPaymentMethods, selectedPaymentMethodId]);

    const selectedPaymentMethod = useMemo(
        () => supportedPaymentMethods.find((method) => String(method?.id) === String(selectedPaymentMethodId)) || null,
        [supportedPaymentMethods, selectedPaymentMethodId]
    );

    const isTransferSelected = useMemo(
        () => selectedPaymentMethod?.type === PAYMENT_METHOD_TYPE.TRANSFER,
        [selectedPaymentMethod]
    );

    const vietQrImageSrc = useMemo(() => {
        if (!isTransferSelected) {
            return '';
        }

        const amount = Math.max(Number(paymentSummary.total || 0), 0);
        const addInfo = `PETCARE ${receptionId || invoicePreview?.id || ''}`.trim();
        return `https://img.vietqr.io/image/VCB-1028691068-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent('NGUYEN THI THU TRANG')}`;
    }, [
        paymentSummary.total,
        isTransferSelected,
        receptionId,
        invoicePreview,
    ]);

    const primaryLabel = paymentStep === PAYMENT_STEP.CONFIRM ? 'Xác nhận' : 'In hóa đơn';
    const footerAmount = paymentStep === PAYMENT_STEP.PRINT ? paymentSummary.subtotal : paymentSummary.total;

    const isPrimaryDisabled =
        isLoading ||
        isSubmitting ||
        (paymentStep === PAYMENT_STEP.CONFIRM && (!selectedPaymentMethodId || Number(paymentSummary.total || 0) <= 0));

    const submitPayment = async () => {
        if (isSubmitting) return;

        if (!selectedPaymentMethodId) {
            setPaymentError('Vui lòng chọn phương thức thanh toán.');
            showToast('error', 'Thiếu phương thức thanh toán.');
            return false;
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

            const invoicePayload = paymentService.buildInvoicePayload({
                medicalRecordId,
                paymentMethodId: selectedPaymentMethodId,
                totalAmount: remainAmount,
                receptionistId: cashierId,
                note: isTransferSelected ? 'Thanh toán chuyển khoản VCB' : 'Thanh toán tiền mặt tại quầy',
            });

            const invoiceId = Number(invoicePreview?.id || 0);
            if (invoiceId > 0) {
                await paymentService.patchInvoiceById(invoiceId, {
                    paymentMethod: { id: Number(selectedPaymentMethodId) },
                    receptionist: cashierId ? { id: Number(cashierId) } : undefined,
                    totalAmount: remainAmount,
                    status: 'PAID',
                    note: isTransferSelected ? 'Thanh toán chuyển khoản VCB' : 'Thanh toán tiền mặt tại quầy',
                });
            } else {
                await paymentService.createInvoice(invoicePayload);
            }

            setPaymentStep(PAYMENT_STEP.PRINT);
            setIsQrModalOpen(false);
            setInvoicePreview((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: 'PAID',
                };
            });
            showToast('success', 'Xác nhận thanh toán thành công. Vui lòng in hóa đơn.');
            return true;
        } catch (error) {
            const message = error?.message || 'Không thể ghi nhận thanh toán. Vui lòng thử lại.';
            setPaymentError(message);
            showToast('error', message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrimaryAction = () => {
        if (paymentStep === PAYMENT_STEP.CONFIRM) {
            if (isTransferSelected) {
                setIsQrModalOpen(true);
                return;
            }

            submitPayment();
            return;
        }

        handlePrintInvoice();
        showToast('success', 'Đã in hóa đơn. Hoàn tất thanh toán.');
        goToTodayOrders();
    };

    const handleConfirmTransferPayment = async () => {
        await submitPayment();
    };

    const handleRetryPaymentData = () => {
        setReloadKey((prev) => prev + 1);
        showToast('success', 'Đang tải lại dữ liệu thanh toán...');
    };

    return (
        <ReceptionistLayout>
        <div className="staff-payment-page">
            <div className="staff-payment-shell">
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
                            <StaffCostSummaryCard
                                petInfo={petInfo}
                                costGroups={costGroups}
                                paymentSummary={paymentSummary}
                                paymentHistoryAmount={paymentSummary.paidAmount}
                                showPaymentHistory={false}
                            />

                            <section className="staff-payment-method-card">
                                <p className="staff-payment-method-title">Phương thức thanh toán</p>
                                {supportedPaymentMethods.length > 0 ? (
                                    <div className="staff-payment-method-options" role="radiogroup" aria-label="Phương thức thanh toán">
                                        {supportedPaymentMethods.map((method) => (
                                            <label
                                                key={method.id}
                                                className={`staff-payment-method-option ${String(method.id) === String(selectedPaymentMethodId) ? 'is-selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={String(method.id)}
                                                    checked={String(method.id) === String(selectedPaymentMethodId)}
                                                    onChange={() => setSelectedPaymentMethodId(String(method.id))}
                                                    disabled={paymentStep === PAYMENT_STEP.PRINT || isSubmitting}
                                                />
                                                <span>{method.label || method.name || `Phương thức #${method.id}`}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="staff-payment-method-empty">Chưa có phương thức thanh toán khả dụng (cần Tiền mặt hoặc Chuyển khoản).</p>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>

            <StaffPaymentFooterBar
                onPrimaryClick={handlePrimaryAction}
                onBackClick={goBack}
                remainAmount={formatCurrency(footerAmount)}
                primaryLabel={primaryLabel}
                isPrimaryDisabled={isPrimaryDisabled}
                isPrimaryLoading={isSubmitting}
            />

            {isQrModalOpen && (
                <div
                    className="staff-payment-qr-modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mã QR chuyển khoản"
                    onClick={() => setIsQrModalOpen(false)}
                >
                    <div className="staff-payment-qr-modal" onClick={(event) => event.stopPropagation()}>
                        <h3>Quét mã VietQR để thanh toán</h3>
                        <p className="staff-payment-qr-subtitle">Ngân hàng VCB - STK 1028691068</p>
                        <p className="staff-payment-qr-account-name">NGUYEN THI THU TRANG</p>
                        <img src={vietQrImageSrc} alt="VietQR thanh toán" className="staff-payment-qr-image" />
                        <p className="staff-payment-qr-amount">Số tiền: {formatCurrency(paymentSummary.total)}</p>

                        <div className="staff-payment-qr-actions">
                            <button
                                type="button"
                                className="staff-payment-qr-btn staff-payment-qr-btn-outline"
                                onClick={() => setIsQrModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                className="staff-payment-qr-btn staff-payment-qr-btn-primary"
                                onClick={handleConfirmTransferPayment}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang xác nhận...' : 'Đã nhận chuyển khoản'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`staff-payment-toast staff-payment-toast-${toast.type}`} role="status" aria-live="polite">
                    {toast.message}
                </div>
            )}

            <PrintInvoice
                invoicePreview={invoicePreview}
                paymentSummary={paymentSummary}
                receptionistName={invoicePreview?.receptionist?.fullName || 'Thu ngân'}
                time={new Date().toLocaleString('vi-VN')}
            />
        </div>
        </ReceptionistLayout>
    );
};

export default Payment;


