import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Phone, PawPrint, Plus, Cake, Weight, Mars, PenSquare } from 'lucide-react';
import './NewReception.css';

const NewReception = () => {
    const [selectedPet, setSelectedPet] = useState('Kuro');
    const [pets, setPets] = useState([
        { name: 'Kuro' },
        { name: 'Katy' },
    ]);
    const [showAddPetModal, setShowAddPetModal] = useState(false);
    const [newPetName, setNewPetName] = useState('');
    const [newPetSpecies, setNewPetSpecies] = useState('');
    const [newPetBreed, setNewPetBreed] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [weight, setWeight] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [examType, setExamType] = useState('');
    const [assignee, setAssignee] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [assignedDoctor, setAssignedDoctor] = useState('');
    const [notes, setNotes] = useState('');

    const handleCreatePet = () => {
        if (!newPetName.trim() || !newPetSpecies || !newPetBreed.trim()) {
            return;
        }

        const createdPet = { name: newPetName.trim() };
        setPets((prev) => [...prev, createdPet]);
        setSelectedPet(createdPet.name);
        setShowAddPetModal(false);
        setNewPetName('');
        setNewPetSpecies('');
        setNewPetBreed('');
    };

    const petInfo = {
        name: 'Kuro',
        breed: 'Chó Poodle',
        gender: 'male',
        age: '3 Tuổi',
        weight: '4.5kg',
    };

    return (
        <div className="new-reception-page">
            {/* Header */}
            <header className="nr-header">
                <button className="nr-btn-icon">
                    <ChevronLeft size={24} color="#1a1a1a" />
                </button>
                <h1 className="nr-title">Tiếp đón mới</h1>
                <div className="nr-header-avatar">
                    <img src="https://placehold.co/36x36/e0f2ef/209D80?text=Dr" alt="avatar" />
                </div>
            </header>

            <div className="nr-content">
                {/* Customer Info */}
                <div className="nr-customer-section">
                    <div className="nr-customer-row">
                        <h2 className="nr-customer-name">Nguyễn Anh Đức</h2>
                        <div className="nr-customer-debt">
                            <span className="nr-debt-amount">10.000.000đ</span>
                        </div>
                    </div>
                    <div className="nr-customer-sub-row">
                        <div className="nr-customer-phone">
                            <Phone size={14} color="#209D80" />
                            <span>0912345678</span>
                        </div>
                        <span className="nr-order-count">/35 đơn</span>
                    </div>
                </div>

                {/* Pet Chips */}
                <div className="nr-pet-chips">
                    {pets.map(pet => (
                        <button
                            key={pet.name}
                            className={`nr-pet-chip ${selectedPet === pet.name ? 'active' : ''}`}
                            onClick={() => setSelectedPet(pet.name)}
                        >
                            <PawPrint size={14} />
                            <span>{pet.name}</span>
                        </button>
                    ))}
                    <button type="button" className="nr-pet-chip-add" onClick={() => setShowAddPetModal(true)}>
                        <Plus size={18} color="#209D80" />
                    </button>
                </div>

                {/* Form Section */}
                <div className="nr-form-section">
                    <h3 className="nr-form-title">Thông tin tiếp đón</h3>

                    {/* Pet Info Bar */}
                    <div className="nr-pet-info-bar">
                        <div className="nr-pet-info-details">
                            <span className="nr-pet-info-name">{petInfo.name}</span>
                            <span className="nr-pet-info-breed">
                                {petInfo.breed}
                                <Mars size={12} color="#3b82f6" style={{ marginLeft: '2px' }} />
                            </span>
                            <span className="nr-pet-info-stat">
                                <Cake size={13} color="#888" />
                                {petInfo.age}
                            </span>
                            <span className="nr-pet-info-stat">
                                <Weight size={13} color="#888" />
                                {petInfo.weight}
                            </span>
                        </div>
                        <button className="nr-pet-edit-btn">
                            <PenSquare size={16} color="#209D80" />
                        </button>
                    </div>

                    {/* Weight */}
                    <div className="nr-field">
                        <label className="nr-field-label">Cân nặng <span className="nr-required">*</span></label>
                        <div className="nr-input-with-suffix">
                            <input
                                type="text"
                                className="nr-input"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder=""
                            />
                            <span className="nr-input-suffix">kg</span>
                        </div>
                    </div>

                    {/* Birth Date */}
                    <div className="nr-field">
                        <label className="nr-field-label">Ngày sinh</label>
                        <div className="nr-input-wrapper">
                            <input
                                type="date"
                                className="nr-input"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="nr-field">
                        <label className="nr-field-label">Lý do khám <span className="nr-required">*</span></label>
                        <div className="nr-select-wrapper">
                            <select
                                className="nr-select"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            >
                                <option value="" disabled></option>
                                <option value="behohap">Bệnh hô hấp</option>
                                <option value="tieuhoa">Bệnh tiêu hóa</option>
                                <option value="dalieu">Bệnh da liễu</option>
                                <option value="khac">Khác</option>
                            </select>
                            <ChevronDown size={18} color="#888" className="nr-select-icon" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="nr-field">
                        <label className="nr-field-label">Mô tả</label>
                        <textarea
                            className="nr-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder=""
                        />
                    </div>

                    {/* Exam Type */}
                    <div className="nr-field">
                        <label className="nr-field-label">Hình thức khám</label>
                        <div className="nr-select-wrapper">
                            <select
                                className="nr-select"
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                            >
                                <option value="" disabled></option>
                                <option value="khammoi">Khám mới</option>
                                <option value="taikham">Tái khám</option>
                            </select>
                            <ChevronDown size={18} color="#888" className="nr-select-icon" />
                        </div>
                    </div>

                    {/* Assigned Doctor */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div className="nr-field" style={{ flex: 1, marginBottom: '20px' }}>
                            <label className="nr-field-label">Bác sĩ phụ trách <span className="nr-required">*</span></label>
                            <div className="nr-select-wrapper">
                                <select
                                    className="nr-select"
                                    value={assignedDoctor}
                                    onChange={(e) => setAssignedDoctor(e.target.value)}
                                >
                                    <option value="" disabled></option>
                                    <option value="bshauyan">Bs. Hà Huy An</option>
                                    <option value="bsbinh">Bs. Bình</option>
                                </select>
                                <ChevronDown size={18} color="#888" className="nr-select-icon" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBEB', color: '#D97706', padding: '0 16px', borderRadius: '8px', border: '1px solid #FDE68A', height: '48px', fontSize: '14px', fontWeight: '500' }}>
                            02 ca
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="nr-field">
                        <label className="nr-field-label">Người thực hiện <span className="nr-required">*</span></label>
                        <div className="nr-select-wrapper">
                            <select
                                className="nr-select"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            >
                                <option value="" disabled></option>
                                <option value="lehuyanh">Lê Huy Anh</option>
                                <option value="nguyenvanan">Nguyễn Văn An</option>
                            </select>
                            <ChevronDown size={18} color="#888" className="nr-select-icon" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="nr-field">
                        <label className="nr-field-label">Lưu ý</label>
                        <textarea
                            className="nr-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder=""
                        />
                    </div>

                    {/* Emergency Toggle */}
                    <div className="nr-toggle-row">
                        <div
                            className={`nr-toggle ${isEmergency ? 'active' : ''}`}
                            onClick={() => setIsEmergency(!isEmergency)}
                        >
                            <div className="nr-toggle-thumb"></div>
                        </div>
                        <span className="nr-toggle-label">Cấp cứu</span>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="nr-bottom-actions">
                <button className="nr-btn-cancel">Hủy bỏ</button>
                <button className="nr-btn-submit">Tạo phiếu</button>
            </div>

            {showAddPetModal && (
                <>
                    <div className="nr-pet-modal-overlay" onClick={() => setShowAddPetModal(false)}></div>
                    <div className="nr-pet-modal">
                        <div className="nr-pet-modal-handle"></div>
                        <h3 className="nr-pet-modal-title">Tạo mới thú cưng</h3>

                        <div className="nr-pet-modal-form-row">
                            <div className="nr-pet-modal-field nr-pet-modal-field-half">
                                <label className="nr-pet-modal-label">Thú cưng <span className="nr-required">*</span></label>
                                <input
                                    type="text"
                                    className="nr-pet-modal-input"
                                    value={newPetName}
                                    onChange={(e) => setNewPetName(e.target.value)}
                                />
                            </div>

                            <div className="nr-pet-modal-field nr-pet-modal-field-half">
                                <label className="nr-pet-modal-label">Loài <span className="nr-required">*</span></label>
                                <div className="nr-pet-modal-select-wrapper">
                                    <select
                                        className="nr-pet-modal-select"
                                        value={newPetSpecies}
                                        onChange={(e) => setNewPetSpecies(e.target.value)}
                                    >
                                        <option value="" disabled></option>
                                        <option value="cho">Chó</option>
                                        <option value="meo">Mèo</option>
                                        <option value="khac">Khác</option>
                                    </select>
                                    <ChevronDown size={16} color="#666" className="nr-pet-modal-select-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="nr-pet-modal-field">
                            <label className="nr-pet-modal-label">Giống <span className="nr-required">*</span></label>
                            <div className="nr-pet-modal-select-wrapper">
                                <select
                                    className="nr-pet-modal-select"
                                    value={newPetBreed}
                                    onChange={(e) => setNewPetBreed(e.target.value)}
                                >
                                    <option value="" disabled></option>
                                    <option value="poodle">Poodle</option>
                                    <option value="corgi">Corgi</option>
                                    <option value="husky">Husky</option>
                                    <option value="golden">Golden Retriever</option>
                                </select>
                                <ChevronDown size={16} color="#666" className="nr-pet-modal-select-icon" />
                            </div>
                        </div>

                        <div className="nr-pet-modal-actions">
                            <button type="button" className="nr-pet-modal-btn-cancel" onClick={() => setShowAddPetModal(false)}>Hủy bỏ</button>
                            <button type="button" className="nr-pet-modal-btn-submit" onClick={handleCreatePet}>Tạo mới</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NewReception;
