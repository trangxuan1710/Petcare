import React, { useMemo, useState } from 'react';
import ReceptionistLayout from '../../layouts/ReceptionistLayout';
import ReceivedCard from '../../components/receptionist/ReceivedCard';
import './ClinicalQueue.css';

const queueData = [
    {
        id: 1,
        customerName: 'Nguyễn Anh Đức',
        phone: '0912345678',
        status: 'Đang chờ khám',
        createdAt: 'Xếp hàng lúc 10:03 - 20/03/2026',
        pets: [{ name: 'Kuro', breed: 'Chó Poodle', gender: 'male', age: '3 Tuổi', weight: '4.5kg' }],
        sourceOrder: '2141441',
        paymentEnabled: false,
        hideSource: false,
        queueNo: 'Q01',
        doctor: 'BS. Hà Huy An'
    },
    {
        id: 2,
        customerName: 'Lê Huyền Linh',
        phone: '0816278274',
        status: 'Đang thực hiện',
        createdAt: 'Vào phòng khám lúc 10:16 - 20/03/2026',
        pets: [{ name: 'Mike', breed: 'Mèo Anh lông ngắn', gender: 'female', age: '2 Tuổi', weight: '2.5kg' }],
        sourceOrder: null,
        paymentEnabled: false,
        hideSource: true,
        queueNo: 'Q02',
        doctor: 'BS. Bình'
    },
    {
        id: 3,
        customerName: 'Trần Minh Hạnh',
        phone: '0902627274',
        status: 'Chờ kết luận',
        createdAt: 'Đang chờ kết quả cận lâm sàng',
        pets: [{ name: 'Peach', breed: 'Thỏ Mini', gender: 'female', age: '1 Tuổi', weight: '1.1kg' }],
        sourceOrder: '2141666',
        paymentEnabled: false,
        hideSource: false,
        queueNo: 'Q03',
        doctor: 'BS. Hà Huy An'
    }
];

const ClinicalQueue = () => {
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('all');

    const filtered = useMemo(() => {
        const text = keyword.trim().toLowerCase();
        return queueData.filter((item) => {
            const matchesKeyword = !text || `${item.customerName} ${item.phone} ${item.queueNo} ${item.doctor}`.toLowerCase().includes(text);
            const matchesStatus = status === 'all' || item.status === status;
            return matchesKeyword && matchesStatus;
        });
    }, [keyword, status]);

    return (
        <ReceptionistLayout>
            <div className="clinical-queue-page">
                <h1>Hàng đợi khám</h1>
                <p className="cq-subtitle">Theo dõi tình trạng lâm sàng để hướng dẫn bệnh nhân.</p>

                <div className="cq-controls">
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Tìm theo tên, số điện thoại, số thứ tự, bác sĩ"
                    />
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Đang chờ khám">Đang chờ khám</option>
                        <option value="Đang thực hiện">Đang thực hiện</option>
                        <option value="Chờ kết luận">Chờ kết luận</option>
                    </select>
                </div>

                <div className="cq-list">
                    {filtered.map((item) => (
                        <div key={item.id} className="cq-item-wrap">
                            <div className="cq-meta-row">
                                <span className="cq-queue">{item.queueNo}</span>
                                <span className="cq-doctor">{item.doctor}</span>
                            </div>
                            <ReceivedCard {...item} onPayment={() => {}} />
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="cq-empty">Không có phiếu khám phù hợp.</div>}
                </div>
            </div>
        </ReceptionistLayout>
    );
};

export default ClinicalQueue;
