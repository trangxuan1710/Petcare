package com.petical.config;

import com.github.javafaker.Faker;
import com.petical.entity.*;
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
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final int SEED_SIZE = 20;
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

        Faker faker = new Faker();
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
        List<DosageReference> dosageReferences = seedDosageReferences();
        List<Service> services = seedServices(faker);
        List<ReceptionRecord> receptionRecords = seedReceptionRecords(clients, pets, receptionists, examForms);
        List<MedicalRecord> medicalRecords = seedMedicalRecords(receptionRecords, doctors, statuses);
        List<ExamResult> examResults = seedExamResults(medicalRecords, directions);
        List<Prescription> prescriptions = seedPrescriptions(examResults);
        List<ServiceOrder> serviceOrders = seedServiceOrders(medicalRecords, services, technicians);
        seedPrescriptionDetails(prescriptions, medicines, dosageReferences);
        seedServiceResults(serviceOrders);
        seedInvoices(medicalRecords, paymentMethods);

        log.info("Seeded mock data with {} records per table (users use joined inheritance).", SEED_SIZE);
    }

    private List<Client> seedClients(Faker faker) {
        List<Client> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Client client = Client.builder()
                    .fullName(faker.name().fullName())
                    .phoneNumber(String.format("0914000%03d", index))
                    .address(faker.address().fullAddress())
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
        List<ExamStatus> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            ExamStatus status = ExamStatus.builder()
                    .name("STATUS_" + (index + 1))
                    .build();
            entityManager.persist(status);
            result.add(status);
        }
        return result;
    }

    private List<TreatmentDirection> seedTreatmentDirections() {
        List<TreatmentDirection> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            TreatmentDirection direction = TreatmentDirection.builder()
                    .name("Direction " + (index + 1))
                    .build();
            entityManager.persist(direction);
            result.add(direction);
        }
        return result;
    }

    private List<PaymentMethod> seedPaymentMethods() {
        List<PaymentMethod> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            PaymentMethod paymentMethod = PaymentMethod.builder()
                    .name("Payment Method " + (index + 1))
                    .build();
            entityManager.persist(paymentMethod);
            result.add(paymentMethod);
        }
        return result;
    }

    private List<ExamForm> seedExamForms() {
        String[] examTypes = {"General", "Vaccine", "Surgery", "Dermatology", "Dentistry"};
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
                    .gender(genders[index % genders.length])
                    .dateOfBirth(LocalDate.now().minusMonths(6L + index * 2L))
                    .weight(BigDecimal.valueOf(2.5 + index * 0.4).setScale(2, RoundingMode.HALF_UP))
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
                    .type(types[index % types.length])
                    .build();
            entityManager.persist(medicine);
            result.add(medicine);
        }
        return result;
    }

    private List<DosageReference> seedDosageReferences() {
        String[] timings = {"Morning", "Noon", "Evening", "Before Sleep"};
        String[] units = {"tablet", "ml", "drop"};
        List<DosageReference> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            DosageReference dosageReference = DosageReference.builder()
                    .timing(timings[index % timings.length])
                    .quantity(1 + (index % 3))
                    .unit(units[index % units.length])
                    .build();
            entityManager.persist(dosageReference);
            result.add(dosageReference);
        }
        return result;
    }

    private List<Service> seedServices(Faker faker) {
        List<Service> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            Service service = Service.builder()
                    .name("Service " + faker.company().industry())
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
            List<ExamForm> examForms
    ) {
        List<ReceptionRecord> result = new ArrayList<>();
        for (int index = 0; index < SEED_SIZE; index++) {
            ReceptionRecord receptionRecord = ReceptionRecord.builder()
                    .client(clients.get(index))
                    .pet(pets.get(index))
                    .receptionist(receptionists.get(index))
                    .examForm(examForms.get(index))
                    .examReason("Khám tổng quát")
                    .symptomDescription("Thú cưng có biểu hiện mệt, cần kiểm tra tổng quát")
                    .status("Đã tiếp đón")
                    .receptionTime(LocalDateTime.now().minusDays(SEED_SIZE - index))
                    .build();
            entityManager.persist(receptionRecord);
            result.add(receptionRecord);
        }
        return result;
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
            Prescription prescription = Prescription.builder()
                    .examResult(examResults.get(index))
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
            List<Medicine> medicines,
            List<DosageReference> dosageReferences
    ) {
        for (int index = 0; index < SEED_SIZE; index++) {
            PrescriptionDetail prescriptionDetail = PrescriptionDetail.builder()
                    .prescription(prescriptions.get(index))
                    .medicine(medicines.get(index))
                    .dosageReference(dosageReferences.get(index))
                    .quantity(1 + (index % 4))
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

    private void seedInvoices(List<MedicalRecord> medicalRecords, List<PaymentMethod> paymentMethods) {
        for (int index = 0; index < SEED_SIZE; index++) {
            Invoice invoice = Invoice.builder()
                    .medicalRecord(medicalRecords.get(index))
                    .paymentMethod(paymentMethods.get(index))
                    .totalAmount(BigDecimal.valueOf(300000 + (long) index * 25000))
                    .paymentDate(LocalDateTime.now().minusDays(SEED_SIZE - index).plusHours(5))
                    .build();
            entityManager.persist(invoice);
        }
    }

    private long countOf(Class<?> entityClass) {
        return entityManager.createQuery("select count(e) from " + entityClass.getSimpleName() + " e", Long.class)
                .getSingleResult();
    }
}