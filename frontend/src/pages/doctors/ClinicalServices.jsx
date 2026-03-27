import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ChevronDown } from 'lucide-react';
import './ClinicalServices.css';

const defaultServices = [
    { id: 1, name: 'Dịch vụ xét nghiệm UA', price: '120.000đ' },
    { id: 2, name: 'Dịch vụ điện não đồ', price: '120.000đ' },
    { id: 3, name: 'Dịch vụ xét nghiệm tCO2', price: '120.000đ' },
    { id: 4, name: 'Dịch vụ xét nghiệm mô học', price: '120.000đ' }
];

const ClinicalServices = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [assignees, setAssignees] = useState({
        1: 'Lê Huy Anh',
        2: '',
        3: '',
        4: ''
    });

    const doctorOptions = ['Lê Huy Anh', 'Nguyễn Hải Nam', 'Trần Minh Khoa'];

    const filteredServices = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return defaultServices;
        return defaultServices.filter((service) => service.name.toLowerCase().includes(keyword));
    }, [searchTerm]);

    const toggleService = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const updateAssignee = (id, value) => {
        setAssignees((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <div className="cs-page">
            <header className="cs-header">
                <button className="cs-icon-btn" type="button" onClick={() => navigate(-1)} aria-label="Quay lại">
                    <ChevronLeft size={24} color="#222" />
                </button>
                <h1 className="cs-title">Dịch vụ cận lâm sàng</h1>
            </header>

            <div className="cs-search-wrap">
                <div className="cs-search-box">
                    <Search size={20} color="#0f9a80" />
                    <input
                        className="cs-search-input"
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search"
                    />
                </div>
            </div>

            <div className="cs-content">
                <div className="cs-list">
                    {filteredServices.map((service) => {
                        const checked = selectedIds.has(service.id);
                        return (
                            <div className={`cs-item ${checked ? 'checked' : ''}`} key={service.id}>
                                <button
                                    className="cs-item-main"
                                    type="button"
                                    onClick={() => toggleService(service.id)}
                                >
                                    <span className={`cs-checkbox ${checked ? 'checked' : ''}`} />
                                    <span className="cs-name">{service.name}</span>
                                    <span className="cs-price">{service.price} <span className="cs-unit">/lượt</span></span>
                                </button>

                                {checked && (
                                    <div className="cs-item-extra">
                                        <label className="cs-assignee-label">
                                            Người thực hiện <span>*</span>
                                        </label>
                                        <div className="cs-assignee-select-wrap">
                                            <select
                                                className="cs-assignee-select"
                                                value={assignees[service.id] ?? ''}
                                                onChange={(event) => updateAssignee(service.id, event.target.value)}
                                            >
                                                <option value="" disabled>Người thực hiện</option>
                                                {doctorOptions.map((doctor) => (
                                                    <option key={doctor} value={doctor}>{doctor}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} color="#68736f" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="cs-bottom-bar">
                <button className="cs-btn-skip" type="button" onClick={() => navigate(-1)}>Bỏ qua</button>
                <button className="cs-btn-confirm" type="button" disabled={selectedIds.size === 0}>Xác nhận</button>
            </div>
        </div>
    );
};

export default ClinicalServices;
