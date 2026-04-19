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

const mapStatusLabel = (status) => {
    const value = String(status || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (value.includes('hoan thanh') || value.includes('da thanh toan') || value.includes('thanh toan') || value.includes('done') || value.includes('completed') || value === 'paid' || value.includes('waiting_payment') || value.includes('cho thanh toan')) return 'Hoàn thành';
    if (value.includes('dang thuc hien') || value.includes('in_progress') || value.includes('cho ket luan') || value.includes('waiting_conclusion') || value.includes('ket luan')) return 'Đang thực hiện';
    if (value.includes('cho') || value.includes('pending') || value.includes('waiting') || value.includes('received') || value.includes('da tiep don')) return 'Chờ thực hiện';
    return status;
};

const mapStatusType = (status) => {
    const value = String(status || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (value.includes('hoan thanh') || value.includes('da thanh toan') || value.includes('thanh toan') || value.includes('done') || value.includes('completed') || value === 'paid' || value.includes('waiting_payment') || value.includes('cho thanh toan')) return 'done';
    if (value.includes('dang thuc hien') || value.includes('in_progress') || value.includes('cho ket luan') || value.includes('waiting_conclusion') || value.includes('ket luan')) return 'in-progress';
    if (value.includes('cho') || value.includes('pending') || value.includes('waiting') || value.includes('received') || value.includes('da tiep don')) return 'pending';
    return 'in-progress';
};

const formatDateTime = (value) => {
    if (!value) return '--/--\n--:--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--/--\n--:--';
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
    }) + `\n${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })}`;
};

const formatDateOnly = (value) => {
    if (!value) return '--/--/----';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('vi-VN');
};

const safeText = (value, fallback = '---') => {
    const text = String(value ?? '').trim();
    return text || fallback;
};

const normalizePlainText = (value) =>
    String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const toSentenceCaseVi = (value, fallback = 'Đang thực hiện') => {
    const normalized = String(value || fallback).trim().toLocaleLowerCase('vi-VN');
    return normalized.replace(/\p{L}/u, (ch) => ch.toLocaleUpperCase('vi-VN'));
};

const normalizeMedicineType = (medicine) => {
    const rawType = [
        medicine?.type,
        medicine?.productType,
        medicine?.product_type,
        medicine?.itemType,
        medicine?.item_type,
        medicine?.medicineType,
        medicine?.medicine_type,
        medicine?.medicine?.type,
        medicine?.medicine?.productType,
        medicine?.medicine?.product_type,
    ].find((v) => String(v || '').trim() !== '');

    const normalized = String(rawType || '').trim().toUpperCase();
    if (normalized === 'THUOC' || normalized === 'MEDICINE') return 'THUOC';
    if (normalized === 'VAT_TU' || normalized === 'VATTU' || normalized === 'MATERIAL' || normalized === 'SUPPLY') return 'VAT_TU';

    const hintText = String(
        medicine?.unit ||
        medicine?.dosageUnit ||
        medicine?.medicineUnit ||
        medicine?.dosage ||
        medicine?.instruction ||
        medicine?.note ||
        ''
    ).toLowerCase();

    if (/(viên|ml|mg|gói|ống|chai|lọ)/i.test(hintText)) return 'THUOC';
    return 'VAT_TU';
};

const mapExamTypeLabel = (rawExamType) => {
    const normalized = normalizePlainText(rawExamType);

    if (
        normalized.includes('tai kham') ||
        normalized.includes('re_exam') ||
        normalized.includes('re-exam') ||
        normalized.includes('follow') ||
        normalized.includes('tai')
    ) {
        return 'Tái khám';
    }

    return 'Khám mới';
};

