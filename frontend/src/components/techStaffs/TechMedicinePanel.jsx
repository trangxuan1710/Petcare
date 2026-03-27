import React from 'react';
import { PencilLine } from 'lucide-react';
import './TechMedicinePanel.css';

const TechMedicinePanel = ({ items }) => {
    return (
        <section className="tech-med-panel">
            <div className="tech-med-header">
                <h3>THUOC VA VAT TU DI KEM</h3>
            </div>

            <div className="tech-med-list">
                {items.map((item) => (
                    <article key={item.id} className="tech-med-item">
                        <div className="tech-med-top">
                            <strong>{item.name}</strong>
                            <PencilLine size={15} color="#14a085" />
                        </div>

                        <div className="tech-med-price-row">
                            <div>
                                <span className="tech-med-price">{item.price}</span>
                                <span className="tech-med-unit">/{item.unit}</span>
                            </div>
                            <span className="tech-med-qty">{item.qty} {item.unit}</span>
                        </div>

                        <div className="tech-med-meta-row"><span>Sang</span><span>{item.morning}</span></div>
                        <div className="tech-med-meta-row"><span>Toi</span><span>{item.evening}</span></div>
                        <div className="tech-med-meta-row"><span>Chi dinh khac</span><span>{item.note}</span></div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default TechMedicinePanel;
