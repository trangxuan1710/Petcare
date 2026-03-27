import React, { useState } from 'react';
import './StaffPaymentFooterBar.css';
import { Button } from 'semantic-ui-react';

const StaffPaymentFooterBar = ({ onPayClick }) => {
    const [pressed, setPressed] = useState('');

    const handlePress = (value) => {
        setPressed(value);
        window.setTimeout(() => setPressed(''), 140);
        if (value === 'pay' && onPayClick) {
            onPayClick();
        }
    };

    return (
        <footer className="staff-payment-footer">
            <div className="staff-payment-footer-shell">
                <div className="remain-row">
                    <span>Còn lại phải thu</span>
                    <strong>750.000đ</strong>
                </div>
                <div className="footer-actions">
                    <Button
                        type="button"
                        className={`btn-outline ${pressed === 'back' ? 'is-pressed' : ''}`}
                        onClick={() => handlePress('back')}
                    >
                        Trở lại
                    </Button>
                    <Button
                        type="button"
                        className={`btn-primary ${pressed === 'pay' ? 'is-pressed' : ''}`}
                        onClick={() => handlePress('pay')}
                    >
                        Thu tiền
                    </Button>
                </div>
            </div>
        </footer>
    );
};

export default StaffPaymentFooterBar;
