import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';
import StaffTopHeader from '../../components/staffs/StaffTopHeader';
import StaffPaymentInfoCard from '../../components/staffs/StaffPaymentInfoCard';
import StaffCostSummaryCard from '../../components/staffs/StaffCostSummaryCard';
import StaffPaymentFooterBar from '../../components/staffs/StaffPaymentFooterBar';
import StaffPaymentModal from '../../components/staffs/StaffPaymentModal';

const Payment = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="staff-payment-page">
            <div className="staff-payment-shell">
                <StaffTopHeader
                    title="Thanh toán"
                    onBack={() => navigate(-1)}
                    size="normal"
                    rightNode={<div className="staff-payment-avatar" aria-label="Nhân viên" />}
                />

                <div className="staff-payment-content">
                    <StaffPaymentInfoCard />
                    <StaffCostSummaryCard />
                </div>
            </div>

            <StaffPaymentFooterBar onPayClick={() => setIsModalOpen(true)} />

            <StaffPaymentModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    setIsModalOpen(false);
                    // Add your confirm logic here
                }}
            />
        </div>
    );
};

export default Payment;
