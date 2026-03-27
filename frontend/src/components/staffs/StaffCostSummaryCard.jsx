import React from 'react';
import './StaffCostSummaryCard.css';
import { PawPrint, Cake, Weight, ChevronDown } from 'lucide-react';

const feeRows = [
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

const StaffCostSummaryCard = () => {
    return (
        <section className="staff-cost-card">
            <h2 className="cost-card-title">Chi tiết hoá đơn</h2>

            <div className="pet-chip">
                <strong>Kuro</strong>
                <span>Chó Poodle</span>
                <span className="meta"><PawPrint size={14} /> 3 Tuổi</span>
                <span className="meta"><Weight size={14} /> 4.5kg</span>
                <span className="meta"><Cake size={14} /> </span>
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
                <strong>2.650.000đ</strong>
            </div>

            <div className="cost-group">
                <div className="cost-group-header">
                    <div>
                        <div className="group-title">
                            <ChevronDown size={20} />
                            <span>Phiếu khám</span>
                        </div>
                        <small>Bảo hiểm bồi thường</small>
                    </div>
                    <div className="group-amounts">
                        <strong>2.650.000đ</strong>
                        <small>200.000đ</small>
                    </div>
                </div>

                {feeRows.map((row) => (
                    <div className="fee-row" key={row.name}>
                        <div className="fee-name-col">
                            <strong>{row.name}</strong>
                            <span>{row.unit}</span>
                        </div>
                        <span>{row.price}</span>
                        <span>{row.discount}</span>
                        <span>{row.amount}</span>
                    </div>
                ))}
            </div>

            <div className="cost-group">
                <div className="cost-group-header">
                    <div>
                        <div className="group-title">
                            <ChevronDown size={20} />
                            <span>Điều trị nội trú</span>
                        </div>
                        <small>Bảo hiểm bồi thường</small>
                    </div>
                    <div className="group-amounts">
                        <strong>550.000đ</strong>
                        <small>200.000đ</small>
                    </div>
                </div>

                {feeRows.map((row) => (
                    <div className="fee-row" key={`${row.name}-internal`}>
                        <div className="fee-name-col">
                            <strong>{row.name}</strong>
                            <span>{row.unit}</span>
                        </div>
                        <span>{row.price}</span>
                        <span>{row.discount}</span>
                        <span>{row.amount}</span>
                    </div>
                ))}
            </div>

            <div className="payment-summary">
                <h3>Thanh toán</h3>
                <div className="payment-row"><span>Tổng thành tiền</span><strong>950.000đ</strong></div>
                <div className="payment-row"><span>Chiết khấu</span><strong>50.000đ</strong></div>
                <div className="payment-row"><span>Bảo hiểm bồi thường</span><strong>200.000đ</strong></div>
                <div className="payment-total"><span>Tổng thanh toán</span><strong>750.000đ</strong></div>
            </div>

            <div className="payment-history">
                <div className="history-head">
                    <span>Lịch sử thanh toán</span>
                    <strong>0đ</strong>
                </div>
                <div className="history-empty">Chưa có dữ liệu</div>
            </div>
        </section>
    );
};

export default StaffCostSummaryCard;
