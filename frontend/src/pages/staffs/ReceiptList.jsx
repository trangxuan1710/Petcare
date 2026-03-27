import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavBar from '../../components/staffs/StaffNavBar';
import './ReceiptList.css';

const receipts = [
    { id: 'PT001', customer: 'Nguyễn Anh Đức', amount: 1650000, type: 'Thu tiền khám', status: 'Đã thu', createdAt: '20/03/2026 10:30' },
    { id: 'PT002', customer: 'Lê Huyền Linh', amount: 450000, type: 'Tiền thuốc', status: 'Chờ thu', createdAt: '20/03/2026 10:45' }
];

const ReceiptList = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return receipts.filter((item) => {
            const matchesKeyword = !keyword || `${item.id} ${item.customer} ${item.type}`.toLowerCase().includes(keyword);
            const matchesStatus = status === 'all' || item.status === status;
            return matchesKeyword && matchesStatus;
        });
    }, [query, status]);

    return (
        <div className="receipt-list-page">
            <div className="receipt-content">
                <div className="receipt-header">
                    <h1>Phiếu thu</h1>
                    <button type="button" onClick={() => navigate('/staffs/payment')}>Tạo phiếu thu</button>
                </div>

                <div className="receipt-filters">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Tìm theo mã phiếu, khách hàng, loại thu"
                    />
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="Đã thu">Đã thu</option>
                        <option value="Chờ thu">Chờ thu</option>
                    </select>
                </div>

                <div className="receipt-cards">
                    {filtered.map((row) => (
                        <article key={row.id} className="receipt-card" onClick={() => navigate(`/staffs/receipt-list/${row.id}`)}>
                            <div>
                                <strong>{row.id} - {row.customer}</strong>
                                <p>{row.type}</p>
                                <small>{row.createdAt}</small>
                            </div>
                            <div className="receipt-right">
                                <span className={`receipt-status ${row.status === 'Đã thu' ? 'done' : ''}`}>{row.status}</span>
                                <b>{row.amount.toLocaleString('vi-VN')}đ</b>
                            </div>
                        </article>
                    ))}
                    {filtered.length === 0 && <div className="receipt-empty">Không có phiếu thu phù hợp.</div>}
                </div>
            </div>
            {/* <StaffNavBar /> */}
        </div>
    );
};

export default ReceiptList;
