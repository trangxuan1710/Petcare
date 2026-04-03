import React, { useState } from 'react';
import './StaffPaymentModal.css';
import { Button } from 'semantic-ui-react';

const StaffPaymentModal = ({
    open,
    onClose,
    onConfirm,
    remainAmount = '0đ',
    paymentMethods = [],
    isSubmitting = false,
    defaultNote = 'Thanh toán tiền khám',
}) => {
    // const [actionType, setActionType] = useState('thu_tien'); // 'thu_tien', 'tam_ung', 'hoan_tien'
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState(defaultNote);
    const [paymentMethod, setPaymentMethod] = useState('');

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
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền"
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
                    <Button className="btn-cancel" onClick={onClose}>
                        Hủy bỏ
                    </Button>
                    <Button className="btn-confirm" onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StaffPaymentModal;
