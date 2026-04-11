import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ChevronDown } from 'lucide-react';
import './ClinicalServices.css';
import receptionService from '../../api/receptionService';

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const formatPrice = (value) => {
    if (typeof value !== 'number') return '0đ';
    return `${value.toLocaleString('vi-VN')}đ`;
};

const mapServiceItem = (item) => ({
    id: item?.id || item?.serviceId,
    name: item?.name || item?.serviceName || item?.service?.name || 'Dịch vụ cận lâm sàng',
    price: formatPrice(item?.price ?? item?.unitPrice ?? item?.service?.price),
});

const mapTechnicianItem = (item) => ({
    id: item?.id,
    name: item?.fullName || item?.name || item?.technicianName || `KTV #${item?.id || ''}`,
});

const mapSelectedServiceItem = (item) => ({
    serviceId: item?.serviceId || item?.service?.id,
    serviceName: item?.serviceName || item?.service?.name,
    technicianId: item?.technicianId || item?.technician?.id,
    technicianName: item?.technicianName || item?.technician?.fullName || item?.technician?.name,
    quantity: item?.quantity || 1,
});

const ClinicalServices = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const receptionId = location.state?.receptionId;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [assignees, setAssignees] = useState({});
    const [services, setServices] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [techniciansResponse, selectedResponse] = await Promise.allSettled([
                    receptionService.searchTechnicians({ limit: 100 }),
                    receptionId ? receptionService.getSelectedParaclinicalServices(receptionId) : Promise.resolve(null),
                ]);

                if (!isMounted) return;

                const technicianItems = techniciansResponse.status === 'fulfilled'
                    ? toArray(techniciansResponse.value?.data?.data).map(mapTechnicianItem)
                    : [];

                setTechnicians(technicianItems);

                if (selectedResponse.status === 'fulfilled') {
                    const selectedItems = toArray(selectedResponse.value?.data?.data).map(mapSelectedServiceItem);
                    const initialSelected = new Set(selectedItems.map((item) => item.serviceId).filter(Boolean));
                    const initialAssignees = {};

                    selectedItems.forEach((item) => {
                        if (item.serviceId && item.technicianId) {
                            initialAssignees[item.serviceId] = String(item.technicianId);
                        }
                    });

                    setSelectedIds(initialSelected);
                    setAssignees((prev) => ({ ...prev, ...initialAssignees }));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [receptionId]);

    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const servicesResponse = await receptionService.searchParaclinicalServices({
                    keyword: searchTerm.trim(),
                    limit: 100,
                });

                if (!isMounted) return;
                const serviceItems = toArray(servicesResponse?.data?.data).map(mapServiceItem);
                setServices(serviceItems);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchServices();

        return () => {
            isMounted = false;
        };
    }, [searchTerm]);

    const filteredServices = useMemo(() => services, [services]);

    const toggleService = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                if (!assignees[id] && technicians.length > 0) {
                    setAssignees((draft) => ({ ...draft, [id]: String(technicians[0].id) }));
                }
            }
            return next;
        });
    };

    const updateAssignee = (id, value) => {
        setAssignees((prev) => ({ ...prev, [id]: value }));
    };

    const handleConfirm = async () => {
        if (!receptionId || isSaving) {
            navigate(-1);
            return;
        }

        const items = Array.from(selectedIds)
            .map((serviceId) => ({
                serviceId,
                technicianId: Number(assignees[serviceId]),
                quantity: 1,
            }))
            .filter((item) => item.serviceId && item.technicianId);

        setIsSaving(true);
        try {
            if (items.length > 0) {
                await receptionService.saveSelectedParaclinicalServices(receptionId, { items });
            }

            navigate(`/doctors/service-order/${receptionId}`, {
                state: {
                    refreshParaclinical: Date.now(),
                },
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="cs-page">
            <div className="cs-header">
                <button className="cs-icon-btn" type="button" onClick={() => navigate(-1)} aria-label="Quay lại">
                    <ChevronLeft size={24} color="#222" />
                </button>
                <h1 className="cs-title">Dịch vụ</h1>
            </div>

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
                    {isLoading && <div className="cs-item">Đang tải dịch vụ...</div>}
                    {filteredServices.map((service, serviceIndex) => {
                        const checked = selectedIds.has(service.id);
                        const serviceKey = service?.id ?? `${service?.name || 'service'}-${serviceIndex}`;
                        return (
                            <div className={`cs-item ${checked ? 'checked' : ''}`} key={serviceKey}>
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
                                                {technicians.map((technician, technicianIndex) => {
                                                    const technicianKey = technician?.id ?? `${technician?.name || 'technician'}-${technicianIndex}`;
                                                    return (
                                                        <option key={technicianKey} value={technician.id}>{technician.name}</option>
                                                    );
                                                })}
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
                <button
                    className="cs-btn-confirm"
                    type="button"
                    disabled={selectedIds.size === 0}
                    onClick={handleConfirm}
                >
                    {isSaving ? 'Đang lưu...' : 'Xác nhận'}
                </button>
            </div>
        </div>
    );
};

export default ClinicalServices;