const mapHistoryBlock = (item, index) => {
    const blockStatus = safeText(item?.status, 'Đang thực hiện');
    const blockStatusType = mapStatusType(blockStatus);
    const blockStatusLabel = mapStatusLabel(blockStatus);

    const services = toArray(item?.services || item?.serviceDetails || item?.items).map((service, serviceIndex) => {
        const rawStatus = safeText(service?.status, blockStatus);
        const statusType = mapStatusType(rawStatus);
        const statusLabel = mapStatusLabel(rawStatus);
        return {
            id: service?.serviceId || service?.id || `${item?.receptionRecordId || item?.id || index}-service-${serviceIndex}`,
            name: safeText(service?.serviceName || service?.name, 'Dịch vụ'),
            status: statusLabel,
            statusType,
            prescriber: safeText(service?.prescriber?.fullName || service?.prescriberName || item?.mainDoctorName),
            performer: safeText(service?.performer?.fullName || service?.performerName || service?.technicianName || item?.assistantDoctorName),
        };
    });

    const medicines = toArray(item?.medicines).map((medicine, medicineIndex) => {
        return {
            id: medicine?.medicineId || `${item?.receptionRecordId || index}-medicine-${medicineIndex}`,
            name: safeText(medicine?.medicineName || medicine?.name, 'Thuốc/Vật tư'),
            quantity: medicine?.quantity ? `x${medicine.quantity}` : '--',
            type: normalizeMedicineType(medicine),
            unit: safeText(medicine?.unit || medicine?.dosageUnit || medicine?.medicineUnit, ''),
            dosage: safeText(medicine?.dosage || medicine?.instruction || medicine?.note, ''),
        };
    });

    const referenceTime = item?.examDate || item?.receptionTime || item?.createdAt || item?.updatedAt;
    const serviceCount = Number(item?.serviceCount || services.length || 0);
    const medicineCount = Number(item?.medicineCount || medicines.length || 0);
    const examTypeRaw = item?.exam_type || item?.examType || item?.examForm?.examType || item?.type;

    return {
        id: item?.receptionRecordId || item?.id || `history-${index}`,
        sortTime: new Date(referenceTime || 0).getTime(),
        time: formatDateTime(referenceTime),
        title: mapExamTypeLabel(examTypeRaw),
        status: blockStatusLabel,
        statusType: blockStatusType,
        date: formatDateOnly(referenceTime),
        examReason: safeText(item?.examReason, ''),
        conclusion: safeText(item?.conclusion, ''),
        doctors: {
            main: safeText(item?.doctor?.fullName || item?.mainDoctorName),
            support: safeText(item?.supportDoctor?.fullName || item?.supportDoctorName || item?.assistantDoctorName),
        },
        detailsLabel: `${serviceCount} dịch vụ • ${medicineCount} thuốc/vật tư`,
        services,
        medicines,
        showResultButton: Boolean(toArray(item?.evidencePaths).length || (item?.conclusion && item?.conclusion !== '---')),
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

                const payload = response?.data?.data;
                const rawTimeline = toArray(payload?.timeline ?? payload);
                const blocks = rawTimeline
                    .map(mapHistoryBlock)
                    .sort((left, right) => right.sortTime - left.sortTime);
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

    const dateRangeText = useMemo(() => {
        if (historyData.length === 0) return 'Lịch sử khám của thú cưng';

        const dates = historyData
            .map((block) => block.date)
            .filter((date) => date && date !== '--/--/----');

        if (dates.length === 0) return 'Lịch sử khám của thú cưng';
        if (dates.length === 1) return dates[0];

        return `${dates[dates.length - 1]} - ${dates[0]}`;
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
    const formatStatus = (str) => toSentenceCaseVi(str, 'Đang thực hiện');
    return (
        <section className="th-wrapper">
            <div className="th-header">
                <h3>Quá trình khám & điều trị</h3>
                <span className="th-header-status">{formatStatus(historyData[0]?.status)}</span>
            </div>
            <p className="th-date-range">{dateRangeText}</p>
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
                                    <div className="th-tag">{toSentenceCaseVi(block.title, 'Khám mới')}</div>
                                    <span className={statusClassName(block.statusType)}>{formatStatus(block.status)}</span>
                                </div>

                                <div className="th-doctors">
                                    <div className="th-row"><span>Bác sĩ chính</span><strong>{block.doctors.main}</strong></div>
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
                                                    <span className={statusClassName(service.statusType)}>{formatStatus(service.status)}</span>
                                                </div>
                                                {service.performer && <div className="th-row"><span>Người thực hiện</span><strong>{service.performer}</strong></div>}
                                            </div>
                                        ))}

                                        {block.medicines.length > 0 && (
                                            <div className="th-sub-list">
                                                <p>Thuốc & vật tư đã dùng ({block.medicines.length})</p>
                                                {block.medicines.map((medicine) => (
                                                    <div onClick={()=> console.log(medicine)} className="th-row" key={medicine.id}>
                                                        <span>{medicine.name}</span>
                                                        <strong>{`${medicine.quantity} ${medicine.type === 'THUOC' ? `hộp` : medicine.unit}`}</strong>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {block.examReason !== '---' && (
                                            <div className="th-note">Lý do khám: {block.examReason}</div>
                                        )}

                                        {block.conclusion !== '---' && (
                                            <div className="th-conclusion">Kết luận: {block.conclusion}</div>
                                        )}
                                    </div>
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
