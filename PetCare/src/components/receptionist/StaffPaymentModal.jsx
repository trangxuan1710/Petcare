import React, { useEffect, useMemo, useState } from 'react';
import './StaffPaymentModal.css';

const StaffPaymentModal = ({
    open,
    onClose,
    onConfirm,
    remainAmount = '0đ',
    defaultAmount = 0,
    paymentMethods = [],
    isSubmitting = false,
    defaultNote = 'Thanh toán tiền khám',
    preferredPaymentMethodId = 1,
}) => {
    // const [actionType, setActionType] = useState('thu_tien'); // 'thu_tien', 'tam_ung', 'hoan_tien'
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState(defaultNote);
    const [paymentMethod, setPaymentMethod] = useState('');

    const numericDefaultAmount = useMemo(() => {
        const parsed = Number(defaultAmount);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }, [defaultAmount]);

    const formatThousands = (value) => Number(value || 0).toLocaleString('vi-VN');

    const normalizeAmountInput = (rawValue) => {
        const digits = String(rawValue || '').replace(/\D/g, '');
        if (!digits) return '';
        return formatThousands(Number(digits));
    };

    useEffect(() => {
        if (!open) return;

        setNote(defaultNote || 'Thanh toán tiền khám');
        setAmount(numericDefaultAmount > 0 ? formatThousands(numericDefaultAmount) : '');

        if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
            setPaymentMethod('');
            return;
        }

        const preferred = paymentMethods.find((method) => Number(method?.id) === Number(preferredPaymentMethodId));
        if (preferred?.id != null) {
            setPaymentMethod(String(preferred.id));
            return;
        }

        setPaymentMethod(String(paymentMethods[0]?.id || ''));
    }, [open, defaultNote, numericDefaultAmount, paymentMethods, preferredPaymentMethodId]);

    const handleConfirm = () => {
        if (!onConfirm) return;
        onConfirm({
            amount,
            note,
            paymentMethodId: paymentMethod,
        });
    };

    if (!open) return null;

    return (
        <div className="staff-modal-overlay" onClick={onClose}>
            <div
                className="staff-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="staff-modal-handle" />

                <h3 className="staff-modal-title">Thanh toán</h3>

                <div className="staff-modal-remain-box">
                    <span>Còn lại phải thu</span>
                    <strong>{remainAmount}</strong>
                </div>

                {/* <div className="staff-modal-radio-group action-type-group">
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="actionType"
                            checked={actionType === 'thu_tien'}
                            onChange={() => setActionType('thu_tien')}
                        />
                        <span className="custom-radio" />
                        Thu tiền
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="actionType"
                            checked={actionType === 'tam_ung'}
                            onChange={() => setActionType('tam_ung')}
                        />
                        <span className="custom-radio" />
                        Tạm ứng
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="actionType"
                            checked={actionType === 'hoan_tien'}
                            onChange={() => setActionType('hoan_tien')}
                        />
                        <span className="custom-radio" />
                        Hoàn tiền
                    </label>
                </div> */}

                <div className="staff-modal-field">
                    <label className="field-label">Số tiền <span>*</span></label>
                    <div className="input-with-currency">
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(normalizeAmountInput(e.target.value))}
                            placeholder="Nhập số tiền"
                            inputMode="numeric"
                        />
                        <div className="currency-selector">
                            <span>VND</span>
                            {/* <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                            </svg> */}
                        </div>
                    </div>
                </div>

                <div className="staff-modal-field">
                    <label className="field-label">Nội dung</label>
                    <input
                        type="text"
                        className="full-width-input"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="staff-modal-radio-group payment-method-group">
                    {paymentMethods.map((method) => (
                        <label className="radio-label" key={method.id}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={paymentMethod === String(method.id)}
                                onChange={() => setPaymentMethod(String(method.id))}
                            />
                            <span className="custom-radio" />
                            {method.name}
                        </label>
                    ))}
                </div>

                <div className="staff-modal-actions">
                    <button type="button" className="staff-modal-btn btn-cancel" onClick={onClose}>
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        className="staff-modal-btn btn-confirm"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffPaymentModal;
