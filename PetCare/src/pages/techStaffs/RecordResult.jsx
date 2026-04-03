import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronUp, ChevronDown, Plus, PencilLine } from 'lucide-react';
import { TECH_PATHS } from '../../routes/techPaths';
import './RecordResult.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';

const detailSections = [
    {
        id: 1,
        title: 'Xét nghiệm máu',
        subtitle: 'Phiếu kỹ thuật #',
        summary: 'Ho có đờm, khò khè. Vòm họng sưng tấy.',
        hasUploads: true
    },
    {
        id: 2,
        title: 'Siêu âm ổ bụng',
        subtitle: 'Phiếu kỹ thuật #',
        summary: 'Các chỉ số xét nghiệm bình thường.',
        hasUploads: true
    }
];

const usedMedicine = [
    {
        id: 1,
        name: 'Đại tràng Trương Phúc',
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
        name: 'Kháng sinh A',
        price: '80.000đ',
        unit: '/hộp',
        qty: 2,
        selectedUnit: 'hộp',
        dosage: [
            { time: 'Sáng', count: '1 viên' },
            { time: 'Chiều', count: '1 viên' }
        ],
        note: 'Uống sau bữa ăn'
    }
];

const TechRecordResult = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [expandedSections, setExpandedSections] = useState(() =>
        detailSections.reduce((state, section) => ({ ...state, [section.id]: true }), {})
    );

    const toggleSectionMeds = (sectionId) => {
        setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    return (
        <div className="trs-page">
            <header className="trs-header">
                <button className="trs-icon-btn" type="button" onClick={() => navigate(TECH_PATHS.HOME)} aria-label="Quay lai">
                    <ChevronLeft size={24} />
                </button>
                <h1>Ghi nhận kết quả</h1>
            </header>

            <main className="trs-content">
                {detailSections.map((section) => (
                    <article className="trs-card" key={section.id}>
                        <div className="trs-card-title-row">
                            <div>
                                <h3>{section.title}</h3>
                                <p className="trs-subtitle">
                                    {section.subtitle}
                                    {id}
                                </p>
                            </div>
                            <ChevronUp size={18} color="#606b67" />
                        </div>

                        <div className="trs-divider" />

                        <div className="trs-block">
                            <h4>Kết quả chung</h4>
                            <p>{section.summary}</p>
                        </div>

                        {section.hasUploads && (
                            <>
                                <div className="trs-block">
                                    <h4 className="trs-block-files-title">File và ảnh tải lên</h4>
                                    <div className="trs-images">
                                        <div className="trs-image-card">
                                            <strong>Ảnh kết quả 1</strong>
                                            <img src="https://images.unsplash.com/photo-1583512603806-077998240c7a?w=600&auto=format&fit=crop&q=60" alt="Anh ket qua 1" />
                                        </div>
                                        <div className="trs-image-card">
                                            <strong>Ảnh kết quả 2</strong>
                                            <img src="https://images.unsplash.com/photo-1583512603806-077998240c7a?w=600&auto=format&fit=crop&q=60" alt="Anh ket qua 2" />
                                        </div>
                                    </div>
                                    <div className="trs-files">
                                        <div>PKQ-{id || '2147175'}.pdf</div>
                                        <div className="trs-divider" />
                                        <div>PKQ-{id || '2147175'}-2.pdf</div>
                                    </div>
                                </div>

                                <div className="trs-accordion">
                                    <div className="trs-accordion-header" onClick={() => toggleSectionMeds(section.id)}>
                                        <h3>THUỐC & VẬT TƯ ĐI KÈM</h3>
                                        {expandedSections[section.id] ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                                    </div>

                                    {expandedSections[section.id] && (
                                        <div className={`trs-accordion-content ${usedMedicine.length === 0 ? 'trs-meds-empty' : 'trs-meds-list-container'}`}>
                                            {usedMedicine.length === 0 ? (
                                                <button type="button" className="trs-add-btn" aria-label="Thêm thuốc">
                                                    <Plus size={24} color="#fff" />
                                                </button>
                                            ) : (
                                                <div className="trs-meds-list-minimal">
                                                    {usedMedicine.map((med) => (
                                                        <div key={`${section.id}-${med.id}`} className="trs-med-item-minimal">
                                                            <div className="trs-med-row-header">
                                                                <h4 className="trs-med-name-min">{med.name}</h4>
                                                                <PencilLine size={16} color="#209D80" className="trs-med-edit-icon" />
                                                            </div>

                                                            <div className="trs-med-row-price">
                                                                <div>
                                                                    <span className="trs-med-price-min">{med.price}</span>
                                                                    <span className="trs-med-unit-min"> {med.unit}</span>
                                                                </div>
                                                                <span className="trs-med-qty-min">
                                                                    {med.qty} {med.selectedUnit}
                                                                </span>
                                                            </div>

                                                            {med.dosage.map((dosage, dosageIndex) => (
                                                                <div key={dosageIndex} className="trs-med-row-dosage">
                                                                    <span className="trs-dosage-lbl">{dosage.time}</span>
                                                                    <span className="trs-dosage-val">{dosage.count}</span>
                                                                </div>
                                                            ))}

                                                            <div className="trs-med-row-note">
                                                                <span className="trs-note-lbl">Chỉ định khác</span>
                                                                <span className="trs-note-val">{med.note}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </article>
                ))}
            </main>

            <footer className="trs-footer">
                <button type="button" className="trs-btn-outline" onClick={() => navigate(TECH_PATHS.HOME)}>
                    Trở lại
                </button>
                <button type="button" className="trs-btn-primary" onClick={() => navigate(TECH_PATHS.HOME)}>
                    Xác nhận
                </button>
            </footer>
        </div>
    );
};

export default TechRecordResult;
