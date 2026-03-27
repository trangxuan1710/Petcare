import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import './TreatmentHistoryTimeline.css';

const historyData = [
    {
        id: 'outpatient',
        time: '14/07 10:45',
        title: 'Điều trị ngoại trú',
        status: 'Đang thực hiện',
        statusType: 'in-progress',
        doctors: {
            main: 'Nguyen Thanh Thao',
            support: 'Duong Quang Tung'
        },
        detailsLabel: 'Danh sách dịch vụ - thuốc và vật tư chỉ định (2)',
        services: [
            {
                id: 'cast-broken-leg',
                name: 'Bó bột gãy chân cho thú cưng',
                status: 'Đang thực hiện',
                statusType: 'in-progress',
                prescriber: 'Nguyen Huy Linh',
                performer: 'Le Duy An',
                supplies: [
                    { name: 'Thuốc tê', quantity: 'x2 liều' },
                    { name: 'Vải băng bó dày dặn, cotton thấm hút mồ hôi đã sát khuẩn', quantity: 'x2 gói' }
                ]
            },
            {
                id: 'anti-anxiety',
                name: 'Thuốc an thần cho chó mèo Buspiron HCl',
                status: 'Đang thực hiện',
                statusType: 'in-progress',
                prescriber: 'Nguyen Huy Linh',
                prescription: { name: 'Kê', quantity: 'x2 viên' }
            },
            {
                id: 'stool-test',
                name: 'Xét nghiệm tìm chất ăn trong phân',
                status: 'Chờ thực hiện',
                statusType: 'pending',
                prescriber: 'Nguyen Huy Linh',
                performer: 'Le Duy An'
            }
        ],
        showResultButton: true
    },
    {
        id: 'inpatient',
        time: '13/07 10:45',
        title: 'Điều trị nội trú',
        status: 'Hoàn thành',
        statusType: 'done',
        doctors: {
            main: 'Nguyen Thanh Thao',
            support: 'Duong Quang Tung'
        },
        detailsLabel: 'Danh sách dịch vụ - thuốc và vật tư chỉ định (5)',
        services: [
            {
                id: 'checkup',
                name: 'Dịch vụ thăm khám',
                status: 'Hoàn thành',
                statusType: 'done',
                prescriber: 'Nguyen Huy Linh',
                performer: 'Le Duy An'
            },
            {
                id: 'vaccine',
                name: 'Tiêm vaccine phòng dại cho chó',
                status: 'Hoàn thành',
                statusType: 'done',
                prescriber: 'Nguyen Huy Linh',
                performer: 'Le Duy An',
                supplies: [
                    { name: 'Thuốc tê', quantity: 'x2 liều' },
                    { name: 'Vải băng bó dày dặn, cotton thấm hút mồ hôi đã sát khuẩn', quantity: 'x2 gói' }
                ]
            },
            {
                id: 'fungus-med',
                name: 'Thuốc trị nấm SHD',
                status: 'Hoàn thành',
                statusType: 'done',
                prescriber: 'Nguyen Huy Linh',
                prescription: { name: 'Kê', quantity: 'x2 viên' }
            }
        ],
        showResultButton: true
    },
    {
        id: 'exam-sheet',
        time: '13/07 10:45',
        title: 'Phiếu khám',
        status: 'Hoàn thành',
        statusType: 'done',
        doctors: {
            main: 'Nguyen Thanh Thao',
            support: 'Duong Quang Tung'
        },
        detailsLabel: 'Danh sách dịch vụ - thuốc và vật tư chỉ định (5)',
        services: [
            {
                id: 'clinical-exam',
                name: 'Khám lâm sàng',
                status: 'Hoàn thành',
                statusType: 'done',
                prescriber: 'Nguyen Huy Linh',
                performer: 'Le Duy An'
            },
            {
                id: 'blood-test',
                name: 'Xét nghiệm máu',
                status: 'Hoàn thành',
                statusType: 'done',
                prescriber: 'Nguyen Huy Linh',
                performer: 'Le Duy An'
            }
        ],
        showResultButton: true
    }
];

const statusClassName = (type) => {
    if (type === 'done') return 'th-status done';
    if (type === 'pending') return 'th-status pending';
    return 'th-status in-progress';
};

const TreatmentHistoryTimeline = () => {
    const [expandedIds, setExpandedIds] = useState(() => new Set(['inpatient', 'exam-sheet']));

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
                <span className="th-header-status">Đang thực hiện</span>
            </div>
            <p className="th-date-range">13/07/2024 - 19/07/2024</p>
            <p className="th-summary">3 dịch vụ • 3 thuốc - vật tư đi kèm • 3 thuốc - vật tư mang về</p>

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
                                    <div className="th-row"><span>Bac si chinh</span><strong>{block.doctors.main}</strong></div>
                                    <div className="th-row"><span>Bac si phu trach</span><strong>{block.doctors.support}</strong></div>
                                </div>

                                <button className="th-collapse-btn" type="button" onClick={() => toggleExpand(block.id)}>
                                    <span>{block.detailsLabel}</span>
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
