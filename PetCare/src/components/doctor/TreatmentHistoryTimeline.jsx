import React, { useEffect, useMemo, useState } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import './TreatmentHistoryTimeline.css';
import petService from '../../api/petService';

const toArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const statusClassName = (type) => {
    if (type === 'done') return 'th-status done';
    if (type === 'pending') return 'th-status pending';
    return 'th-status in-progress';
};

const mapStatusType = (status) => {
    const value = String(status || '').toLowerCase();
    if (value.includes('hoàn thành') || value.includes('đã thanh toán') || value.includes('done')) return 'done';
    if (value.includes('chờ') || value.includes('pending')) return 'pending';
    return 'in-progress';
};

const formatDateTime = (value) => {
    if (!value) return '--/-- --:--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--/-- --:--';
    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
    }).replace(',', '');
};

const mapHistoryBlock = (item, index) => {
    const services = toArray(item?.services || item?.serviceDetails || item?.items).map((service, serviceIndex) => {
        const status = service?.status || item?.status || 'Đang thực hiện';
        return {
            id: service?.id || `${item?.id || index}-service-${serviceIndex}`,
            name: service?.name || service?.serviceName || 'Dịch vụ',
            status,
            statusType: mapStatusType(status),
            prescriber: service?.prescriber?.fullName || service?.prescriberName || item?.doctor?.fullName || '---',
            performer: service?.performer?.fullName || service?.performerName || service?.technicianName || '---',
            supplies: toArray(service?.supplies || service?.materials).map((supply) => ({
                name: supply?.name || 'Vật tư',
                quantity: supply?.quantity ? `x${supply.quantity}` : '--',
            })),
        };
    });

    const blockStatus = item?.status || 'Đang thực hiện';

    return {
        id: item?.id || `history-${index}`,
        time: formatDateTime(item?.examDate || item?.createdAt || item?.updatedAt),
        title: item?.type || item?.title || 'Phiếu khám',
        status: blockStatus,
        statusType: mapStatusType(blockStatus),
        doctors: {
            main: item?.doctor?.fullName || item?.mainDoctorName || '---',
            support: item?.supportDoctor?.fullName || item?.supportDoctorName || '---',
        },
        detailsLabel: `Danh sách dịch vụ (${services.length})`,
        services,
        showResultButton: false,
    };
};

const TreatmentHistoryTimeline = ({ petId }) => {
    const [expandedIds, setExpandedIds] = useState(() => new Set());
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchHistory = async () => {
            if (!petId) {
                setHistoryData([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await petService.getExamHistory(petId);
                if (!isMounted) return;

                const blocks = toArray(response?.data?.data).map(mapHistoryBlock);
                setHistoryData(blocks);
                setExpandedIds(new Set(blocks.slice(0, 1).map((block) => block.id)));
            } catch {
                if (!isMounted) return;
                setHistoryData([]);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchHistory();

        return () => {
            isMounted = false;
        };
    }, [petId]);

    const summaryText = useMemo(() => {
        const totalServices = historyData.reduce((acc, block) => acc + block.services.length, 0);
        return `${historyData.length} hồ sơ • ${totalServices} dịch vụ`;
    }, [historyData]);

    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <section className="th-wrapper">
            <div className="th-header">
                <h3>Quá trình khám và điều trị</h3>
                <span className="th-header-status">{historyData[0]?.status || 'Đang thực hiện'}</span>
            </div>
            <p className="th-date-range">Lịch sử khám của thú cưng</p>
            <p className="th-summary">{summaryText}</p>

            {isLoading && <p className="th-summary">Đang tải lịch sử điều trị...</p>}
            {!isLoading && historyData.length === 0 && <p className="th-summary">Chưa có dữ liệu lịch sử điều trị.</p>}

            <div className="th-timeline">
                {historyData.map((block) => (
                    <article className="th-block" key={block.id}>
                        <div className="th-time">{block.time}</div>
                        <div className="th-body">
                            <div className="th-node" />
                            <div className="th-card">
                                <div className="th-card-header">
                                    <div className="th-tag">{block.title}</div>
                                    <span className={statusClassName(block.statusType)}>{block.status}</span>
                                </div>

                                <div className="th-doctors">
                                    <div className="th-row"><span>Bác sĩ chính</span><strong>{block.doctors.main}</strong></div>
                                    <div className="th-row"><span>Bác sĩ phụ trách</span><strong>{block.doctors.support}</strong></div>
                                </div>

                                <button className="th-collapse-btn" type="button" onClick={() => toggleExpand(block.id)}>
                                    <span className="th-details-label">{block.detailsLabel}</span>
                                    {expandedIds.has(block.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {expandedIds.has(block.id) && (
                                    <div className="th-services">
                                        {block.services.map((service) => (
                                            <div className="th-service" key={service.id}>
                                                <div className="th-service-title-row">
                                                    <h4>{service.name}</h4>
                                                    <span className={statusClassName(service.statusType)}>{service.status}</span>
                                                </div>
                                                <div className="th-row"><span>Người chỉ định</span><strong>{service.prescriber}</strong></div>
                                                {service.performer && <div className="th-row"><span>Người thực hiện</span><strong>{service.performer}</strong></div>}
                                                {service.supplies && (
                                                    <div className="th-sub-list">
                                                        <p>Thuốc và vật tư đi kèm ({service.supplies.length})</p>
                                                        {service.supplies.map((supply) => (
                                                            <div className="th-row" key={`${service.id}-${supply.name}`}>
                                                                <span>{supply.name}</span>
                                                                <strong>{supply.quantity}</strong>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {service.prescription && (
                                                    <div className="th-row">
                                                        <span>{service.prescription.name}</span>
                                                        <strong>{service.prescription.quantity}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {block.showResultButton && (
                                    <button className="th-result-btn" type="button">
                                        <span>Kết quả</span>
                                        <Eye size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default TreatmentHistoryTimeline;
