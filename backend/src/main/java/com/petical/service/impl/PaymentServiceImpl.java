package com.petical.service.impl;

import com.petical.dto.response.InvoicePreviewResponse;
import com.petical.entity.*;
import com.petical.enums.ErrorCode;
import com.petical.enums.ReceptionStatus;
import com.petical.errors.AppException;
import com.petical.repository.*;
import com.petical.dto.response.NotificationMessage;
import com.petical.service.PaymentService;
import com.petical.service.SseNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PAID = "PAID";
    private static final String CHARGE_TYPE_SERVICE = "SERVICE";
    private static final String CHARGE_TYPE_MEDICINE = "MEDICINE";

    private final InvoiceRepository invoiceRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ReceptionistRepository receptionistRepository;
    private final ReceptionServiceRepository receptionServiceRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final SseNotificationService sseNotificationService;

    @Override
    @Transactional(readOnly = true)
    public InvoicePreviewResponse getInvoiceByReceptionSlip(long receptionSlipId) {
        MedicalRecord medicalRecord = medicalRecordRepository.findByReceptionRecordId(receptionSlipId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Invoice invoice = invoiceRepository.findByMedicalRecordId(medicalRecord.getId())
            .orElseGet(() -> Invoice.builder()
                .medicalRecord(medicalRecord)
                .totalAmount(calculateInvoiceAmount(medicalRecord))
                .status(STATUS_PENDING)
                .createdAt(null)
                .paymentDate(null)
                .build());

        return mapToInvoicePreviewResponse(invoice, medicalRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethod> getPaymentMethods() {
        return paymentMethodRepository.findAll();
    }

    @Override
    @Transactional
    public InvoicePreviewResponse createInvoice(Invoice request) {
        if (request == null
                || request.getMedicalRecord() == null
                || request.getMedicalRecord().getId() <= 0
                || request.getPaymentMethod() == null
                || request.getPaymentMethod().getId() <= 0) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        MedicalRecord medicalRecord = medicalRecordRepository.findById(request.getMedicalRecord().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (invoiceRepository.findByMedicalRecordId(medicalRecord.getId()).isPresent()) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_ERROR);
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethod().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Receptionist receptionist = null;
        if (request.getReceptionist() != null && request.getReceptionist().getId() > 0) {
            receptionist = receptionistRepository.findById(request.getReceptionist().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));
        }

        LocalDateTime now = LocalDateTime.now();
        BigDecimal totalAmount = request.getTotalAmount() == null
            ? calculateInvoiceAmount(medicalRecord)
            : request.getTotalAmount();

        Invoice toSave = Invoice.builder()
                .medicalRecord(medicalRecord)
                .paymentMethod(paymentMethod)
                .receptionist(receptionist)
            .totalAmount(totalAmount)
                .status(STATUS_PAID)
                .note(request.getNote())
                .createdAt(now)
                .paymentDate(now)
                .build();

        ReceptionRecord receptionRecord = medicalRecord.getReceptionRecord();
        if (receptionRecord != null) {
            receptionRecord.setStatus(ReceptionStatus.PAID);
            receptionRecordRepository.save(receptionRecord);
            notifyPaidToReceptionist(receptionRecord);
        }

        Invoice savedInvoice = invoiceRepository.save(toSave);
        Invoice persistedInvoice = invoiceRepository.findById(savedInvoice.getId())
            .orElse(savedInvoice);
        return mapToInvoicePreviewResponse(persistedInvoice, persistedInvoice.getMedicalRecord());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoicePreviewResponse getInvoice(long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return mapToInvoicePreviewResponse(invoice, invoice.getMedicalRecord());
    }

    @Override
    @Transactional
    public InvoicePreviewResponse updateInvoice(long id, Invoice request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (request.getPaymentMethod() != null && request.getPaymentMethod().getId() > 0) {
            PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethod().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            invoice.setPaymentMethod(paymentMethod);
        }
        if (request.getNote() != null) {
            invoice.setNote(request.getNote());
        }
        if (request.getTotalAmount() != null) {
            invoice.setTotalAmount(request.getTotalAmount());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            invoice.setStatus(request.getStatus());
            if (STATUS_PAID.equalsIgnoreCase(request.getStatus())) {
                invoice.setPaymentDate(LocalDateTime.now());

                MedicalRecord medicalRecord = invoice.getMedicalRecord();
                ReceptionRecord receptionRecord = medicalRecord == null ? null : medicalRecord.getReceptionRecord();
                if (receptionRecord != null) {
                    receptionRecord.setStatus(ReceptionStatus.PAID);
                    receptionRecordRepository.save(receptionRecord);
                    notifyPaidToReceptionist(receptionRecord);
                }
            }
        }
        if (invoice.getStatus() == null || invoice.getStatus().isBlank()) {
            invoice.setStatus(STATUS_PENDING);
        }

        Invoice persisted = invoiceRepository.save(invoice);
        return mapToInvoicePreviewResponse(persisted, persisted.getMedicalRecord());
    }

    private BigDecimal calculateInvoiceAmount(MedicalRecord medicalRecord) {
        if (medicalRecord == null) {
            return BigDecimal.ZERO;
        }

        return buildChargeItems(medicalRecord).stream()
                .map(item -> item.getAmount() == null ? BigDecimal.ZERO : item.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private InvoicePreviewResponse mapToInvoicePreviewResponse(Invoice invoice, MedicalRecord fallbackMedicalRecord) {
        MedicalRecord medicalRecord = invoice.getMedicalRecord() == null ? fallbackMedicalRecord : invoice.getMedicalRecord();
        ReceptionRecord receptionRecord = medicalRecord == null ? null : medicalRecord.getReceptionRecord();
        Long medicalRecordId = medicalRecord == null ? null : medicalRecord.getId();
        Long invoiceId = invoice.getId() > 0 ? invoice.getId() : null;
        List<InvoicePreviewResponse.ChargeItem> chargeItems = buildChargeItems(medicalRecord);
        BigDecimal serviceTotal = chargeItems.stream()
                .filter(item -> CHARGE_TYPE_SERVICE.equalsIgnoreCase(item.getType()))
                .map(item -> item.getAmount() == null ? BigDecimal.ZERO : item.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal medicineTotal = chargeItems.stream()
                .filter(item -> CHARGE_TYPE_MEDICINE.equalsIgnoreCase(item.getType()))
                .map(item -> item.getAmount() == null ? BigDecimal.ZERO : item.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAmount = invoice.getTotalAmount() == null
                ? serviceTotal.add(medicineTotal)
                : invoice.getTotalAmount();

        return InvoicePreviewResponse.builder()
                .id(invoiceId)
                .totalAmount(totalAmount)
                .status(invoice.getStatus())
                .note(invoice.getNote())
                .createdAt(invoice.getCreatedAt())
                .paymentDate(invoice.getPaymentDate())
                .receptionTime(receptionRecord == null ? null : receptionRecord.getReceptionTime())
                .medicalRecordId(medicalRecordId)
                .medicalRecord(InvoicePreviewResponse.IdRef.builder().id(medicalRecordId).build())
                .serviceTotal(serviceTotal)
                .medicineTotal(medicineTotal)
                .customer(mapCustomerInfo(receptionRecord))
                .pet(mapPetInfo(receptionRecord))
                .chargeItems(chargeItems)
                .build();
    }
    private List<InvoicePreviewResponse.ChargeItem> buildChargeItems(MedicalRecord medicalRecord) {
        List<InvoicePreviewResponse.ChargeItem> chargeItems = new ArrayList<>();
        if (medicalRecord == null) {
            return chargeItems;
        }

        ReceptionRecord receptionRecord = medicalRecord.getReceptionRecord();
        if (receptionRecord == null) {
            return chargeItems;
        }

        List<ReceptionService> receptionServices = receptionServiceRepository.findByReceptionRecordId(receptionRecord.getId());
        for (ReceptionService receptionService : receptionServices) {
            com.petical.entity.Service service = receptionService.getService();
            if (service == null) {
                continue;
            }

            BigDecimal unitPrice = service.getUnitPrice() == null ? BigDecimal.ZERO : service.getUnitPrice();
            int quantity = 1;
            BigDecimal amount = unitPrice.multiply(BigDecimal.valueOf(quantity));

            chargeItems.add(InvoicePreviewResponse.ChargeItem.builder()
                    .id(receptionService.getId())
                    .type(CHARGE_TYPE_SERVICE)
                    .serviceId(service.getId())
                    .serviceName(service.getName())
                    .name(service.getName())
                    .unit("luot")
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .discount(BigDecimal.ZERO)
                    .insurance(BigDecimal.ZERO)
                    .amount(amount)
                    .build());
        }

        List<Long> receptionServiceIds = receptionServices.stream().map(ReceptionService::getId).toList();
        List<Prescription> prescriptions = receptionServiceIds.isEmpty()
                ? List.of()
                : prescriptionRepository.findByReceptionServiceIdIn(receptionServiceIds);
        java.util.Map<Long, Prescription> prescriptionById = prescriptions.stream()
                .filter(item -> item != null && item.getId() > 0)
                .collect(java.util.stream.Collectors.toMap(
                        Prescription::getId,
                        java.util.function.Function.identity(),
                        (left, right) -> left
                ));

        if (!prescriptions.isEmpty()) {
            List<Long> prescriptionIds = prescriptions.stream().map(Prescription::getId).toList();
            List<PrescriptionDetail> details = prescriptionDetailRepository.findByPrescriptionIdIn(prescriptionIds);

            for (PrescriptionDetail detail : details) {
                Medicine medicine = detail.getMedicine();
                if (medicine == null || !isBillableMedicine(medicine)) {
                    continue;
                }

                BigDecimal boxPrice = (medicine.getBoxPrice() != null && medicine.getBoxPrice().signum() > 0)
                        ? medicine.getBoxPrice()
                        : (medicine.getUnitPrice() != null ? medicine.getUnitPrice() : BigDecimal.ZERO);
                int prescribedQuantity = Math.max(detail.getQuantity(), 1);
                int quantityPerBox = Math.max(medicine.getQuantityPerBox(), 1);
                int boxQuantity = (int) Math.ceil((double) prescribedQuantity / quantityPerBox);
                BigDecimal amount = boxPrice.multiply(BigDecimal.valueOf(boxQuantity));

                Prescription ownerPrescription = detail.getPrescription() == null
                        ? null
                        : prescriptionById.get(detail.getPrescription().getId());
                ReceptionService ownerReceptionService = ownerPrescription == null ? null : ownerPrescription.getReceptionService();
                com.petical.entity.Service ownerService = ownerReceptionService == null ? null : ownerReceptionService.getService();

                chargeItems.add(InvoicePreviewResponse.ChargeItem.builder()
                        .id(detail.getId())
                        .type(CHARGE_TYPE_MEDICINE)
                        .serviceId(ownerService == null ? null : ownerService.getId())
                        .serviceName(ownerService == null ? null : ownerService.getName())
                        .name(medicine.getName())
                        .unit("hop")
                        .quantity(boxQuantity)
                        .unitPrice(boxPrice)
                        .discount(BigDecimal.ZERO)
                        .insurance(BigDecimal.ZERO)
                        .amount(amount)
                        .build());
            }
        }

        return chargeItems;
    }
    private boolean isBillableMedicine(Medicine medicine) {
        String type = medicine == null || medicine.getType() == null
                ? ""
                : medicine.getType().trim().toUpperCase(Locale.ROOT);
        return type.isBlank()
                || "THUOC".equals(type)
                || "MEDICINE".equals(type);
    }

    private BigDecimal resolveMedicinePrice(Medicine medicine, String dosageUnit) {
        if (medicine == null) {
            return BigDecimal.ZERO;
        }

        // Rule: Medicines are always sold by box in the billing module.
        // We prioritize the box price (unit price * quantity per box) for all billable medications.
        if (medicine.getQuantityPerBox() > 0) {
            BigDecimal boxPrice = medicine.getBoxPrice();
            if (boxPrice != null && boxPrice.signum() > 0) {
                return boxPrice;
            }
        }

        return medicine.getUnitPrice() != null ? medicine.getUnitPrice() : BigDecimal.ZERO;
    }

    private InvoicePreviewResponse.CustomerInfo mapCustomerInfo(ReceptionRecord receptionRecord) {
        Client client = receptionRecord == null ? null : receptionRecord.getClient();
        if (client == null) {
            return null;
        }
        return InvoicePreviewResponse.CustomerInfo.builder()
                .id(client.getId())
                .fullName(client.getFullName())
                .phoneNumber(client.getPhoneNumber())
                .build();
    }

    private InvoicePreviewResponse.PetInfo mapPetInfo(ReceptionRecord receptionRecord) {
        Pet pet = receptionRecord == null ? null : receptionRecord.getPet();
        if (pet == null) {
            return null;
        }
        return InvoicePreviewResponse.PetInfo.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .gender(null)
                .weight(receptionRecord.getWeight())
                .build();
    }

    private void notifyPaidToReceptionist(ReceptionRecord receptionRecord) {
        if (receptionRecord == null || receptionRecord.getId() <= 0) {
            return;
        }

        String petName = receptionRecord.getPet() == null || receptionRecord.getPet().getName() == null
                ? "thu cung"
                : receptionRecord.getPet().getName();

        sseNotificationService.sendNotificationToRole("RECEPTIONIST",
                NotificationMessage.builder()
                        .title("Da thanh toan")
                        .message("Hoa don cua thu cung " + petName + " da duoc thanh toan.")
                        .link("/receptionists/payment/" + receptionRecord.getId())
                        .timestamp(LocalDateTime.now())
                        .type("PAID")
                        .build());
    }

}



