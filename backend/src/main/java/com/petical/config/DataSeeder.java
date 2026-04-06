package com.petical.config;

import com.github.javafaker.Faker;
import com.petical.entity.*;
import com.petical.enums.ExamType;
import com.petical.enums.ReceptionStatus;
import com.petical.enums.ReceptionServiceStatus;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final int SEED_SIZE = 20;
    private static final long FAKER_SEED = 20260401L;
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

        if (countOf(Client.class) > 0 || countOf(Doctor.class) > 0) {
            log.info("Mock data exists already. Skipping seeding.");
            return;
        }

        Faker faker = new Faker(new Random(FAKER_SEED));
        String defaultPassword = new BCryptPasswordEncoder(12).encode("123456");

        List<Client> clients = seedClients(faker);
        List<Doctor> doctors = seedDoctors(faker, defaultPassword);
        List<Receptionist> receptionists = seedReceptionists(faker, defaultPassword);
        List<Technician> technicians = seedTechnicians(faker, defaultPassword);
        List<ExamStatus> statuses = seedExamStatuses();
        List<TreatmentDirection> directions = seedTreatmentDirections();
        List<PaymentMethod> paymentMethods = seedPaymentMethods();
        List<ExamForm> examForms = seedExamForms();
        List<Pet> pets = seedPets(faker, clients);
        List<Medicine> medicines = seedMedicines(faker);
        List<Service> services = seedServices(faker);
        List<ReceptionRecord> receptionRecords = seedReceptionRecords(clients, pets, receptionists, doctors, examForms);
        seedReceptionServices(receptionRecords, services);
        List<MedicalRecord> medicalRecords = seedMedicalRecords(receptionRecords, doctors, statuses);
        List<ExamResult> examResults = seedExamResults(medicalRecords, directions);
        List<Prescription> prescriptions = seedPrescriptions(examResults);
        List<ServiceOrder> serviceOrders = seedServiceOrders(medicalRecords, services, technicians);
        seedPrescriptionDetails(prescriptions, medicines);
        seedServiceResults(serviceOrders);
        seedInvoices(medicalRecords, receptionRecords, paymentMethods);

        log.info("Seeded deterministic mock data with {} records per table (seed={}).", SEED_SIZE, FAKER_SEED);
        log.info("Seed quick refs: DOCTOR login phone=0901000000 password=123456, CLIENT phone=0914000000, TECHNICIAN phone=0903000000");
    }

    private List<Client> seedClients(Faker faker) {
        List<Client> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Client client = Client.builder()
                    .fullName(faker.name().fullName())
                    .phoneNumber(String.format("0914000%03d", index))
                    .build();
            entityManager.persist(client);
            result.add(client);
        }
        return result;
    }

    private List<Doctor> seedDoctors(Faker faker, String encodedPassword) {
        List<Doctor> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Doctor doctor = new Doctor();
            doctor.setFullName("Dr. " + faker.name().fullName());
            doctor.setPhoneNumber(String.format("0901000%03d", index));
            doctor.setPassword(encodedPassword);
            doctor.setAvatarPath(DEFAULT_AVATAR_PATH);
            entityManager.persist(doctor);
            result.add(doctor);
        }
        return result;
    }

    private List<Receptionist> seedReceptionists(Faker faker, String encodedPassword) {
        List<Receptionist> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Receptionist receptionist = new Receptionist();
            receptionist.setFullName(faker.name().fullName());
            receptionist.setPhoneNumber(String.format("0902000%03d", index));
            receptionist.setPassword(encodedPassword);
            receptionist.setAvatarPath(DEFAULT_AVATAR_PATH);
            entityManager.persist(receptionist);
            result.add(receptionist);
        }
        return result;
    }

    private List<Technician> seedTechnicians(Faker faker, String encodedPassword) {
        List<Technician> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Technician technician = new Technician();
            technician.setFullName(faker.name().fullName());
            technician.setPhoneNumber(String.format("0903000%03d", index));
            technician.setPassword(encodedPassword);
            technician.setAvatarPath(DEFAULT_AVATAR_PATH);
            entityManager.persist(technician);
            result.add(technician);
        }
        return result;
    }

    private List<ExamStatus> seedExamStatuses() {
        String[] baseStatuses = {"IN_PROGRESS", "COMPLETED", "PENDING"};
        List<ExamStatus> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            String statusName = index < baseStatuses.length
                    ? baseStatuses[index]
                    : "STATUS_" + (index + 1);
            ExamStatus status = ExamStatus.builder()
                    .name(statusName)
                    .build();
            entityManager.persist(status);
            result.add(status);
        }
        return result;
    }

    private List<TreatmentDirection> seedTreatmentDirections() {
        String[] defaultDirections = {
                "Cho về",
                "Điều trị nội trú",
                "Điều trị ngoại trú",
                "Khám cận lâm sàng"
        };
        List<TreatmentDirection> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            String directionName = index < defaultDirections.length
                    ? defaultDirections[index]
                    : "Direction " + (index + 1);
            TreatmentDirection direction = TreatmentDirection.builder()
                    .name(directionName)
                    .build();
            entityManager.persist(direction);
            result.add(direction);
        }
        return result;
    }

    private List<PaymentMethod> seedPaymentMethods() {
        String[] defaultMethods = {"Tiền mặt", "Chuyển khoản", "Thẻ"};
        List<PaymentMethod> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            String paymentMethodName = index < defaultMethods.length
                    ? defaultMethods[index]
                    : "Payment Method " + (index + 1);
            PaymentMethod paymentMethod = PaymentMethod.builder()
                    .name(paymentMethodName)
                    .build();
            entityManager.persist(paymentMethod);
            result.add(paymentMethod);
        }
        return result;
    }

    private List<ExamForm> seedExamForms() {
        ExamType[] examTypes = {
            ExamType.NEW_EXAM,
            ExamType.RE_EXAM
        };
        List<ExamForm> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            ExamForm examForm = ExamForm.builder()
                    .examType(examTypes[index % examTypes.length])
                    .isEmergency(index % 5 == 0)
                    .build();
            entityManager.persist(examForm);
            result.add(examForm);
        }
        return result;
    }

    private List<Pet> seedPets(Faker faker, List<Client> clients) {
        String[] genders = {"Male", "Female"};
        String[] species = {"Dog", "Cat"};
        String[] breeds = {"Poodle", "Corgi", "Golden", "Pug", "Shiba"};
        List<Pet> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Pet pet = Pet.builder()
                    .client(clients.get(index))
                    .name("Pet " + faker.name().firstName())
                    .species(species[index % species.length])
                    .breed(breeds[index % breeds.length])
                    .build();
            entityManager.persist(pet);
            result.add(pet);
        }
        return result;
    }

    private List<Medicine> seedMedicines(Faker faker) {
        String[] units = {"tablet", "ml", "bottle", "tube"};
        String[] types = {"Antibiotic", "Vitamin", "Pain Relief", "Anti-inflammatory"};
        List<Medicine> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Medicine medicine = Medicine.builder()
                    .name("Medicine " + faker.lorem().word() + " " + (index + 1))
                    .stockQuantity(50 + index)
                    .unit(units[index % units.length])
                    .price(BigDecimal.valueOf(12000 + (long) index * 2000))
                    .unitPrice(BigDecimal.valueOf(4000 + (long) index * 600))
                    .boxPrice(BigDecimal.valueOf(12000 + (long) index * 2000))
                    .type(types[index % types.length])
                    .build();
            entityManager.persist(medicine);
            result.add(medicine);
        }
        return result;
    }

    private List<Service> seedServices(Faker faker) {
        String[] defaultServices = {
            "Khám lâm sàng",
            "Xét nghiệm máu",
            "Siêu âm",
            "X-quang",
            "Truyền dịch",
            "Theo dõi nội trú"
        };
        List<Service> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            String serviceName = index < defaultServices.length
                ? defaultServices[index]
                : "Service " + faker.company().industry();
            Service service = Service.builder()
                .name(serviceName)
                    .unitPrice(BigDecimal.valueOf(50000 + (long) index * 15000))
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
        List<ReceptionRecord> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            ReceptionStatus status = switch (index % 5) {
            case 0 -> ReceptionStatus.WAITING_EXECUTION;
            case 1 -> ReceptionStatus.IN_PROGRESS;
            case 2 -> ReceptionStatus.WAITING_CONCLUSION;
            case 3 -> ReceptionStatus.WAITING_PAYMENT;
            default -> ReceptionStatus.PAID;
            };

            LocalDateTime receptionTime = LocalDateTime.now()
                .minusDays(SEED_SIZE - index)
                .withHour(8 + (index % 9))
                .withMinute((index * 7) % 60)
                .withSecond(0)
                .withNano(0);

            ReceptionRecord receptionRecord = ReceptionRecord.builder()
                    .client(clients.get(index))
                    .pet(pets.get(index))
                    .receptionist(receptionists.get(index))
                .doctor(doctors.get(index % doctors.size()))
                    .examForm(examForms.get(index))
                .examReason(index % 2 == 0 ? "Khám tổng quát" : "Tái khám định kỳ")
                .symptomDescription(index % 3 == 0
                    ? "Thú cưng có biểu hiện mệt và bỏ ăn"
                    : "Kiểm tra sức khỏe định kỳ theo lịch")
                .note(status == ReceptionStatus.WAITING_PAYMENT
                    ? "Đã kết thúc khám, chờ thu ngân xác nhận"
                    : null)
                .weight(BigDecimal.valueOf(250 + (index % 10) * 45L, 2))
                .status(status)
                .receptionTime(receptionTime)
                    .build();
            entityManager.persist(receptionRecord);
            result.add(receptionRecord);
        }
        return result;
    }

        private void seedReceptionServices(List<ReceptionRecord> receptionRecords, List<Service> services) {
        if (services.isEmpty()) {
            return;
        }

        Service clinicalService = services.getFirst();
        int paraclinicalPoolSize = Math.max(services.size() - 1, 0);

        for (int index = 0; index < SEED_SIZE; index++) {
            ReceptionRecord receptionRecord = receptionRecords.get(index);
            ReceptionStatus receptionStatus = receptionRecord.getStatus();

            ReceptionService clinical = ReceptionService.builder()
                .receptionRecord(receptionRecord)
                .service(clinicalService)
                .status(mapClinicalServiceStatus(receptionStatus))
                .createdAt(receptionRecord.getReceptionTime() == null
                    ? LocalDateTime.now()
                    : receptionRecord.getReceptionTime().plusMinutes(20))
                .build();
            entityManager.persist(clinical);

            if (paraclinicalPoolSize > 0 && index % 2 == 0) {
            Service paraclinicalService = services.get(1 + (index % paraclinicalPoolSize));
            ReceptionService paraclinical = ReceptionService.builder()
                .receptionRecord(receptionRecord)
                .service(paraclinicalService)
                .status(mapParaclinicalServiceStatus(receptionStatus))
                .createdAt(receptionRecord.getReceptionTime() == null
                    ? LocalDateTime.now()
                    : receptionRecord.getReceptionTime().plusHours(1))
                .build();
            entityManager.persist(paraclinical);
            }
        }
        }

    private List<MedicalRecord> seedMedicalRecords(
            List<ReceptionRecord> receptionRecords,
            List<Doctor> doctors,
            List<ExamStatus> statuses
    ) {
        List<MedicalRecord> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            MedicalRecord medicalRecord = MedicalRecord.builder()
                    .receptionRecord(receptionRecords.get(index))
                    .doctor(doctors.get(index))
                    .status(statuses.get(index))
                    .examDate(LocalDateTime.now().minusDays(SEED_SIZE - index).plusHours(2))
                    .build();
            entityManager.persist(medicalRecord);
            result.add(medicalRecord);
        }
        return result;
    }

    private List<ExamResult> seedExamResults(List<MedicalRecord> medicalRecords, List<TreatmentDirection> directions) {
        List<ExamResult> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            LocalDateTime start = LocalDateTime.now().minusDays(SEED_SIZE - index).plusHours(3);
            ExamResult examResult = ExamResult.builder()
                    .medicalRecord(medicalRecords.get(index))
                    .treatmentDirection(directions.get(index))
                    .conclusion("Conclusion for medical record " + (index + 1))
                    .startTime(start)
                    .endTime(start.plusMinutes(30))
                    .build();
            entityManager.persist(examResult);
            result.add(examResult);
        }
        return result;
    }

    private List<Prescription> seedPrescriptions(List<ExamResult> examResults) {
        List<Prescription> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            ExamResult examResult = examResults.get(index);
            long receptionRecordId = examResult.getMedicalRecord().getReceptionRecord().getId();
            ReceptionService ownerService = entityManager.createQuery(
                            """
                            select rs
                            from ReceptionService rs
                            where rs.receptionRecord.id = :receptionRecordId
                            order by rs.id asc
                            """,
                            ReceptionService.class
                    )
                    .setParameter("receptionRecordId", receptionRecordId)
                    .setMaxResults(1)
                    .getResultList()
                    .stream()
                    .findFirst()
                    .orElse(null);

            Prescription prescription = Prescription.builder()
                    .examResult(examResult)
                    .receptionService(ownerService)
                    .build();
            entityManager.persist(prescription);
            result.add(prescription);
        }
        return result;
    }

    private List<ServiceOrder> seedServiceOrders(
            List<MedicalRecord> medicalRecords,
            List<Service> services,
            List<Technician> technicians
    ) {
        List<ServiceOrder> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            ServiceOrder serviceOrder = ServiceOrder.builder()
                    .medicalRecord(medicalRecords.get(index))
                    .service(services.get(index))
                    .technician(technicians.get(index))
                    .build();
            entityManager.persist(serviceOrder);
            result.add(serviceOrder);
        }
        return result;
    }

        private void seedPrescriptionDetails(
            List<Prescription> prescriptions,
            List<Medicine> medicines
        ) {
        for (int index = 0; index < SEED_SIZE; index++) {
            PrescriptionDetail prescriptionDetail = PrescriptionDetail.builder()
                    .prescription(prescriptions.get(index))
                    .medicine(medicines.get(index))
                    .quantity(1 + (index % 4))
                    .morning(1)
                    .noon(1)
                    .afternoon(1)
                    .evening(1)
                    .instruction(index % 5 == 0 ? "Uống sau ăn" : "")
                    .dosageUnit(medicines.get(index).getUnit())
                    .build();
            entityManager.persist(prescriptionDetail);
        }
    }

    private void seedServiceResults(List<ServiceOrder> serviceOrders) {
        for (int index = 0; index < SEED_SIZE; index++) {
            LocalDateTime start = LocalDateTime.now().minusDays(SEED_SIZE - index).plusHours(4);
            ServiceResult serviceResult = ServiceResult.builder()
                    .serviceOrder(serviceOrders.get(index))
                    .result("Service result " + (index + 1))
                    .evidencePath("./storage/service-result-" + (index + 1) + ".jpg")
                    .startTime(start)
                    .endTime(start.plusMinutes(45))
                    .build();
            entityManager.persist(serviceResult);
        }
    }

    private void seedInvoices(
            List<MedicalRecord> medicalRecords,
            List<ReceptionRecord> receptionRecords,
            List<PaymentMethod> paymentMethods
    ) {
        for (int index = 0; index < SEED_SIZE; index++) {
            ReceptionStatus receptionStatus = receptionRecords.get(index).getStatus();
            if (receptionStatus != ReceptionStatus.WAITING_PAYMENT && receptionStatus != ReceptionStatus.PAID) {
                continue;
            }

            LocalDateTime createdAt = LocalDateTime.now().minusDays(SEED_SIZE - index).plusHours(5);
            boolean paid = receptionStatus == ReceptionStatus.PAID;
            Invoice invoice = Invoice.builder()
                    .medicalRecord(medicalRecords.get(index))
                    .paymentMethod(paymentMethods.get(index % paymentMethods.size()))
                    .receptionist(receptionRecords.get(index).getReceptionist())
                    .totalAmount(BigDecimal.valueOf(300000 + (long) index * 25000))
                    .status(paid ? "PAID" : "PENDING")
                    .note(paid ? "Đã thanh toán đầy đủ" : "Chờ thanh toán")
                    .createdAt(createdAt)
                    .paymentDate(paid ? createdAt.plusMinutes(25) : null)
                    .build();
            entityManager.persist(invoice);
        }
    }

    private ReceptionServiceStatus mapClinicalServiceStatus(ReceptionStatus receptionStatus) {
        if (receptionStatus == ReceptionStatus.PAID) {
            return ReceptionServiceStatus.COMPLETED;
        }
        if (receptionStatus == ReceptionStatus.WAITING_EXECUTION) {
            return ReceptionServiceStatus.PENDING;
        }
        return ReceptionServiceStatus.IN_PROGRESS;
    }

    private ReceptionServiceStatus mapParaclinicalServiceStatus(ReceptionStatus receptionStatus) {
        if (receptionStatus == ReceptionStatus.PAID || receptionStatus == ReceptionStatus.WAITING_PAYMENT) {
            return ReceptionServiceStatus.COMPLETED;
        }
        if (receptionStatus == ReceptionStatus.WAITING_EXECUTION) {
            return ReceptionServiceStatus.PENDING;
        }
        return ReceptionServiceStatus.IN_PROGRESS;
    }

    private long countOf(Class<?> entityClass) {
        return entityManager.createQuery("select count(e) from " + entityClass.getSimpleName() + " e", Long.class)
                .getSingleResult();
    }
}