import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Phone, PawPrint, CirclePlus, UserRound, Cake, Weight, Mars, Venus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReceptionistLayout from '../../layouts/ReceptionistLayout';
import { RECEPTIONIST_PATHS } from '../../routes/receptionistPaths';
import customerService from '../../api/customerService';
import petService from '../../api/petService';
import receptionService from '../../api/receptionService';
import userService from '../../api/userService';
import './NewReception.css';

const EXAM_REASON_OPTIONS = {
    behohap: 'Bệnh hô hấp',
    tieuhoa: 'Bệnh tiêu hóa',
    dalieu: 'Bệnh da liễu',
    khac: 'Khác',
};

const EXAM_TYPE_OPTIONS = {
    khammoi: 'lâm sàng',
    taikham: 'ngoại trú',
};

const PET_BREED_OPTIONS = {
    cho: [
        'Poodle',
        'Corgi',
        'Husky',
        'Golden Retriever',
        'Pug',
        'Shiba',
        'Chihuahua',
        'Labrador',
        'Phốc sóc (Pomeranian)',
        'Becgie (German Shepherd)',
    ],
    meo: [
        'Mèo Anh lông ngắn',
        'Mèo Anh lông dài',
        'Mèo Ba Tư',
        'Mèo Xiêm',
        'Mèo Bengal',
        'Maine Coon',
        'Scottish Fold',
        'Munchkin',
        'Mèo ta',
        'Mèo Sphynx',
    ],
};

const SPECIES_LABELS = {
    cho: 'Chó',
    meo: 'Mèo',
    khac: 'Khác',
};

const calcAgeLabel = (dateOfBirth) => {
    if (!dateOfBirth) return '-- Tuổi';
    const birth = new Date(dateOfBirth);
    if (Number.isNaN(birth.getTime())) return '-- Tuổi';

    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        years -= 1;
    }

    return `${Math.max(years, 0)} Tuổi`;
};

const formatPetWeight = (pet) => {
    if (pet?.weight == null || pet?.weight === '') return '--kg';
    if (typeof pet.weight === 'number') return `${pet.weight}kg`;

    const rawWeight = String(pet.weight).trim();
    if (!rawWeight) return '--kg';
    if (/kg$/i.test(rawWeight)) return rawWeight;
    return `${rawWeight}kg`;
};

