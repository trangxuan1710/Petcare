import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Phone, PawPrint, CirclePlus, UserRound, Weight, Mars, Venus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReceptionistLayout from '../../layouts/ReceptionistLayout';
import { RECEPTIONIST_PATHS } from '../../routes/receptionistPaths';
import customerService from '../../api/customerService';
import petService from '../../api/petService';
import receptionService from '../../api/receptionService';
import userService from '../../api/userService';
import lookupService from '../../api/lookupService';
import { toTitleCase } from '../../utils/textFormat';
import './NewReception.css';

// Exam reason will be provided as a single-line text input (Vietnamese)


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
};

const RECEPTION_ALREADY_OPEN_CODE = 1020;
const RECEPTION_ALREADY_OPEN_MESSAGE = 'There is an existing open reception for this pet';

const DEFAULT_EXAM_TYPE_OPTIONS = [
    { value: 'khammoi', label: 'Khám mới' },
    { value: 'taikham', label: 'Tái khám' },
];

const DEFAULT_SPECIES_OPTIONS = [
    { value: 'cho', label: 'Chó' },
    { value: 'meo', label: 'Mèo' },
];

const extractApiErrorMessage = (error, fallbackMessage) => {
    const apiCode = Number(error?.response?.data?.code);
    const apiMessage = String(
        error?.response?.data?.message
        || error?.response?.data?.error
        || error?.response?.data?.detail
        || ''
    ).trim();

    if (apiCode === RECEPTION_ALREADY_OPEN_CODE || apiMessage === RECEPTION_ALREADY_OPEN_MESSAGE) {
        return 'Thú cưng này đang có phiếu tiếp đón chưa hoàn thành. Vui lòng hoàn tất phiếu cũ trước khi tạo mới.';
    }

    if (apiMessage) {
        return apiMessage;
    }

    const genericMessage = String(error?.message || '').trim();
    if (genericMessage && !/status code\s*\d{3}/i.test(genericMessage)) {
        return genericMessage;
    }

    return fallbackMessage;
};

