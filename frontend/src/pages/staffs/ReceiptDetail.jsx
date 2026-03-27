import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StaffTopHeader from '../../components/staffs/StaffTopHeader';
import './ReceiptDetail.css';

const ReceiptDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="receipt-detail-page">
            <div className="receipt-detail-shell">
                <StaffTopHeader title={`Chi tiết ${id}`} onBack={() => navigate(-1)} />

                <section className="rd-box">
                    <h2>Thông tin phiếu thu</h2>
                    <div className="rd-row"><span>Mã phiếu</span><b>{id}</b></div>
                    <div className="rd-row"><span>Khách hàng</span><b>Nguyễn Anh Đức</b></div>
                    <div className="rd-row"><span>Loại thu</span><b>Tiền khám + tiền thuốc</b></div>
                    <div className="rd-row"><span>Tổng tiền</span><b>1.650.000đ</b></div>
                    <div className="rd-row"><span>Trạng thái</span><b>Đã thu</b></div>
                </section>

                <section className="rd-box">
                    <h2>Dịch vụ đã sử dụng</h2>
                    <ul>
                        <li>Khám lâm sàng</li>
                        <li>Xét nghiệm máu</li>
                        <li>Thuốc điều trị ngoại trú</li>
                    </ul>
                </section>

                <div className="rd-actions">
                    <button type="button">Sửa phiếu thu</button>
                    <button type="button" className="primary">In biên lai</button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetail;
