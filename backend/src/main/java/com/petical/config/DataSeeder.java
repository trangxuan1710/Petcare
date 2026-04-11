package com.petical.config;

import com.github.javafaker.Faker;
import com.petical.entity.Client;
import com.petical.entity.Doctor;
import com.petical.entity.ExamForm;
import com.petical.entity.ExamResult;
import com.petical.entity.ExamStatus;
import com.petical.entity.Invoice;
import com.petical.entity.MedicalRecord;
import com.petical.entity.Medicine;
import com.petical.entity.PaymentMethod;
import com.petical.entity.Pet;
import com.petical.entity.Prescription;
import com.petical.entity.PrescriptionDetail;
import com.petical.entity.ReceptionRecord;
import com.petical.entity.ReceptionService;
import com.petical.entity.Receptionist;
import com.petical.entity.Service;
import com.petical.entity.ServiceOrder;
import com.petical.entity.ServiceResult;
import com.petical.entity.Technician;
import com.petical.entity.TreatmentDirection;
import com.petical.enums.ExamType;
import com.petical.enums.ReceptionServiceStatus;
import com.petical.enums.ReceptionStatus;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final int CLIENT_COUNT = 24;
    private static final int DOCTOR_COUNT = 8;
    private static final int RECEPTIONIST_COUNT = 6;
    private static final int TECHNICIAN_COUNT = 10;
    private static final long FAKER_SEED = 20260411L;
    private static final String DEFAULT_AVATAR_PATH = "./storage/Untitled.jpg";

    private final EntityManager entityManager;

    @Value("${app.seed.mock.enabled:true}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        if (countOf(Client.class) > 0 || countOf(ReceptionRecord.class) > 0) {
            log.info("Mock data exists already. Skipping seeding.");
            return;
        }

        Faker faker = new Faker(new Random(FAKER_SEED));
        String encodedPassword = new BCryptPasswordEncoder(12).encode("123456");

        List<Client> clients = seedClients(faker);
        List<Doctor> doctors = seedDoctors(faker, encodedPassword);
        List<Receptionist> receptionists = seedReceptionists(faker, encodedPassword);
        List<Technician> technicians = seedTechnicians(faker, encodedPassword);
        List<ExamStatus> examStatuses = seedExamStatuses();
        List<TreatmentDirection> directions = seedTreatmentDirections();
        List<PaymentMethod> paymentMethods = seedPaymentMethods();
        List<ExamForm> examForms = seedExamForms();
        List<Pet> pets = seedPets(faker, clients);
        List<Medicine> medicines = seedMedicines();
        List<Service> services = seedServices();

        List<ReceptionRecord> receptionRecords = seedReceptionRecords(clients, pets, receptionists, doctors, examForms);
        List<ReceptionService> receptionServices = seedReceptionServices(receptionRecords, services);
        List<MedicalRecord> medicalRecords = seedMedicalRecords(receptionRecords, doctors, examStatuses);
        List<ExamResult> examResults = seedExamResults(medicalRecords, directions);
        List<Prescription> prescriptions = seedPrescriptions(examResults, receptionServices, services.getFirst().getId());
        seedPrescriptionDetails(prescriptions, medicines);

        List<ServiceOrder> serviceOrders = seedServiceOrders(medicalRecords, receptionServices, technicians, services.getFirst().getId());
        seedServiceResults(serviceOrders);
        seedInvoices(medicalRecords, receptionRecords, paymentMethods);

        log.info("Seeded deterministic mock data (seed={})", FAKER_SEED);
        log.info("Quick login refs: doctor 0901000000 / 123456, receptionist 0902000000 / 123456, technician 0903000000 / 123456");
    }

    private List<Client> seedClients(Faker faker) {
        List<Client> result = new ArrayList<>();
        for (int i = 0; i < CLIENT_COUNT; i++) {
            Client client = Client.builder()
                    .fullName(faker.name().fullName())
                    .phoneNumber(String.format("0914000%03d", i))
                    .build();
            entityManager.persist(client);
            result.add(client);
        }
        return result;
    }

    private List<Doctor> seedDoctors(Faker faker, String encodedPassword) {
        List<Doctor> result = new ArrayList<>();
        for (int i = 0; i < DOCTOR_COUNT; i++) {
            Doctor doctor = new Doctor();
            doctor.setFullName("BS. " + faker.name().fullName());
            doctor.setPhoneNumber(String.format("0901000%03d", i));
            doctor.setPassword(encodedPassword);
            doctor.setAvatarPath(DEFAULT_AVATAR_PATH);
            entityManager.persist(doctor);
            result.add(doctor);
        }
        return result;
    }

    private List<Receptionist> seedReceptionists(Faker faker, String encodedPassword) {
        List<Receptionist> result = new ArrayList<>();
        for (int i = 0; i < RECEPTIONIST_COUNT; i++) {
            Receptionist receptionist = new Receptionist();
            receptionist.setFullName(faker.name().fullName());
            receptionist.setPhoneNumber(String.format("0902000%03d", i));
            receptionist.setPassword(encodedPassword);
            receptionist.setAvatarPath(DEFAULT_AVATAR_PATH);
            entityManager.persist(receptionist);
            result.add(receptionist);
        }
        return result;
    }

    private List<Technician> seedTechnicians(Faker faker, String encodedPassword) {
        List<Technician> result = new ArrayList<>();
        for (int i = 0; i < TECHNICIAN_COUNT; i++) {
            Technician technician = new Technician();
            technician.setFullName(faker.name().fullName());
            technician.setPhoneNumber(String.format("0903000%03d", i));
            technician.setPassword(encodedPassword);
            technician.setAvatarPath(DEFAULT_AVATAR_PATH);
            entityManager.persist(technician);
            result.add(technician);
        }
        return result;
    }

    private List<ExamStatus> seedExamStatuses() {
        List<String> statusNames = List.of("PENDING", "IN_PROGRESS", "COMPLETED");
        List<ExamStatus> result = new ArrayList<>();
        for (String statusName : statusNames) {
            ExamStatus status = ExamStatus.builder().name(statusName).build();
            entityManager.persist(status);
            result.add(status);
        }
        return result;
    }

    private List<TreatmentDirection> seedTreatmentDirections() {
        List<String> names = List.of(
                "Cho về",
                "Điều trị nội trú",
                "Điều trị ngoại trú",
                "Khám cận lâm sàng"
        );

        List<TreatmentDirection> result = new ArrayList<>();
        for (String name : names) {
            TreatmentDirection direction = TreatmentDirection.builder().name(name).build();
            entityManager.persist(direction);
            result.add(direction);
        }
        return result;
    }

    private List<PaymentMethod> seedPaymentMethods() {
        List<String> names = List.of("Tiền mặt", "Chuyển khoản", "Thẻ");

        List<PaymentMethod> result = new ArrayList<>();
        for (String name : names) {
            PaymentMethod method = PaymentMethod.builder().name(name).build();
            entityManager.persist(method);
            result.add(method);
        }
        return result;
    }

    private List<ExamForm> seedExamForms() {
        List<ExamForm> result = new ArrayList<>();
        for (int i = 0; i < CLIENT_COUNT; i++) {
            ExamForm form = ExamForm.builder()
                    .examType(i % 3 == 0 ? ExamType.RE_EXAM : ExamType.NEW_EXAM)
                    .isEmergency(i % 7 == 0)
                    .build();
            entityManager.persist(form);
            result.add(form);
        }
        return result;
    }

    private List<Pet> seedPets(Faker faker, List<Client> clients) {
        String[] species = {"Dog", "Cat"};
        String[] breeds = {"Poodle", "Corgi", "Golden", "Pug", "Shiba", "Munchkin", "British Shorthair"};
        String[] nameSeeds = {"Milo", "Kuro", "Luna", "Nabi", "Mochi", "Bim", "Bun", "Coco"};

        List<Pet> result = new ArrayList<>();
        for (int i = 0; i < clients.size(); i++) {
            int ageYears = 1 + (i % 11);
            LocalDate dateOfBirth = LocalDate.now().minusYears(ageYears).minusMonths(i % 10);

            Pet pet = Pet.builder()
                    .client(clients.get(i))
                    .name(nameSeeds[i % nameSeeds.length] + " " + faker.number().digits(2))
                    .species(species[i % species.length])
                    .breed(breeds[i % breeds.length])
                    .dateOfBirth(dateOfBirth)
                    .build();
            entityManager.persist(pet);
            result.add(pet);
        }
        return result;
    }

    private List<Medicine> seedMedicines() {
        Object[][] rawMeds = {
            {"Amentyl (cao cấp)", "Hộp 4 vỉ * 10 viên (1 viên Amoxicillin 125mg)", 30000, "Viên", "THUOC"},
            {"Amox - Clav (thông dụng)", "Chai 20ml", 80000, "Lọ", "THUOC"},
            {"Clamoxcin (cao cấp)", "Hộp 6 lọ * 5ml", 170000, "Lọ", "THUOC"},
            {"Cefquino DC", "Hộp 5 cặp", 100000, "Lọ", "THUOC"},
            {"Thuốc nhỏ mắt Bio-Gentadrop", "Lọ 10ml", 15000, "Lọ", "THUOC"},
            {"Tiaflox 200mg (>2,5kg - 5kg)", "Hộp 4 vỉ * 10 viên", 50000, "Viên", "THUOC"},
            {"Enrofloxacin 10%", "Lọ 20ml", 70000, "Lọ", "THUOC"},
            {"Enroko 50mg", "Vỉ 10 viên", 8000, "Viên", "THUOC"},
            {"Fluroquin 5ml", "Hộp 6 lọ * 5ml", 140000, "Lọ", "THUOC"},
            {"Marbo 250mg (>5kg - 10kg) (cao cấp)", "Hộp 4 vỉ * 10 viên", 22000, "Viên", "THUOC"},
            {"Marbo 5 (cao cấp)", "Hộp 6 lọ * 5ml", 160000, "Lọ", "THUOC"},

            {"Áo mổ giấy", "", 35000, "Chiếc", "VAT_TU"},
            {"Băng chun 2.5cm", "", 15000, "Cuộn", "VAT_TU"},
            {"Băng chun 3 móc", "", 30000, "Cuộn", "VAT_TU"},
            {"Băng chun 5cm", "", 20000, "Cuộn", "VAT_TU"},
            {"Băng chun 7.5cm", "", 25000, "Cuộn", "VAT_TU"},
            {"Băng keo Urgo 5cm", "", 35000, "Cuộn", "VAT_TU"},
            {"Băng keo y tế 3M 2.5cm - Hộp 12 cuộn", "", 40000, "Cuộn", "VAT_TU"},
            {"Băng keo y tế 3M 5cm - Hộp 6 cuộn", "", 65000, "Cuộn", "VAT_TU"},
            {"Bộ dây chằng giả", "", 1100000, "Chiếc", "VAT_TU"},
            {"Bộ dây truyền dịch", "", 10000, "Chiếc", "VAT_TU"},
            {"Bộ kim cánh bướm G22", "", 5000, "Chiếc", "VAT_TU"},
            {"Bơm tiêm 1ml", "", 5000, "Chiếc", "VAT_TU"},
            {"Bơm tiêm 3ml", "", 5000, "Chiếc", "VAT_TU"},
            {"Bơm tiêm 5ml", "", 5000, "Chiếc", "VAT_TU"},
            {"Bơm tiêm 10ml", "", 15000, "Chiếc", "VAT_TU"}
        };

        List<Medicine> result = new ArrayList<>();
        for (int i = 0; i < rawMeds.length; i++) {
            Object[] data = rawMeds[i];
            BigDecimal unitPrice = BigDecimal.valueOf(((Number) data[2]).longValue());
            Medicine medicine = Medicine.builder()
                    .name((String) data[0])
                    .description((String) data[1])
                    .stockQuantity(100 + i * 5)
                    .unit((String) data[3])
                    .unitPrice(unitPrice)
                    .boxPrice(unitPrice)
                    .price(unitPrice)
                    .type((String) data[4])
                    .build();
            entityManager.persist(medicine);
            result.add(medicine);
        }

        return result;
    }

    private List<Service> seedServices() {
        List<String> names = List.of(
                "Khám lâm sàng",
                "Xét nghiệm máu",
                "Xét nghiệm nước tiểu",
                "Siêu âm ổ bụng",
                "X-Quang",
                "Truyền dịch",
                "Theo dõi nội trú",
                "Test nhanh ký sinh trùng"
        );

        List<BigDecimal> prices = List.of(
                BigDecimal.valueOf(120_000),
                BigDecimal.valueOf(180_000),
                BigDecimal.valueOf(160_000),
                BigDecimal.valueOf(220_000),
                BigDecimal.valueOf(250_000),
                BigDecimal.valueOf(150_000),
                BigDecimal.valueOf(300_000),
                BigDecimal.valueOf(140_000)
        );

        List<Service> result = new ArrayList<>();
        for (int i = 0; i < names.size(); i++) {
            Service service = Service.builder()
                    .name(names.get(i))
                    .unitPrice(prices.get(i))
                    .build();
            entityManager.persist(service);
            result.add(service);
        }

        return result;
    }

    private List<ReceptionRecord> seedReceptionRecords(
            List<Client> clients,
            List<Pet> pets,
            List<Receptionist> receptionists,
            List<Doctor> doctors,
            List<ExamForm> examForms
    ) {
        ReceptionStatus[] statusCycle = {
                ReceptionStatus.WAITING_EXECUTION,
                ReceptionStatus.IN_PROGRESS,
                ReceptionStatus.WAITING_CONCLUSION,
                ReceptionStatus.WAITING_PAYMENT,
                ReceptionStatus.PAID,
                ReceptionStatus.IN_PROGRESS,
                ReceptionStatus.WAITING_PAYMENT
        };

        String[] reasons = {
                "Bỏ ăn, nôn nhẹ 2 ngày",
                "Tiêu chảy kéo dài",
                "Ho, khó thở nhẹ",
                "Tái khám theo chỉ định",
                "Mệt, ít vận động",
                "Kiểm tra sức khỏe định kỳ"
        };

        LocalDateTime base = LocalDateTime.now().minusDays(CLIENT_COUNT + 5).withHour(8).withMinute(0).withSecond(0).withNano(0);

        List<ReceptionRecord> result = new ArrayList<>();
        for (int i = 0; i < clients.size(); i++) {
            ReceptionStatus status = statusCycle[i % statusCycle.length];
            LocalDateTime receptionTime = base.plusDays(i).plusMinutes((i * 13L) % 50L);
            BigDecimal weightKg = BigDecimal.valueOf(2.2 + (i % 9) * 0.85).setScale(2, RoundingMode.HALF_UP);

            ReceptionRecord receptionRecord = ReceptionRecord.builder()
                    .client(clients.get(i))
                    .pet(pets.get(i))
                    .receptionist(receptionists.get(i % receptionists.size()))
                    .doctor(doctors.get(i % doctors.size()))
                    .examForm(examForms.get(i % examForms.size()))
                    .examReason(reasons[i % reasons.length])
                    .note(status == ReceptionStatus.WAITING_PAYMENT ? "Đã hoàn tất khám, chờ thu ngân xác nhận." : null)
                    .weight(weightKg)
                    .status(status)
                    .receptionTime(receptionTime)
                    .build();
            entityManager.persist(receptionRecord);
            result.add(receptionRecord);
        }

        return result;
    }

    private List<ReceptionService> seedReceptionServices(List<ReceptionRecord> receptions, List<Service> services) {
        Service clinical = services.getFirst();
        List<ReceptionService> result = new ArrayList<>();

        for (int i = 0; i < receptions.size(); i++) {
            ReceptionRecord reception = receptions.get(i);
            ReceptionStatus receptionStatus = reception.getStatus();
            Set<Long> usedServiceIds = new HashSet<>();

            ReceptionService clinicalService = ReceptionService.builder()
                    .receptionRecord(reception)
                    .service(clinical)
                    .status(mapClinicalStatus(receptionStatus))
                    .startedAt(receptionStatus == ReceptionStatus.WAITING_EXECUTION ? null : reception.getReceptionTime().plusMinutes(25))
                    .createdAt(reception.getReceptionTime().plusMinutes(10))
                    .build();
            entityManager.persist(clinicalService);
            result.add(clinicalService);
            usedServiceIds.add(clinical.getId());

            if (receptionStatus != ReceptionStatus.WAITING_EXECUTION && services.size() > 1) {
                Service firstParaclinical = pickUnusedParaclinicalService(services, usedServiceIds, i);
                if (firstParaclinical != null) {
                    ReceptionService firstService = ReceptionService.builder()
                            .receptionRecord(reception)
                            .service(firstParaclinical)
                            .status(mapParaclinicalStatus(receptionStatus))
                            .startedAt(receptionStatus == ReceptionStatus.IN_PROGRESS ? reception.getReceptionTime().plusHours(1) : reception.getReceptionTime().plusMinutes(50))
                            .createdAt(reception.getReceptionTime().plusMinutes(40))
                            .build();
                    entityManager.persist(firstService);
                    result.add(firstService);
                    usedServiceIds.add(firstParaclinical.getId());
                }
            }

            if ((receptionStatus == ReceptionStatus.WAITING_PAYMENT || receptionStatus == ReceptionStatus.PAID) && services.size() > 2) {
                Service secondParaclinical = pickUnusedParaclinicalService(services, usedServiceIds, i + 3);
                if (secondParaclinical != null) {
                    ReceptionService secondService = ReceptionService.builder()
                            .receptionRecord(reception)
                            .service(secondParaclinical)
                            .status(ReceptionServiceStatus.COMPLETED)
                            .startedAt(reception.getReceptionTime().plusHours(2))
                            .createdAt(reception.getReceptionTime().plusHours(1).plusMinutes(15))
                            .build();
                    entityManager.persist(secondService);
                    result.add(secondService);
                }
            }
        }

        return result;
    }

    private Service pickUnusedParaclinicalService(List<Service> services, Set<Long> usedServiceIds, int offset) {
        if (services.size() <= 1) {
            return null;
        }

        int poolSize = services.size() - 1;
        for (int step = 0; step < poolSize; step++) {
            Service candidate = services.get(1 + ((offset + step) % poolSize));
            if (!usedServiceIds.contains(candidate.getId())) {
                return candidate;
            }
        }

        return null;
    }

    private List<MedicalRecord> seedMedicalRecords(
            List<ReceptionRecord> receptions,
            List<Doctor> doctors,
            List<ExamStatus> examStatuses
    ) {
        Map<String, ExamStatus> examStatusByName = new HashMap<>();
        for (ExamStatus examStatus : examStatuses) {
            examStatusByName.put(examStatus.getName(), examStatus);
        }

        List<MedicalRecord> result = new ArrayList<>();
        for (int i = 0; i < receptions.size(); i++) {
            ReceptionRecord reception = receptions.get(i);
            ExamStatus status = resolveExamStatus(examStatusByName, reception.getStatus());

            MedicalRecord medicalRecord = MedicalRecord.builder()
                    .receptionRecord(reception)
                    .doctor(doctors.get(i % doctors.size()))
                    .status(status)
                    .examDate(reception.getReceptionTime().plusMinutes(35))
                    .build();
            entityManager.persist(medicalRecord);
            result.add(medicalRecord);
        }

        return result;
    }

    private ExamStatus resolveExamStatus(Map<String, ExamStatus> examStatusByName, ReceptionStatus receptionStatus) {
        if (receptionStatus == ReceptionStatus.WAITING_EXECUTION) {
            return examStatusByName.get("PENDING");
        }
        if (receptionStatus == ReceptionStatus.IN_PROGRESS) {
            return examStatusByName.get("IN_PROGRESS");
        }
        return examStatusByName.get("COMPLETED");
    }

    private List<ExamResult> seedExamResults(List<MedicalRecord> medicalRecords, List<TreatmentDirection> directions) {
        List<ExamResult> result = new ArrayList<>();
        for (int i = 0; i < medicalRecords.size(); i++) {
            MedicalRecord medicalRecord = medicalRecords.get(i);
            ReceptionStatus receptionStatus = medicalRecord.getReceptionRecord().getStatus();
            LocalDateTime startTime = medicalRecord.getExamDate();
            LocalDateTime endTime = receptionStatus == ReceptionStatus.WAITING_EXECUTION
                    ? null
                    : startTime.plusMinutes(30);

            TreatmentDirection direction = switch (receptionStatus) {
                case WAITING_EXECUTION -> directions.get(3); // Khám cận lâm sàng
                case IN_PROGRESS, WAITING_CONCLUSION -> directions.get(2); // Điều trị ngoại trú
                case WAITING_PAYMENT, PAID -> directions.get(0); // Cho về
            };

            String conclusion = receptionStatus == ReceptionStatus.WAITING_EXECUTION
                    ? null
                    : "Theo dõi đáp ứng tốt, đề nghị tiếp tục phác đồ hiện tại.";

            ExamResult examResult = ExamResult.builder()
                    .medicalRecord(medicalRecord)
                    .treatmentDirection(direction)
                    .conclusion(conclusion)
                    .evidencePath(endTime == null ? null : "./storage/exam-results/exam-result-seed-" + (i + 1) + ".jpg")
                    .startTime(startTime)
                    .endTime(endTime)
                    .build();
            entityManager.persist(examResult);
            result.add(examResult);
        }

        return result;
    }

    private List<Prescription> seedPrescriptions(List<ExamResult> examResults, List<ReceptionService> receptionServices, long clinicalServiceId) {
        Map<Long, ReceptionService> clinicalServiceByReceptionId = new HashMap<>();
        for (ReceptionService receptionService : receptionServices) {
            if (receptionService.getService() != null && receptionService.getService().getId() == clinicalServiceId) {
                clinicalServiceByReceptionId.put(receptionService.getReceptionRecord().getId(), receptionService);
            }
        }

        List<Prescription> result = new ArrayList<>();
        for (ExamResult examResult : examResults) {
            long receptionId = examResult.getMedicalRecord().getReceptionRecord().getId();
            ReceptionService ownerService = clinicalServiceByReceptionId.get(receptionId);
            Prescription prescription = Prescription.builder()
                    .examResult(examResult)
                    .receptionService(ownerService)
                    .build();
            entityManager.persist(prescription);
            result.add(prescription);
        }

        return result;
    }

    private void seedPrescriptionDetails(List<Prescription> prescriptions, List<Medicine> medicines) {
        for (int i = 0; i < prescriptions.size(); i++) {
            Prescription prescription = prescriptions.get(i);
            Medicine primaryMedicine = medicines.get((i * 2) % medicines.size());

            PrescriptionDetail mainDetail = PrescriptionDetail.builder()
                    .prescription(prescription)
                    .medicine(primaryMedicine)
                    .quantity(1 + (i % 3))
                    .morning(1)
                    .noon(i % 2)
                    .afternoon(1)
                    .evening(i % 2)
                    .instruction(i % 4 == 0 ? "Uống sau ăn" : "Theo dõi phản ứng trong 24h")
                    .dosageUnit(primaryMedicine.getUnit())
                    .build();
            entityManager.persist(mainDetail);

            if (i % 3 == 0) {
                Medicine secondaryMedicine = medicines.get((i * 2 + 1) % medicines.size());
                PrescriptionDetail extraDetail = PrescriptionDetail.builder()
                        .prescription(prescription)
                        .medicine(secondaryMedicine)
                        .quantity(1)
                        .morning(1)
                        .noon(0)
                        .afternoon(0)
                        .evening(1)
                        .instruction("Dùng khi có triệu chứng")
                        .dosageUnit(secondaryMedicine.getUnit())
                        .build();
                entityManager.persist(extraDetail);
            }
        }
    }

    private List<ServiceOrder> seedServiceOrders(
            List<MedicalRecord> medicalRecords,
            List<ReceptionService> receptionServices,
            List<Technician> technicians,
            long clinicalServiceId
    ) {
        Map<Long, MedicalRecord> medicalRecordByReceptionId = new HashMap<>();
        for (MedicalRecord medicalRecord : medicalRecords) {
            medicalRecordByReceptionId.put(medicalRecord.getReceptionRecord().getId(), medicalRecord);
        }

        List<ServiceOrder> result = new ArrayList<>();
        int technicianCursor = 0;

        for (ReceptionService receptionService : receptionServices) {
            if (receptionService.getService() == null || receptionService.getService().getId() == clinicalServiceId) {
                continue;
            }

            MedicalRecord medicalRecord = medicalRecordByReceptionId.get(receptionService.getReceptionRecord().getId());
            if (medicalRecord == null) {
                continue;
            }

            ServiceOrder serviceOrder = ServiceOrder.builder()
                    .medicalRecord(medicalRecord)
                    .service(receptionService.getService())
                    .technician(technicians.get(technicianCursor % technicians.size()))
                    .build();
            entityManager.persist(serviceOrder);
            result.add(serviceOrder);

            technicianCursor++;
        }

        return result;
    }

    private void seedServiceResults(List<ServiceOrder> serviceOrders) {
        for (int i = 0; i < serviceOrders.size(); i++) {
            ServiceOrder serviceOrder = serviceOrders.get(i);
            ReceptionStatus receptionStatus = serviceOrder.getMedicalRecord().getReceptionRecord().getStatus();
            LocalDateTime start = serviceOrder.getMedicalRecord().getExamDate().plusMinutes(20);

            LocalDateTime end = switch (receptionStatus) {
                case WAITING_PAYMENT, PAID, WAITING_CONCLUSION -> start.plusMinutes(35);
                case IN_PROGRESS -> null;
                case WAITING_EXECUTION -> null;
            };

            ServiceResult serviceResult = ServiceResult.builder()
                    .serviceOrder(serviceOrder)
                    .result(end == null ? null : "Kết quả ổn định, không ghi nhận bất thường lớn.")
                    .evidencePath(end == null ? null : "./storage/tech-results/tech-result-seed-" + (i + 1) + ".jpg")
                    .startTime(receptionStatus == ReceptionStatus.WAITING_EXECUTION ? null : start)
                    .endTime(end)
                    .build();
            entityManager.persist(serviceResult);
        }
    }

    private void seedInvoices(
            List<MedicalRecord> medicalRecords,
            List<ReceptionRecord> receptions,
            List<PaymentMethod> paymentMethods
    ) {
        for (int i = 0; i < receptions.size(); i++) {
            ReceptionRecord reception = receptions.get(i);
            ReceptionStatus status = reception.getStatus();

            if (status != ReceptionStatus.WAITING_PAYMENT && status != ReceptionStatus.PAID) {
                continue;
            }

            LocalDateTime createdAt = reception.getReceptionTime().plusHours(3);
            boolean paid = status == ReceptionStatus.PAID;

            Invoice invoice = Invoice.builder()
                    .medicalRecord(medicalRecords.get(i))
                    .paymentMethod(paymentMethods.get(i % paymentMethods.size()))
                    .receptionist(reception.getReceptionist())
                    .totalAmount(BigDecimal.valueOf(350_000 + i * 25_000L))
                    .status(paid ? "PAID" : "PENDING")
                    .note(paid ? "Đã thanh toán đủ." : "Chờ khách xác nhận thanh toán.")
                    .createdAt(createdAt)
                    .paymentDate(paid ? createdAt.plusMinutes(20) : null)
                    .build();
            entityManager.persist(invoice);
        }
    }

    private ReceptionServiceStatus mapClinicalStatus(ReceptionStatus receptionStatus) {
        if (receptionStatus == ReceptionStatus.WAITING_EXECUTION) {
            return ReceptionServiceStatus.PENDING;
        }
        if (receptionStatus == ReceptionStatus.IN_PROGRESS || receptionStatus == ReceptionStatus.WAITING_CONCLUSION) {
            return ReceptionServiceStatus.IN_PROGRESS;
        }
        return ReceptionServiceStatus.COMPLETED;
    }

    private ReceptionServiceStatus mapParaclinicalStatus(ReceptionStatus receptionStatus) {
        if (receptionStatus == ReceptionStatus.IN_PROGRESS) {
            return ReceptionServiceStatus.IN_PROGRESS;
        }
        if (receptionStatus == ReceptionStatus.WAITING_EXECUTION) {
            return ReceptionServiceStatus.PENDING;
        }
        return ReceptionServiceStatus.COMPLETED;
    }

    private long countOf(Class<?> entityClass) {
        return entityManager
                .createQuery("select count(e) from " + entityClass.getSimpleName() + " e", Long.class)
                .getSingleResult();
    }
}