const DropupSelect = ({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    triggerClassName = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectedOption = options.find((option) => String(option.value) === String(value));
    const displayLabel = selectedOption?.label || placeholder;

    return (
        <div className={`nr-dropup ${disabled ? 'is-disabled' : ''}`} ref={containerRef}>
            <button
                type="button"
                className={`nr-dropup-trigger ${triggerClassName}`.trim()}
                onClick={() => {
                    if (!disabled) setIsOpen((prev) => !prev);
                }}
                disabled={disabled}
            >
                <span className={`nr-dropup-text ${selectedOption ? '' : 'is-placeholder'}`}>
                    {displayLabel}
                </span>
                <ChevronDown size={18} color="#888" className={`nr-dropup-icon ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="nr-dropup-menu" role="listbox">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`nr-dropup-option ${String(option.value) === String(value) ? 'active' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const NewReception = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedPet, setSelectedPet] = useState('');
    const [pets, setPets] = useState([]);
    const [customerId, setCustomerId] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const [showAddPetModal, setShowAddPetModal] = useState(false);
    const [newPetName, setNewPetName] = useState('');
    const [newPetSpecies, setNewPetSpecies] = useState('');
    const [newPetBreed, setNewPetBreed] = useState('');
    const [newPetDateOfBirth, setNewPetDateOfBirth] = useState('');

    const [isEmergency, setIsEmergency] = useState(false);
    const [weight, setWeight] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [examType, setExamType] = useState('');
    const [assignedDoctor, setAssignedDoctor] = useState('');
    const [doctorOptions, setDoctorOptions] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [doctorsError, setDoctorsError] = useState('');
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [toast, setToast] = useState(null);

    const selectedDoctorInfo = useMemo(
        () => doctorOptions.find((item) => String(item?.id) === String(assignedDoctor)),
        [doctorOptions, assignedDoctor]
    );

    const assignedCasesLabel = useMemo(() => {
        if (!assignedDoctor || !selectedDoctorInfo) return '--';
        return `${Number(selectedDoctorInfo.waitingCases || 0)} ca`;
    }, [assignedDoctor, selectedDoctorInfo]);

    const selectedPetInfo = useMemo(
        () => pets.find((pet) => String(pet?.id) === String(selectedPet)) || null,
        [pets, selectedPet]
    );

    const selectedPetBirthDate = useMemo(() => {
        if (!selectedPetInfo?.dateOfBirth) return '';
        const rawDate = String(selectedPetInfo.dateOfBirth);
        return rawDate.length >= 10 ? rawDate.slice(0, 10) : rawDate;
    }, [selectedPetInfo]);

    const selectedBreedOptions = useMemo(() => {
        return PET_BREED_OPTIONS[newPetSpecies] || [];
    }, [newPetSpecies]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        const customer = location.state?.customer;
        if (!customer) return;

        setCustomerId(customer?.id || null);
        setCustomerName(customer?.name || customer?.fullName || '');
        setCustomerPhone(customer?.phone || customer?.phoneNumber || '');

        const incomingPets = (customer?.pets || []).map((pet, index) => ({
            id: pet?.id || `temp-${index}`,
            name: pet?.name || 'Thú cưng',
            species: pet?.species || '',
            breed: pet?.breed || '',
            dateOfBirth: pet?.dateOfBirth || '',
            age: pet?.age || '',
            weight: pet?.weight || '',
            gender: pet?.gender || '',
        }));

        setPets(incomingPets);
        if (incomingPets.length > 0) {
            setSelectedPet(incomingPets[0].id);
        }
    }, [location.state]);

    useEffect(() => {
        let isMounted = true;

        const fetchDoctors = async () => {
            setIsLoadingDoctors(true);
            setDoctorsError('');
            try {
                const response = await receptionService.getDoctorsWithWaitingCases();
                if (!isMounted) return;

                const doctors = (response?.normalizedData || [])
                    .map((item) => ({
                        id: item?.doctorId || item?.id,
                        fullName: item?.doctorName || item?.fullName || `Bác sĩ #${item?.doctorId || item?.id}`,
                        waitingCases: Number(item?.waitingCases || item?.waitingCaseCount || 0),
                    }))
                    .filter((item) => item?.id);

                setDoctorOptions(doctors);
            } catch {
                if (!isMounted) return;
                setDoctorOptions([]);
                setDoctorsError('Không thể tải danh sách bác sĩ.');
                showToast('error', 'Lỗi tải danh sách bác sĩ.');
            } finally {
                if (isMounted) {
                    setIsLoadingDoctors(false);
                }
            }
        };

        fetchDoctors();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleRetryDoctors = async () => {
        setIsLoadingDoctors(true);
        setDoctorsError('');
        try {
            const response = await receptionService.getDoctorsWithWaitingCases();
            const doctors = (response?.normalizedData || [])
                .map((item) => ({
                    id: item?.doctorId || item?.id,
                    fullName: item?.doctorName || item?.fullName || `Bác sĩ #${item?.doctorId || item?.id}`,
                    waitingCases: Number(item?.waitingCases || item?.waitingCaseCount || 0),
                }))
                .filter((item) => item?.id);
            setDoctorOptions(doctors);
            showToast('success', 'Đã tải lại danh sách bác sĩ.');
        } catch {
            setDoctorOptions([]);
            setDoctorsError('Không thể tải danh sách bác sĩ.');
            showToast('error', 'Thử lại thất bại khi tải bác sĩ.');
        } finally {
            setIsLoadingDoctors(false);
        }
    };

    const hydrateCustomerPets = async (id) => {
        const petsResponse = await customerService.getCustomerPets(id);
        const petItems = petsResponse?.data || [];
        const mappedPets = petItems.map((pet) => ({
            id: pet?.id,
            name: pet?.name || 'Thú cưng',
            species: pet?.species || '',
            breed: pet?.breed || '',
            dateOfBirth: pet?.dateOfBirth || '',
            age: pet?.age || '',
            weight: pet?.weight || '',
            gender: pet?.gender || '',
        }));
        setPets(mappedPets);
        if (mappedPets.length > 0) {
            setSelectedPet(mappedPets[0].id);
        }
    };

    const goToTodayOrders = () => {
        navigate(RECEPTIONIST_PATHS.TODAY_ORDERS);
    };

    const handleCreatePet = async () => {
        if (!newPetName.trim() || !newPetSpecies || !newPetBreed.trim() || !newPetDateOfBirth) {
            showToast('error', 'Vui lòng nhập đủ thông tin thú cưng, gồm cả ngày sinh.');
            return;
        }

        if (!customerId) {
            showToast('error', 'Vui lòng chọn khách hàng trước khi tạo thú cưng mới.');
            return;
        }

        try {
            const response = await petService.createPet({
                clientId: customerId,
                name: newPetName.trim(),
                species: newPetSpecies,
                breed: newPetBreed.trim(),
                dateOfBirth: newPetDateOfBirth,
            });
            const pet = response?.data?.data;
            if (!pet?.id) {
                throw new Error('Không thể tạo thú cưng mới.');
            }

            const createdPet = {
                id: pet.id,
                name: pet.name || newPetName.trim(),
                species: pet.species || newPetSpecies,
                breed: pet.breed || newPetBreed.trim(),
                dateOfBirth: pet.dateOfBirth || newPetDateOfBirth,
                age: pet.age || '',
                weight: pet.weight || '',
                gender: pet.gender || '',
            };

            setPets((prev) => [...prev, createdPet]);
            setSelectedPet(createdPet.id);
            setShowAddPetModal(false);
            setNewPetName('');
            setNewPetSpecies('');
            setNewPetBreed('');
            setNewPetDateOfBirth('');
            showToast('success', 'Tạo thú cưng thành công.');
        } catch (error) {
            setSubmitError(error?.message || 'Không thể tạo thú cưng mới. Vui lòng thử lại.');
            showToast('error', error?.message || 'Tạo thú cưng thất bại.');
        }
    };

    const handleCreateReception = async () => {
        if (isSubmitting) return;

        setSubmitError('');
        setIsSubmitting(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
            const currentUserResponse = await userService.getUsers().catch(() => null);
            const receptionistId = Number(currentUserResponse?.data?.id || currentUser?.id);
            const doctorId = Number(assignedDoctor);
            const weightValue = Number(weight);

            if (!customerId) {
                throw new Error('Vui lòng chọn khách hàng từ màn tiếp đón trước khi tạo phiếu.');
            }
            if (!receptionistId) {
                throw new Error('Không xác định được thông tin lễ tân hiện tại.');
            }
            if (!doctorId) {
                throw new Error('Vui lòng chọn bác sĩ phụ trách.');
            }
            if (!weight || Number.isNaN(weightValue) || weightValue <= 0) {
                throw new Error('Vui lòng nhập cân nặng hợp lệ lớn hơn 0.');
            }
            if (!reason) {
                throw new Error('Vui lòng chọn lý do khám.');
            }
            if (!selectedPet) {
                throw new Error('Vui lòng chọn thú cưng hoặc tạo mới thú cưng trước khi tạo phiếu.');
            }

            await receptionService.createReception({
                clientId: customerId,
                petId: Number(selectedPet),
                receptionistId,
                doctorId,
                examReason: EXAM_REASON_OPTIONS[reason] || reason,
                symptomDescription: description || '',
                note: notes || '',
                weight: weightValue,
                examType: EXAM_TYPE_OPTIONS[examType] || 'lâm sàng',
                emergency: isEmergency,
            });

            navigate(RECEPTIONIST_PATHS.TODAY_ORDERS);
            showToast('success', 'Tạo phiếu tiếp đón thành công.');
        } catch (error) {
            setSubmitError(error?.message || 'Không thể tạo phiếu tiếp đón. Vui lòng thử lại.');
            showToast('error', error?.message || 'Tạo phiếu tiếp đón thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!customerId) return;
        hydrateCustomerPets(customerId).catch(() => {
            showToast('error', 'Không thể tải danh sách thú cưng của khách hàng.');
        });
    }, [customerId]);

    return (
        <ReceptionistLayout>
            <div className="new-reception-page">
                <header className="nr-header">
                    <button className="nr-btn-icon" type="button" onClick={goToTodayOrders}>
                        <ChevronLeft size={24} color="#1a1a1a" />
                    </button>
                    <h1 className="nr-title">Tiếp đón mới</h1>
                </header>

                <div className="nr-content">
                    <div className="nr-customer-section">
                        <div className="nr-customer-row">
                            <h2 className="nr-customer-name">{customerName || 'Khách hàng'}</h2>
                        </div>
                        <div className="nr-customer-sub-row">
                            <div className="nr-customer-phone">
                                <Phone size={20} color="#209D80" />
                                <input
                                    type="text"
                                    className="nr-customer-input nr-customer-input-plain"
                                    placeholder="Số điện thoại"
                                    value={customerPhone}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    <div className="nr-pet-chips">
                        {pets.map((pet) => (
                            <button
                                key={pet.id || pet.name}
                                className={`nr-pet-chip ${String(selectedPet) === String(pet.id || pet.name) ? 'active' : ''}`}
                                onClick={() => setSelectedPet(pet.id || pet.name)}
                            >
                                <PawPrint size={14} />
                                <span>{pet.name}</span>
                            </button>
                        ))}
                        <button type="button" className="nr-pet-chip-add" onClick={() => setShowAddPetModal(true)}>
                            <CirclePlus size={36} color="#209D80" />
                        </button>
                    </div>

                    {selectedPetInfo && (
                        <div className="nr-pet-info-bar" aria-live="polite">
                            <div className="nr-pet-info-details nr-pet-info-details-single-line">
                                <span className="nr-pet-info-name">{selectedPetInfo?.name || '---'}</span>
                                <span className="nr-pet-info-breed">
                                    {(SPECIES_LABELS[String(selectedPetInfo?.species || '').toLowerCase()] || selectedPetInfo?.species || '').trim()} {selectedPetInfo?.breed || ''}
                                </span>
                                {String(selectedPetInfo?.gender || '').trim() && (
                                    <span className="nr-pet-info-stat">
                                        {(String(selectedPetInfo?.gender || '').trim().toLowerCase() === 'female' || String(selectedPetInfo?.gender || '').trim().toLowerCase() === 'cái')
                                            ? <Venus size={12} color="#ec4899" />
                                            : <Mars size={12} color="#3b82f6" />}
                                    </span>
                                )}
                                <span className="nr-pet-info-stat"><Cake size={13} color="#888" /> {selectedPetInfo?.age || calcAgeLabel(selectedPetInfo?.dateOfBirth)}</span>
                            </div>
                        </div>
                    )}

                    <div className="nr-form-section">
                        <h3 className="nr-form-title">Thông tin tiếp đón</h3>

                        <div className="nr-field">
                            <label className="nr-field-label">Cân nặng <span className="nr-required">*</span></label>
                            <div className="nr-input-with-suffix">
                                <input
                                    type="text"
                                    className="nr-input"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                                <span className="nr-input-suffix">kg</span>
                            </div>
                        </div>

                        <div className="nr-field">
                            <label className="nr-field-label">Ngày sinh</label>
                            <div className="nr-input-wrapper">
                                <input
                                    type="text"
                                    className="nr-input"
                                    value={selectedPetBirthDate || 'Chưa có ngày sinh'}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="nr-field">
                            <label className="nr-field-label">Lý do khám <span className="nr-required">*</span></label>
                            <div className="nr-select-wrapper">
                                <DropupSelect
                                    value={reason}
                                    onChange={setReason}
                                    placeholder="-- Chọn lý do khám --"
                                    options={[
                                        { value: 'behohap', label: 'Bệnh hô hấp' },
                                        { value: 'tieuhoa', label: 'Bệnh tiêu hóa' },
                                        { value: 'dalieu', label: 'Bệnh da liễu' },
                                        { value: 'khac', label: 'Khác' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="nr-field">
                            <label className="nr-field-label">Mô tả</label>
                            <textarea className="nr-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                        </div>

                        <div className="nr-field">
                            <label className="nr-field-label">Hình thức khám</label>
                            <div className="nr-select-wrapper">
                                <DropupSelect
                                    value={examType}
                                    onChange={setExamType}
                                    placeholder="-- Chọn hình thức khám --"
                                    options={[
                                        { value: 'khammoi', label: 'Khám mới' },
                                        { value: 'taikham', label: 'Tái khám' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="nr-assigned-row">
                            <div className="nr-field nr-assigned-field">
                                <label className="nr-field-label">Bác sĩ phụ trách <span className="nr-required">*</span></label>
                                <div className="nr-select-wrapper">
                                    {isLoadingDoctors ? (
                                        <div className="nr-select-skeleton" aria-hidden="true"></div>
                                    ) : (
                                        <DropupSelect
                                            value={assignedDoctor}
                                            onChange={setAssignedDoctor}
                                            placeholder="-- Bác sĩ phụ trách --"
                                            options={doctorOptions.map((doctor) => ({
                                                value: String(doctor.id),
                                                label: doctor.fullName,
                                            }))}
                                        />
                                    )}
                                </div>
                                {doctorsError && (
                                    <div className="nr-inline-error-row">
                                        <span className="nr-inline-error">{doctorsError}</span>
                                        <button type="button" className="nr-inline-retry" onClick={handleRetryDoctors}>Thử lại</button>
                                    </div>
                                )}
                            </div>
                            <div className={`nr-shift-select-wrapper nr-shift-display-wrapper ${assignedDoctor ? 'active' : ''} ${assignedDoctor ? 'has-value' : 'is-empty'}`}>
                                <span className="nr-shift-display" aria-live="polite">{assignedCasesLabel}</span>
                            </div>
                        </div>

                        <div className="nr-field">
                            <label className="nr-field-label">Lưu ý</label>
                            <textarea className="nr-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                        </div>

                        <div className="nr-toggle-row">
                            <div className={`nr-toggle ${isEmergency ? 'active' : ''}`} onClick={() => setIsEmergency(!isEmergency)}>
                                <div className="nr-toggle-thumb"></div>
                            </div>
                            <span className="nr-toggle-label">Cấp cứu</span>
                        </div>
                    </div>
                </div>

                <div className="nr-bottom-actions">
                    <button className="nr-btn-cancel" type="button" onClick={goToTodayOrders}>Hủy bỏ</button>
                    <button className="nr-btn-submit" type="button" onClick={handleCreateReception} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang tạo...' : 'Tạo phiếu'}
                    </button>
                </div>

                {submitError && <p className="nr-submit-error">{submitError}</p>}

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
                                        <DropupSelect
                                            value={newPetSpecies}
                                            onChange={(value) => {
                                                setNewPetSpecies(value);
                                                setNewPetBreed('');
                                            }}
                                            placeholder="-- Chọn loài --"
                                            triggerClassName="nr-pet-modal-dropup-trigger"
                                            options={[
                                                { value: 'cho', label: 'Chó' },
                                                { value: 'meo', label: 'Mèo' },
                                                { value: 'khac', label: 'Khác' },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="nr-pet-modal-field">
                                <label className="nr-pet-modal-label">Giống <span className="nr-required">*</span></label>
                                {(newPetSpecies === 'cho' || newPetSpecies === 'meo') && (
                                    <div className="nr-pet-modal-select-wrapper">
                                        <DropupSelect
                                            value={newPetBreed}
                                            onChange={setNewPetBreed}
                                            placeholder="-- Chọn giống --"
                                            triggerClassName="nr-pet-modal-dropup-trigger"
                                            options={selectedBreedOptions.map((breed) => ({
                                                value: breed,
                                                label: breed,
                                            }))}
                                        />
                                    </div>
                                )}
                                {newPetSpecies === 'khac' && (
                                    <input
                                        type="text"
                                        className="nr-pet-modal-input"
                                        placeholder="Nhập giống thú cưng"
                                        value={newPetBreed}
                                        onChange={(e) => setNewPetBreed(e.target.value)}
                                    />
                                )}
                                {!newPetSpecies && (
                                    <input
                                        type="text"
                                        className="nr-pet-modal-input"
                                        placeholder="Chọn loài trước"
                                        value=""
                                        readOnly
                                    />
                                )}
                            </div>

                            <div className="nr-pet-modal-field">
                                <label className="nr-pet-modal-label">Ngày sinh <span className="nr-required">*</span></label>
                                <input
                                    type="date"
                                    className="nr-pet-modal-input"
                                    value={newPetDateOfBirth}
                                    onChange={(e) => setNewPetDateOfBirth(e.target.value)}
                                />
                            </div>

                            <div className="nr-pet-modal-actions">
                                <button type="button" className="nr-pet-modal-btn-cancel" onClick={() => setShowAddPetModal(false)}>Hủy bỏ</button>
                                <button type="button" className="nr-pet-modal-btn-submit" onClick={handleCreatePet}>Tạo mới</button>
                            </div>
                        </div>
                    </>
                )}

                {toast && (
                    <div className={`nr-toast nr-toast-${toast.type}`} role="status" aria-live="polite">
                        {toast.message}
                    </div>
                )}
            </div>
        </ReceptionistLayout>
    );
};

export default NewReception;
