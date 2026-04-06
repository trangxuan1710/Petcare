import React, { useState } from 'react';
import './StaffPaymentFooterBar.css';

const StaffPaymentFooterBar = ({ onPayClick, onBackClick, remainAmount = '0đ' }) => {
    const [pressed, setPressed] = useState('');

    const handlePress = (value) => {
        setPressed(value);
        window.setTimeout(() => setPressed(''), 140);
        if (value === 'back' && onBackClick) {
            onBackClick();
        }
        if (value === 'pay' && onPayClick) {
            onPayClick();
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
                        className={`btn-base btn-primary ${pressed === 'pay' ? 'is-pressed' : ''}`}
                        onClick={() => handlePress('pay')}
                    >
                        Thu tiền
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default StaffPaymentFooterBar;
