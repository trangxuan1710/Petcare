import React, { useState } from 'react';
import './StaffPaymentFooterBar.css';

const StaffPaymentFooterBar = ({
    onPrimaryClick,
    onBackClick,
    remainAmount = '0đ',
    primaryLabel = 'Xác nhận',
    isPrimaryDisabled = false,
    isPrimaryLoading = false,
}) => {
    const [pressed, setPressed] = useState('');

    const handlePress = (value) => {
        if (value === 'primary' && (isPrimaryDisabled || isPrimaryLoading)) {
            return;
        }

        setPressed(value);
        window.setTimeout(() => setPressed(''), 140);

        if (value === 'back' && onBackClick) {
            onBackClick();
        }

        if (value === 'primary' && onPrimaryClick) {
            onPrimaryClick();
        }
    };

    return (
        <footer className="staff-payment-footer">
            <div className="staff-payment-footer-shell">
                <div className="remain-row">
                    <span style={{fontSize:1.2+'rem'}}>Tổng tiền</span>
                    <strong>{remainAmount}</strong>
                </div>
                <div className="footer-actions">
                    <button
                        type="button"
                        className={`btn-base btn-outline ${pressed === 'back' ? 'is-pressed' : ''}`}
                        onClick={() => handlePress('back')}
                    >
                        Trở lại
                    </button>
                    <button
                        type="button"
                        className={`btn-base btn-primary ${pressed === 'primary' ? 'is-pressed' : ''}`}
                        onClick={() => handlePress('primary')}
                        disabled={isPrimaryDisabled || isPrimaryLoading}
                    >
                        {isPrimaryLoading ? 'Đang xử lý...' : primaryLabel}
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default StaffPaymentFooterBar;
