import React from 'react';
import './StaffCostSummaryCard.css';
import { Mars, Weight, ChevronDown } from 'lucide-react';

const defaultFeeRows = [
    {
        name: 'Khám lâm sàng',
        unit: '01/lượt',
        price: '0',
        discount: '0',
        amount: '0'
    },
    {
        name: 'Xét nghiệm máu',
        unit: '01/lượt',
        price: '550.000',
        discount: '50.000',
        amount: '500.000'
    },
    {
        name: 'Nexgard Spectra 0.5g - Hộp 3 viên',
        unit: '01/hộp',
        price: '450.000',
        discount: '0',
        amount: '450.000'
    }
];

const formatCurrency = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '0đ';
    return `${Number(value).toLocaleString('vi-VN')}đ`;
};

const StaffCostSummaryCard = ({
    petInfo = {
        name: 'Kuro',
        breed: 'Chó Poodle',
        weight: '4.5kg',
    },
    feeRows = defaultFeeRows,
    paymentSummary = {
        subtotal: 950000,
        discount: 50000,
        insurance: 200000,
        total: 750000,
    },
    paymentHistoryAmount = 0,
}) => {
    return (
        <section className="staff-cost-card">
            <h2 className="cost-card-title">Tổng hợp chi phí</h2>

            <div className="pet-chip">
                <span className="pet-chip-details">
                    <span className="pet-chip-name">{petInfo?.name || 'Thú cưng'}</span>
                    <span className="pet-chip-breed">
                        {petInfo?.breed || '--'}
                        <Mars size={12} color="#3b82f6" style={{ marginLeft: '4px' }} />
                    </span>
                    <span className="pet-chip-stat">
                        <Weight size={14} color="#888" />
                        {petInfo?.weight || '--'}
                    </span>
                </span>
            </div>

            <div className="cost-header-row">
                <span>SL/DVT</span>
                <span>Đơn giá</span>
                <span>Chiết khấu</span>
                <span>Thành tiền</span>
            </div>

            <div className="cost-total-row">
                <div className="left">
                    <ChevronDown size={20} />
                    <span>Tổng cộng</span>
                </div>
                <strong>{formatCurrency(paymentSummary?.subtotal)}</strong>
            </div>

            <div className="cost-group">
                <div className="cost-group-header">
                    <div className="group-meta">
                        <div className="group-title">
                            <ChevronDown size={20} />
                            <span>Phiếu khám</span>
                        </div>
                        <small className="group-sub">Bảo hiểm bồi thường</small>
                    </div>
                    <div className="group-amounts">
                        <strong>{formatCurrency(paymentSummary?.subtotal)}</strong>
                        <small>{formatCurrency(paymentSummary?.insurance)}</small>
                    </div>
                </div>

                {feeRows.map((row) => (
                    <div className="fee-item" key={row.name}>
                        <strong className="fee-item-name">{row.name}</strong>
                        <div className="fee-row">
                            <span className="fee-unit">{row.unit || '--'}</span>
                            <span>{row.price || '--'}</span>
                            <span>{row.discount || '--'}</span>
                            <span>{row.amount || '--'}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="payment-summary">
                <h3>Thanh toán</h3>
                <div className="payment-row"><span>Tổng thành tiền</span>{formatCurrency(paymentSummary?.subtotal)}</div>
                <div className="payment-row"><span>Chiết khấu</span>{formatCurrency(paymentSummary?.discount)}</div>
                <div className="payment-row"><span>Bảo hiểm bồi thường</span>{formatCurrency(paymentSummary?.insurance)}</div>
                <div className="payment-total"><span>Tổng thanh toán</span>{formatCurrency(paymentSummary?.total)}</div>
            </div>

            <div className="payment-history">
                <div className="history-head">
                    <span>Lịch sử thanh toán</span>
                    <strong>{formatCurrency(paymentHistoryAmount)}</strong>
                </div>
                <div className="history-empty">Chưa có dữ liệu</div>
            </div>
        </section>
    );
};

export default StaffCostSummaryCard;
