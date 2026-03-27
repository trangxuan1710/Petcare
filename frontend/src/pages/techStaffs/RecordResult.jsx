import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Cake, Mars, Phone, Weight } from 'lucide-react';
import TechRecordHeader from '../../components/techStaffs/TechRecordHeader';
import TechAttachmentPanel from '../../components/techStaffs/TechAttachmentPanel';
import TechMedicinePanel from '../../components/techStaffs/TechMedicinePanel';
import TechExecutionCard from '../../components/techStaffs/TechExecutionCard';
import './RecordResult.css';

const medicineItems = [
    { id: 1, name: 'Dai trang Truong Phuc', price: '120.000d', unit: 'hop', qty: 1, morning: '1 vien', evening: '1 vien', note: 'Uong truoc khi an' },
    { id: 2, name: 'Dai trang Truong Phuc', price: '120.000d', unit: 'hop', qty: 1, morning: '1 vien', evening: '1 vien', note: 'Uong truoc khi an' },
    { id: 3, name: 'Dai trang Truong Phuc', price: '120.000d', unit: 'hop', qty: 1, morning: '1 vien', evening: '1 vien', note: 'Uong truoc khi an' }
];

const imageMock = [
    'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=720&q=80',
    null
];

const fileMock = ['PKQ-2147175.pdf', 'PKQ-2147175.pdf'];

const TechRecordResult = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [resultText, setResultText] = useState('Ho co dom, kho khe. Vom hong sung tay');

    return (
        <div className="tech-record-page">
            <TechRecordHeader onBack={() => navigate(-1)} />

            <main className="tech-record-content">
                <section className="tech-patient-section">
                    <h2>Nguyen Anh Duc</h2>
                    <div className="tech-phone"><Phone size={14} /> 0912345678</div>
                    <div className="tech-ticket-id">Phieu ky thuat #{id}</div>

                    <div className="tech-pet-line">
                        <strong>Kuro</strong>
                        <span>Cho Poodle <Mars size={12} color="#3b82f6" /></span>
                        <span><Cake size={13} /> 3 Tuoi</span>
                        <span><Weight size={13} /> 4.5kg</span>
                    </div>
                </section>

                <section className="tech-result-block">
                    <h3>Ket qua chung <span>*</span></h3>
                    <div className="tech-result-input-wrap">
                        <textarea
                            value={resultText}
                            onChange={(event) => setResultText(event.target.value)}
                            rows={5}
                        />
                        <small>2000</small>
                    </div>
                </section>

                <TechAttachmentPanel images={imageMock} files={fileMock} />

                <TechMedicinePanel items={medicineItems} />

                <TechExecutionCard
                    title="Xet nghiem mau"
                    status="Dang thuc hien"
                    requester="Nguyen Van An"
                    operator="Trinh Ha Trang"
                    startTime="12:01 - 02/03/2026"
                    endTime="Chua ket thuc"
                />
            </main>

            <footer className="tech-record-footer">
                <button type="button" className="tech-btn-outline" onClick={() => navigate('/techs/home')}>
                    Huy bo
                </button>
                <button type="button" className="tech-btn-primary" onClick={() => navigate('/techs/home')}>
                    Xac nhan
                </button>
            </footer>
        </div>
    );
};

export default TechRecordResult;
