import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronUp } from 'lucide-react';
import './ResultSummary.css';

const detailSections = [
    {
        id: 1,
        title: 'Khám lâm sàng',
        subtitle: '',
        summary: 'Các chỉ số xét nghiệm bình thường',
        hasUploads: false
    },
    {
        id: 2,
        title: 'Cận lâm sàng',
        subtitle: 'Siêu âm ổ bụng',
        summary: 'Các chỉ số xét nghiệm bình thường',
        hasUploads: true
    },
    {
        id: 3,
        title: 'Cận lâm sàng',
        subtitle: 'Chụp X-Quang chi sau',
        summary: 'Bình thường',
        hasUploads: true
    }
];

const usedMedicine = [
    {
        id: 1,
        name: 'Nexgard Spectra 0.5G',
        pack: '3 vỉ x 10 viên',
        expected: '2 viên',
        actual: '3 viên',
        image: 'https://placehold.co/80x80/e7f3ef/1a9c82?text=Med'
    },
    {
        id: 2,
        name: 'Nexgard Spectra 0.5G',
        pack: '3 vỉ x 10 viên',
        expected: '2 viên',
        actual: '3 viên',
        image: 'https://placehold.co/80x80/e7f3ef/1a9c82?text=Med'
    }
];

const ResultSummary = () => {
    const navigate = useNavigate();

    return (
        <div className="rs-page">
            <header className="rs-header">
                <button className="rs-icon-btn" type="button" onClick={() => navigate(-1)} aria-label="Quay lại">
                    <ChevronLeft size={24} />
                </button>
                <h1>Tổng hợp kết quả</h1>
            </header>

            <main className="rs-content">
                {detailSections.map((section) => (
                    <article className="rs-card" key={section.id}>
                        <div className="rs-card-title-row">
                            <div>
                                <h3>{section.title}</h3>
                                {section.subtitle && <p className="rs-subtitle">{section.subtitle}</p>}
                            </div>
                            <ChevronUp size={18} color="#606b67" />
                        </div>

                        <div className="rs-divider" />

                        <div className="rs-block">
                            <h4>Kết quả chung</h4>
                            <p>{section.summary}</p>
                        </div>

                        {section.hasUploads && (
                            <>
                                <div className="rs-block">
                                    <h4>File và ảnh tải lên</h4>
                                    <div className="rs-images">
                                        <div className="rs-image-card">
                                            <strong>Ảnh kết quả 1</strong>
                                            <img src="https://images.unsplash.com/photo-1583512603806-077998240c7a?w=600&auto=format&fit=crop&q=60" alt="Ảnh kết quả 1" />
                                        </div>
                                        <div className="rs-image-card">
                                            <strong>Ảnh kết quả 2</strong>
                                            <img src="https://images.unsplash.com/photo-1583512603806-077998240c7a?w=600&auto=format&fit=crop&q=60" alt="Ảnh kết quả 2" />
                                        </div>
                                    </div>
                                    <div className="rs-files">
                                        <div>PKQ-2147175.pdf</div>
                                        <div className="rs-divider" />
                                        <div>PKQ-2147175.pdf</div>
                                    </div>
                                </div>

                                <div className="rs-block">
                                    <h4>Danh sách thuốc và vật tư thực tế sử dụng</h4>
                                    <div className="rs-med-list">
                                        {usedMedicine.map((item) => (
                                            <div className="rs-med-item" key={`${section.id}-${item.id}`}>
                                                <img src={item.image} alt={item.name} />
                                                <div className="rs-med-info">
                                                    <strong>{item.name}</strong>
                                                    <p>{item.pack}</p>
                                                    <div className="rs-med-stats">
                                                        <span>Dự kiến: <b>{item.expected}</b></span>
                                                        <span>Thực tế: <b>{item.actual}</b></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </article>
                ))}
            </main>

            <footer className="rs-footer">
                <button type="button">Xác nhận</button>
            </footer>
        </div>
    );
};

export default ResultSummary;
