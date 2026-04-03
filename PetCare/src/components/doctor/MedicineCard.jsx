import React from 'react';
import { Minus, Plus, ChevronDown, PencilLine } from 'lucide-react';
import { Divider} from "semantic-ui-react"

const MedicineCard = ({
    med,
    onToggleSelection,
    onToggleExpand,
    onUpdateQty,
    onOpenDosageModal
}) => {
    const dosageRows = [
        { label: 'Sáng', value: med.dosage.morning },
        { label: 'Trưa', value: med.dosage.noon },
        { label: 'Chiều', value: med.dosage.afternoon },
        { label: 'Tối', value: med.dosage.evening }
    ].filter((item) => item.value > 0);

    return (
        <div
            className={`ms-med-card ${med.selected ? 'selected' : ''} ${med.expanded ? 'expanded' : ''}`}
            onClick={() => onToggleExpand(med.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggleExpand(med.id);
                }
            }}
        >
            <div className="ms-med-main-row">
                <div
                    className="ms-med-checkbox"
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleSelection(med.id);
                    }}
                >
                    <div className={`ms-checkbox-box ${med.selected ? 'checked' : ''}`}></div>
                </div>
                <img src={med.image} alt={med.name} className="ms-med-image-sm" />
                <div className="ms-med-info-box">
                    <h4 className="ms-med-name-sm">{med.name}</h4>
                    <p className="ms-med-desc-sm">{med.desc}</p>
                    <div className="ms-med-footer-sm">
                        <div className="ms-med-price-tag">
                            <span className="ms-price-num">{med.price}</span>
                            <span className="ms-price-unit"> {med.unit}</span>
                        </div>
                        <span className="ms-stock-txt">Tồn: <strong>{med.stock}</strong></span>
                    </div>
                </div>
            </div>

            {med.expanded && (
                <div className="ms-med-expanded-area" onClick={(event) => event.stopPropagation()}>
                    <div className="ms-qty-row">
                        <span className="ms-qty-label">Số lượng</span>
                        <div className="ms-qty-controls-wrapper">
                            <button className="ms-unit-select" type="button">
                                <span>{med.selectedUnit}</span>
                                <ChevronDown size={16} color="#444" />
                            </button>
                            <div className="ms-qty-stepper">
                                <button onClick={() => onUpdateQty(med.id, -1)} className="ms-stepper-btn" type="button">
                                    <Minus size={16} color="#666" />
                                </button>
                                <span className="ms-qty-val">{med.qty}</span>
                                <button onClick={() => onUpdateQty(med.id, 1)} className="ms-stepper-btn" type="button">
                                    <Plus size={16} color="#666" />
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="ms-dosage-row">
                        <span className="ms-qty-label">Liều dùng</span>
                        <button className="ms-btn-dosage-edit" type="button" onClick={() => onOpenDosageModal(med.id)}>
                            <PencilLine size={18} />
                        </button>
                    </div>

                    {dosageRows.length > 0 ? (
                        <div className="ms-dosage-summary">
                            {dosageRows.map((item) => (
                                <div className="ms-dosage-summary-row" key={item.label}>
                                    <span>{item.label}</span>
                                    <span>{item.value} viên</span>
                                </div>
                            ))}
                            {med.dosage.note && (
                                <div className="ms-dosage-summary-row note">
                                    <span>Chỉ định khác</span>
                                    <span>{med.dosage.note}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="ms-btn-dosage" type="button" onClick={() => onOpenDosageModal(med.id)}>
                            Thêm liều dùng
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MedicineCard;
