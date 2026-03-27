import React, { useState } from 'react';
import { ChevronLeft, MoreVertical, Phone, Mars, Cake, Weight, ChevronUp, ChevronDown, Plus, Upload, Minus, PencilLine } from 'lucide-react';
import FeatureDevelopingModal from '../../components/common/FeatureDevelopingModal';
import './RecordResult.css';

const RecordResult = () => {
    const [isMedsExpanded, setIsMedsExpanded] = useState(true);
    const [conclusionText, setConclusionText] = useState('Ho có đờm, khò khè. Vòm họng sưng tấy');
    const [selectedConclusion, setSelectedConclusion] = useState(null);

    const [medsList, setMedsList] = useState([
        {
            id: 1,
            name: 'Đại tràng Trường Phúc',
            price: '120.000đ',
            unit: '/hộp',
            qty: 1,
            selectedUnit: 'hộp',
            dosage: [
                { time: 'Sáng', count: '1 viên' },
                { time: 'Tối', count: '1 viên' }
            ],
            note: 'Uống thuốc trước khi ăn'
        },
        {
            id: 2,
            name: 'Đại tràng Trường Phúc',
            price: '120.000đ',
            unit: '/hộp',
            qty: 1,
            selectedUnit: 'hộp',
            dosage: [
                { time: 'Sáng', count: '1 viên' },
                { time: 'Tối', count: '1 viên' }
            ],
            note: 'Uống thuốc trước khi ăn'
        },
        {
            id: 3,
            name: 'Đại tràng Trường Phúc',
            price: '120.000đ',
            unit: '/hộp',
            qty: 1,
            selectedUnit: 'hộp',
            dosage: [
                { time: 'Sáng', count: '1 viên' },
                { time: 'Tối', count: '1 viên' }
            ],
            note: 'Uống thuốc trước khi ăn'
        },
        {
            id: 4,
            name: 'Đại tràng Trường Phúc',
            price: '120.000đ',
            unit: '/hộp',
            qty: 1,
            selectedUnit: 'hộp',
            dosage: [
                { time: 'Sáng', count: '1 viên' },
                { time: 'Tối', count: '1 viên' }
            ],
            note: 'Uống thuốc trước khi ăn'
        }
    ]);
    const [showDosageModal, setShowDosageModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);

    const _updateQty = (id, delta) => {
        setMedsList(prevList => 
            prevList.map(med => {
                if (med.id === id) {
                    const newQty = med.qty + delta;
                    return { ...med, qty: newQty < 0 ? 0 : newQty };
                }
                return med;
            })
        );
    };

    const radioOptions = [
        { id: 1, label: 'Cận lâm sàng' },
        { id: 2, label: 'Điều trị nội trú' },
        { id: 3, label: 'Điều trị ngoại trú' },
        { id: 4, label: 'Kết thúc cho về' },
    ];

    return (
        <div className="record-result-page">
            {/* Header */}
            <header className="rr-header">
                <button className="rr-btn-icon"><ChevronLeft size={24} color="#1a1a1a" /></button>
                <h1 className="rr-title">Ghi nhận kết quả</h1>
                <button className="rr-btn-icon"><MoreVertical size={24} color="#1a1a1a" /></button>
            </header>

            <div className="rr-content">
                {/* Customer Details top section */}
                <div className="rr-customer-card">
                    <div className="rr-customer-row">
                        <div>
                            <h2 className="rr-customer-name">Nguyễn Anh Đức</h2>
                            <div className="rr-customer-phone">
                                <Phone size={14} className="rr-icon-phone" />
                                <span>0912345678</span>
                            </div>
                        </div>
                        <div className="rr-payment-info">
                            <span className="rr-paid">0đ</span>
                            <span className="rr-total">/1.000.000đ</span>
                        </div>
                    </div>
                    
                    <div className="rr-ticket-type-row">
                        <span className="rr-ticket-type">Phiếu khám lâm sàng</span>
                        <span className="rr-ticket-id">#2141441</span>
                    </div>

                    <div className="rr-pet-info-inline">
                        <span className="rr-pet-name">Kuro</span>
                        <span className="rr-pet-breed">Chó Poodle <Mars size={12} color="#3b82f6" style={{ display: 'inline', marginLeft: '2px' }} /></span>
                        <span className="rr-pet-stat"><Cake size={14} color="#888" /> 3 Tuổi</span>
                        <span className="rr-pet-stat"><Weight size={14} color="#888" /> 4.5kg</span>
                    </div>

                    {/* <div className="rr-emergency-tag">
                        Cấp cứu
                    </div> */}
                </div>

                {/* Exam Details Card */}
                <div className="rr-exam-details-card">
                    <div className="rr-exam-row">
                        <div>
                            <span className="rr-exam-title">Khám lâm sàng</span>
                            <div className="rr-exam-id">#2141441</div>
                        </div>
                        <div className="rr-exam-status-box">
                            <span className="rr-exam-status">Đang thực hiện</span>
                            <span className="rr-exam-time">13:01 - 12/03/2026</span>
                        </div>
                    </div>

                    <div className="rr-exam-info-row">
                        <span className="rr-exam-label">Người chỉ định</span>
                        <span className="rr-exam-value">Nguyễn Văn An</span>
                    </div>
                    <div className="rr-exam-info-row">
                        <span className="rr-exam-label">Người thực hiện</span>
                        <span className="rr-exam-value">Bùi Huy Đức</span>
                    </div>
                    <div className="rr-exam-info-row">
                        <span className="rr-exam-label">Thời gian bắt đầu</span>
                        <span className="rr-exam-value">13:21 - 12/03/2026</span>
                    </div>
                </div>

                {/* General Result Text Area */}
                <div className="rr-section-block">
                    <h3 className="rr-section-title">Kết quả chung <span className="rr-required">*</span></h3>
                    <div className="rr-textarea-wrapper">
                        <textarea 
                            className="rr-textarea"
                            value={conclusionText}
                            onChange={(e) => setConclusionText(e.target.value)}
                            rows={4}
                        />
                        <span className="rr-char-count">2000</span>
                    </div>
                </div>

                {/* Upload Button */}
                <button className="rr-upload-btn">
                    <Upload size={18} color="#666" />
                    <span>Tải lên file kết quả khám bệnh</span>
                </button>

                {/* Meds Accordion */}
                <div className="rr-accordion">
                    <div className="rr-accordion-header" onClick={() => setIsMedsExpanded(!isMedsExpanded)}>
                        <h3>THUỐC & VẬT TƯ ĐI KÈM</h3>
                        {isMedsExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                    </div>
                    {isMedsExpanded && (
                        <div className={`rr-accordion-content ${medsList.length === 0 ? 'rr-meds-empty' : 'rr-meds-list-container'}`}>
                            {medsList.length === 0 ? (
                                <button className="rr-add-btn">
                                    <Plus size={24} color="#fff" />
                                </button>
                            ) : (
                                <div className="rr-meds-list-minimal">
                                    {medsList.map(med => (
                                        <div key={med.id} className="rr-med-item-minimal">
                                            <div className="rr-med-row-header">
                                                <h4 className="rr-med-name-min">{med.name}</h4>
                                                <PencilLine size={16} color="#209D80" className="rr-med-edit-icon" />
                                            </div>
                                            <div className="rr-med-row-price">
                                                <div>
                                                    <span className="rr-med-price-min">{med.price}</span>
                                                    <span className="rr-med-unit-min"> {med.unit}</span>
                                                </div>
                                                <span className="rr-med-qty-min">{med.qty} {med.selectedUnit}</span>
                                            </div>
                                            
                                            {med.dosage.map((d, index) => (
                                                <div key={index} className="rr-med-row-dosage">
                                                    <span className="rr-dosage-lbl">{d.time}</span>
                                                    <span className="rr-dosage-val">{d.count}</span>
                                                </div>
                                            ))}

                                            <div className="rr-med-row-note">
                                                <span className="rr-note-lbl">Chỉ định khác</span>
                                                <span className="rr-note-val">{med.note}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Conclusions Radio Grid */}
                <div className="rr-section-block rr-mb-extra">
                    <h3 className="rr-section-title">Kết luận <span className="rr-required">*</span></h3>
                    <div className="rr-radio-grid">
                        {radioOptions.map(option => (
                            <label key={option.id} className="rr-radio-label">
                                <input 
                                    type="radio" 
                                    name="conclusion" 
                                    value={option.id}
                                    checked={selectedConclusion === option.id}
                                    onChange={() => setSelectedConclusion(option.id)}
                                />
                                <span className="rr-radio-custom"></span>
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="rr-bottom-actions">
                <button className="rr-btn-cancel">Hủy bỏ</button>
                <button className="rr-btn-confirm" onClick={() => setShowFeatureModal(true)}>Xác nhận</button>
            </div>

            {/* Dosage Modal Bottom Sheet */}
            {showDosageModal && (
                <>
                    <div className="rr-dosage-modal-overlay" onClick={() => setShowDosageModal(false)}></div>
                    <div className="rr-dosage-modal-content">
                        <div className="rr-dosage-modal-handle"></div>
                        <h2 className="rr-dosage-modal-title">Liều dùng</h2>
                        
                        <div className="rr-dosage-main-area">
                            {['Sáng', 'Trưa', 'Chiều', 'Tối'].map((time, idx) => (
                                <div key={time} className="rr-dosage-row">
                                    <span className="rr-dosage-label">{time}</span>
                                    <div className="rr-dosage-controls">
                                        <div className="rr-dosage-stepper">
                                            <button className="rr-dosage-step-btn">
                                                <Minus size={16} color="#666" />
                                            </button>
                                            <span className="rr-dosage-step-val">{idx % 2 === 0 ? 1 : 0}</span>
                                            <button className="rr-dosage-step-btn">
                                                <Plus size={16} color="#666" />
                                            </button>
                                        </div>
                                        <div className="rr-dosage-unit">
                                            <span>Viên</span>
                                            <ChevronDown size={16} color="#888" />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="rr-dosage-note-row">
                                <span className="rr-dosage-label">Chỉ định khác</span>
                                <div className="rr-dosage-textarea-box">
                                    <textarea 
                                        className="rr-dosage-textarea" 
                                        defaultValue="Uống thuốc trước khi ăn"
                                    ></textarea>
                                    <span className="rr-dosage-char-count">2000</span>
                                </div>
                            </div>
                        </div>

                        <div className="rr-dosage-bottom-action">
                            <button className="rr-dosage-btn-confirm-final" onClick={() => setShowDosageModal(false)}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </>
            )}

            <FeatureDevelopingModal open={showFeatureModal} onClose={() => setShowFeatureModal(false)} />
        </div>
    );
}

export default RecordResult;