const formatDisplayDate = (rawDate) => {
    if (!rawDate) return '';
    const value = String(rawDate).trim();
    const exact = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (exact) {
        return `${exact[3]}-${exact[2]}-${exact[1]}`;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const dd = String(parsed.getDate()).padStart(2, '0');
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

const resolvePetHasHistory = (pet) => {
    if (!pet || typeof pet !== 'object') return false;
    return Boolean(
        pet?.hasHistory === true
        || pet?.hasReceptionHistory === true
        || pet?.hasSuccessfulReceptionHistory === true
        || pet?.receptionRecordSuccess === true
    );
};

const PET_NAME_ALLOWED_PATTERN = /^[\p{L}\p{M}\s]+$/u;
const normalizePetName = (value = '') => String(value).replace(/\s+/g, ' ').trim();
const validatePetName = (value = '') => {
    const normalized = normalizePetName(value);
    if (!normalized) {
        return 'Vui lòng nhập tên thú cưng.';
    }
    if (!PET_NAME_ALLOWED_PATTERN.test(normalized)) {
        return 'Tên thú chỉ được chứa chữ tiếng Việt và khoảng trắng.';
    }
    return '';
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
                            ref={el => el && el.style.setProperty('font-weight', '400', 'important')}
                            className={`nr-dropup-option ${String(option.value) === String(value) ? 'active' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.content || option.label}
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
    const [newPetGender, setNewPetGender] = useState('Male');
    const [newPetDateOfBirth, setNewPetDateOfBirth] = useState('');
    const [newPetErrors, setNewPetErrors] = useState({
        name: '',
    });
    const [isCreatingPet, setIsCreatingPet] = useState(false);

    const [isEmergency, setIsEmergency] = useState(false);
    const [weight, setWeight] = useState('');
    const [description, setDescription] = useState(''); // now used as `examReason` single-line input
    const [examType, setExamType] = useState('');
    const [assignedDoctor, setAssignedDoctor] = useState('');
    const [doctorOptions, setDoctorOptions] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [doctorsError, setDoctorsError] = useState('');
    const [speciesOptions, setSpeciesOptions] = useState(DEFAULT_SPECIES_OPTIONS);
    const [breedOptionsBySpecies, setBreedOptionsBySpecies] = useState({});
    const [examTypeOptions, setExamTypeOptions] = useState(DEFAULT_EXAM_TYPE_OPTIONS);
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [toast, setToast] = useState(null);

    const selectedDoctorInfo = useMemo(
        () => doctorOptions.find((item) => String(item?.id) === String(assignedDoctor)),
        [doctorOptions, assignedDoctor]
    );
    const selectedExamTypeInfo = useMemo(
        () => examTypeOptions.find((item) => String(item?.value) === String(examType)),
        [examTypeOptions, examType]
    );

    const assignedCasesLabel = useMemo(() => {
        if (!assignedDoctor || !selectedDoctorInfo) return '--';
        return `${Number(selectedDoctorInfo.waitingCases || 0)} ca`;
    }, [assignedDoctor, selectedDoctorInfo]);

    const selectedPetInfo = useMemo(
        () => pets.find((pet) => String(pet?.id) === String(selectedPet)) || null,
        [pets, selectedPet]
    );

    const displayCustomerName = useMemo(
        () => toTitleCase(customerName) || customerName || 'Khách hàng',
        [customerName]
    );

    // when pet has no history, lock exam type as "khám mới"
    useEffect(() => {
        if (!selectedPetInfo) {
            setExamType('');
            return;
        }

        if (selectedPetInfo.hasHistory === false) {
            setExamType('khammoi');
        }
    }, [selectedPetInfo]);

    const selectedPetBirthDate = useMemo(() => {
        if (!selectedPetInfo?.dateOfBirth) return '';
        return formatDisplayDate(selectedPetInfo.dateOfBirth);
    }, [selectedPetInfo]);

    const speciesLabelMap = useMemo(() => {
        const fromLookup = speciesOptions.reduce((acc, option) => {
            acc[String(option.value || option.code || '').toLowerCase()] = option.label;
            return acc;
        }, {});
        return { ...SPECIES_LABELS, ...fromLookup };
    }, [speciesOptions]);

    const selectedBreedOptions = useMemo(() => {
        const speciesKey = String(newPetSpecies || '').toLowerCase();
        return breedOptionsBySpecies[speciesKey] || PET_BREED_OPTIONS[speciesKey] || [];
    }, [breedOptionsBySpecies, newPetSpecies]);
    const isCreatePetFormInvalid = useMemo(() => Boolean(validatePetName(newPetName)), [newPetName]);

    const hasBreedDropdown = selectedBreedOptions.length > 0;

    const isPetSelected = Boolean(selectedPet);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        let isMounted = true;

        const hydrateLookups = async () => {
            try {
                const [species, breeds, examTypes] = await Promise.all([
                    lookupService.listPetSpecies(),
                    lookupService.listPetBreeds(),
                    lookupService.listExamTypes(),
                ]);

                if (!isMounted) return;

                const selectableSpecies = species.filter((option) => String(option?.value || option?.code || '').toLowerCase() !== 'khac');
                if (selectableSpecies.length > 0) {
                    setSpeciesOptions(selectableSpecies);
                }
                if (examTypes.length > 0) {
                    setExamTypeOptions(examTypes);
                }
                if (breeds.length > 0) {
                    const grouped = breeds.reduce((acc, breed) => {
                        const speciesKey = String(breed.parentCode || '').toLowerCase();
                        if (!speciesKey) return acc;
                        if (!acc[speciesKey]) acc[speciesKey] = [];
                        acc[speciesKey].push(breed.label || breed.value);
                        return acc;
                    }, {});
                    setBreedOptionsBySpecies(grouped);
                }
            } catch {
                if (isMounted) {
                    setSpeciesOptions(DEFAULT_SPECIES_OPTIONS);
                    setExamTypeOptions(DEFAULT_EXAM_TYPE_OPTIONS);
                }
            }
        };

        hydrateLookups();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const customer = location.state?.customer;
        if (!customer) return;

        setCustomerId(customer?.id || null);
        setCustomerName(toTitleCase(customer?.name || customer?.fullName || ''));
        setCustomerPhone(customer?.phone || customer?.phoneNumber || '');

        const incomingPets = (customer?.pets || []).map((pet, index) => ({
            id: pet?.id || `temp-${index}`,
            name: toTitleCase(pet?.name || 'Thú cưng') || 'Thú cưng',
            species: pet?.species || '',
            breed: toTitleCase(pet?.breed || ''),
            dateOfBirth: pet?.dateOfBirth || '',
            weight: pet?.weight || '',
            gender: pet?.gender || '',
            hasHistory: resolvePetHasHistory(pet),
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
            name: toTitleCase(pet?.name || 'Thú cưng') || 'Thú cưng',
            species: pet?.species || '',
            breed: toTitleCase(pet?.breed || ''),
            dateOfBirth: pet?.dateOfBirth || '',
            weight: pet?.weight || '',
            gender: pet?.gender || '',
            hasHistory: resolvePetHasHistory(pet),
        }));
        setPets(mappedPets);
        if (mappedPets.length > 0) {
            setSelectedPet(mappedPets[0].id);
        }
    };

    const goBack = () => {
        navigate(-1);
    };

    const openAddPetModal = () => {
        setNewPetErrors({ name: '' });
        setShowAddPetModal(true);
    };

    const closeAddPetModal = () => {
        if (isCreatingPet) return;
        setShowAddPetModal(false);
    };

    const handleCreatePet = async () => {
        if (isCreatingPet) return;

        const normalizedPetName = normalizePetName(newPetName);
        const nameError = validatePetName(normalizedPetName);
        setNewPetErrors({ name: nameError });
        if (nameError) {
            showToast('error', nameError);
            return;
        }

        if (!normalizedPetName || !newPetSpecies || !newPetBreed.trim() || !newPetDateOfBirth) {
            showToast('error', 'Vui lòng nhập đủ thông tin thú cưng, gồm cả ngày sinh.');
            return;
        }

        if (!customerId) {
            showToast('error', 'Vui lòng chọn khách hàng trước khi tạo thú cưng mới.');
            return;
        }

        const selectedDate = new Date(newPetDateOfBirth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            showToast('error', 'Ngày sinh không được lớn hơn ngày hiện tại.');
            return;
        }

        setIsCreatingPet(true);
        try {
            const response = await petService.createPet({
                clientId: customerId,
                name: normalizedPetName,
                species: newPetSpecies,
                breed: newPetBreed.trim(),
                gender: newPetGender,
                dateOfBirth: newPetDateOfBirth,
            });
            const pet = response?.data?.data;
            if (!pet?.id) {
                throw new Error('Không thể tạo thú cưng mới.');
            }

            const createdPet = {
                id: pet.id,
                name: toTitleCase(pet.name || normalizedPetName) || 'Thú cưng',
                species: pet.species || newPetSpecies,
                breed: toTitleCase(pet.breed || newPetBreed.trim()),
                dateOfBirth: pet.dateOfBirth || newPetDateOfBirth,
                weight: pet.weight || '',
                gender: pet.gender || newPetGender,
                hasHistory: false,
            };

            setPets((prev) => [...prev, createdPet]);
            setSelectedPet(createdPet.id);
            setShowAddPetModal(false);
            setNewPetName('');
            setNewPetSpecies('');
            setNewPetBreed('');
            setNewPetGender('Male');
            setNewPetDateOfBirth('');
            setNewPetErrors({ name: '' });
            showToast('success', 'Tạo thú cưng thành công.');
        } catch (error) {
            const message = extractApiErrorMessage(error, 'Không thể tạo thú cưng mới. Vui lòng thử lại.');
            setSubmitError(message);
            showToast('error', message);
        } finally {
            setIsCreatingPet(false);
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
            if (!description || !description.trim()) {
                throw new Error('Vui lòng nhập Mô tả triệu chứng.');
            }
            if (!selectedPet) {
                throw new Error('Vui lòng chọn thú cưng hoặc tạo mới thú cưng trước khi tạo phiếu.');
            }

            // Robust resolution of exam type info
            const fallbackOption = examTypeOptions[0];
            const currentExamType = selectedPetInfo?.hasHistory === false 
                ? 'khammoi' 
                : (examType || fallbackOption?.value || 'khammoi');
            
            const effectiveOption = examTypeOptions.find(opt => String(opt.value) === String(currentExamType));
            const examTypeOptionId = effectiveOption?.id || null;

            await receptionService.createReception({
                clientId: customerId,
                petId: Number(selectedPet),
                receptionistId,
                doctorId,
                examReason: description.trim(),
                note: notes || '',
                weight: weightValue,
                examTypeOptionId,
                examType: currentExamType,
                emergency: isEmergency,
            });

            navigate(RECEPTIONIST_PATHS.TODAY_ORDERS);
            showToast('success', 'Tạo phiếu tiếp đón thành công.');
        } catch (error) {
            const message = extractApiErrorMessage(error, 'Không thể tạo phiếu tiếp đón. Vui lòng thử lại.');
            setSubmitError(message);
            showToast('error', message);
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
                    <button className="nr-btn-icon" type="button" onClick={goBack}>
                        <ChevronLeft size={24} color="#1a1a1a" />
                    </button>
                    <h1 className="nr-title">Tiếp đón mới</h1>
                </header>

                <div className="nr-content">
                    <div className="nr-customer-section">
                        <div className="nr-customer-row">
                            <h2 className="nr-customer-name">{displayCustomerName}</h2>
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
                                <span>{toTitleCase(pet.name) || pet.name}</span>
                            </button>
                        ))}
                        <button type="button" className="nr-pet-chip-add" onClick={openAddPetModal}>
                            <CirclePlus size={36} color="#209D80" />
                        </button>
                    </div>

                    {selectedPetInfo && (
                        <div className="nr-pet-info-bar" aria-live="polite">
                            <div className="nr-pet-info-details nr-pet-info-details-single-line">
                                <span className="nr-pet-info-name">{toTitleCase(selectedPetInfo?.name) || '---'}</span>
                                <span className="nr-pet-info-breed">
                                    {(speciesLabelMap[String(selectedPetInfo?.species || '').toLowerCase()] || selectedPetInfo?.species || '').trim()} {toTitleCase(selectedPetInfo?.breed || '')}
                                </span>
                                {String(selectedPetInfo?.gender || '').trim() && (
                                    <span className="nr-pet-info-stat">
                                        {(String(selectedPetInfo?.gender || '').trim().toLowerCase() === 'female' || String(selectedPetInfo?.gender || '').trim().toLowerCase() === 'cái')
                                            ? <Venus size={12} color="#ec4899" />
                                            : <Mars size={12} color="#3b82f6" />}
                                    </span>
                                )}
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
                                    onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ''))}
                                    disabled={!isPetSelected}
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

                        {/* Removed categorical reason select. Use single-line text input below as 'Mô tả triệu chứng' */}

                        <div className="nr-field">
                            <label className="nr-field-label">Mô tả triệu chứng <span className="nr-required">*</span></label>
                            <div className="nr-input-wrapper">
                                <textarea
                                    className="nr-input nr-textarea-auto"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={!isPetSelected}
                                    placeholder={isPetSelected ? 'Nhập Mô tả triệu chứng' : 'Chọn thú cưng để nhập Mô tả triệu chứng'}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="nr-field">
                            <label className="nr-field-label">Hình thức khám</label>
                            <div className="nr-select-wrapper">
                                <DropupSelect
                                    value={examType}
                                    onChange={setExamType}
                                    placeholder="-- Chọn hình thức khám --"
                                    options={examTypeOptions}
                                    disabled={!isPetSelected || (selectedPetInfo && selectedPetInfo.hasHistory === false)}
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
                                            placeholder="Bác sĩ phụ trách"
                                            options={doctorOptions.map((doctor) => ({
                                                value: String(doctor.id),
                                                label: doctor.fullName,
                                                content: (
                                                    <span className="nr-doctor-option">
                                                        <span>{doctor.fullName}</span>
                                                        <span className="nr-doctor-option-count">{Number(doctor.waitingCases || 0)} ca</span>
                                                    </span>
                                                ),
                                            }))}
                                            disabled={!isPetSelected}
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
                            <div className="nr-input-wrapper">
                                <input 
                                    type="text" 
                                    className="nr-input" 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                    placeholder="Nhập lưu ý (nếu có)"
                                    disabled={!isPetSelected} 
                                />
                            </div>
                        </div>

                        <div className="nr-toggle-row">
                            <div
                                className={`nr-toggle ${isEmergency ? 'active' : ''} ${!isPetSelected ? 'disabled' : ''}`}
                                role="switch"
                                aria-checked={isEmergency}
                                aria-disabled={!isPetSelected}
                                tabIndex={isPetSelected ? 0 : -1}
                                onClick={() => { if (!isPetSelected) return; setIsEmergency(!isEmergency); }}
                                onKeyDown={(e) => { if (!isPetSelected) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsEmergency(!isEmergency); } }}
                            >
                                <div className="nr-toggle-thumb"></div>
                            </div>
                            <span className="nr-toggle-label">Cấp cứu</span>
                        </div>
                    </div>
                </div>

                <div className="nr-bottom-actions">
                    <button className="nr-btn-cancel" type="button" onClick={goBack}>Hủy bỏ</button>
                    <button className="nr-btn-submit" type="button" onClick={handleCreateReception} disabled={!isPetSelected || isSubmitting}>
                        {isSubmitting ? 'Đang tạo...' : 'Tạo phiếu'}
                    </button>
                </div>

                {submitError && <p className="nr-submit-error">{submitError}</p>}

                {showAddPetModal && (
                    <>
                        <div className="nr-pet-modal-overlay" onClick={closeAddPetModal}></div>
                        <div className="nr-pet-modal">
                            <div className="nr-pet-modal-handle"></div>
                            <h3 className="nr-pet-modal-title">Tạo mới thú cưng</h3>

                            <div className="nr-pet-modal-form-row">
                                <div className="nr-pet-modal-field-group nr-pet-modal-field-half">
                                    <div className={`nr-pet-modal-field ${newPetErrors.name ? 'is-invalid' : ''}`}>
                                        <label className="nr-pet-modal-label">Thú cưng <span className="nr-required">*</span></label>
                                        <input
                                            type="text"
                                            className="nr-pet-modal-input"
                                            value={newPetName}
                                            onChange={(e) => {
                                                const nextName = e.target.value;
                                                setNewPetName(nextName);
                                                setNewPetErrors({ name: validatePetName(nextName) });
                                            }}
                                            onBlur={(e) => {
                                                setNewPetErrors({ name: validatePetName(e.target.value) });
                                            }}
                                            required
                                            aria-required="true"
                                            aria-invalid={Boolean(newPetErrors.name)}
                                        />
                                    </div>
                                    {newPetErrors.name && (
                                        <p className="nr-pet-modal-field-error">{newPetErrors.name}</p>
                                    )}
                                </div>
                                <div className="nr-pet-modal-field-group nr-pet-modal-field-half">
                                    <div className="nr-pet-modal-field">
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
                                                options={speciesOptions}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="nr-pet-modal-field">
                                <label className="nr-pet-modal-label">Giống <span className="nr-required">*</span></label>
                                {hasBreedDropdown && (
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
                                {newPetSpecies && !hasBreedDropdown && (
                                    <input
                                        type="text"
                                        className="nr-pet-modal-input"
                                        placeholder="Nhập giống thú cưng"
                                        value={newPetBreed}
                                        onChange={(e) => setNewPetBreed(e.target.value)}
                                        required
                                        aria-required="true"
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
                                <label className="nr-pet-modal-label">Giới tính <span className="nr-required">*</span></label>
                                <div className="nr-pet-modal-select-wrapper">
                                    <DropupSelect
                                        value={newPetGender}
                                        onChange={setNewPetGender}
                                        placeholder="-- Chọn giới tính --"
                                        triggerClassName="nr-pet-modal-dropup-trigger"
                                        options={[
                                            { value: 'Male', label: 'Đực' },
                                            { value: 'Female', label: 'Cái' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="nr-pet-modal-field">
                                <label className="nr-pet-modal-label">Ngày sinh <span className="nr-required">*</span></label>
                                <input
                                    type="date"
                                    className="nr-pet-modal-input"
                                    value={newPetDateOfBirth}
                                    onChange={(e) => setNewPetDateOfBirth(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                    aria-required="true"
                                />
                            </div>

                            <div className="nr-pet-modal-actions">
                                <button type="button" className="nr-pet-modal-btn-cancel" onClick={closeAddPetModal}>Hủy bỏ</button>
                                <button
                                    type="button"
                                    className="nr-pet-modal-btn-submit"
                                    onClick={handleCreatePet}
                                    disabled={isCreatingPet || isCreatePetFormInvalid}
                                >
                                    {isCreatingPet ? 'Đang tạo...' : 'Tạo mới'}
                                </button>
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
