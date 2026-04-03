package com.petical.service.impl;

import com.petical.dto.response.InvoicePreviewResponse;
import com.petical.entity.*;
import com.petical.enums.ErrorCode;
import com.petical.enums.ReceptionStatus;
import com.petical.errors.AppException;
import com.petical.repository.*;
import com.petical.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PAID = "PAID";

    private final InvoiceRepository invoiceRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ReceptionistRepository receptionistRepository;
    private final ReceptionServiceRepository receptionServiceRepository;
    private final ExamResultRepository examResultRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;

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
    public Invoice createInvoice(Invoice request) {
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
        }

        Invoice savedInvoice = invoiceRepository.save(toSave);
        return invoiceRepository.findById(savedInvoice.getId())
                .orElse(savedInvoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Invoice getInvoice(long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional
    public Invoice updateInvoice(long id, Invoice request) {
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
                }
            }
        }
        if (invoice.getStatus() == null || invoice.getStatus().isBlank()) {
            invoice.setStatus(STATUS_PENDING);
        }

        return invoiceRepository.save(invoice);
    }

    private BigDecimal calculateInvoiceAmount(MedicalRecord medicalRecord) {
        ReceptionRecord receptionRecord = medicalRecord.getReceptionRecord();
        if (receptionRecord == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal serviceTotal = receptionServiceRepository.findByReceptionRecordIdIn(List.of(receptionRecord.getId()))
                .stream()
                .map(item -> item.getService().getUnitPrice() == null ? BigDecimal.ZERO : item.getService().getUnitPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal medicineTotal = examResultRepository.findFirstByMedicalRecordId(medicalRecord.getId())
                .flatMap(examResult -> prescriptionRepository.findByExamResultId(examResult.getId()))
                .map(prescription -> prescriptionDetailRepository.findByPrescriptionIdIn(List.of(prescription.getId()))
                        .stream()
                        .map(detail -> {
                            BigDecimal unitPrice = detail.getMedicine() == null || detail.getMedicine().getPrice() == null
                                    ? BigDecimal.ZERO
                                    : detail.getMedicine().getPrice();
                            return unitPrice.multiply(BigDecimal.valueOf(detail.getQuantity()));
                        })
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .orElse(BigDecimal.ZERO);

        return serviceTotal.add(medicineTotal);
    }

    private InvoicePreviewResponse mapToInvoicePreviewResponse(Invoice invoice, MedicalRecord fallbackMedicalRecord) {
        MedicalRecord medicalRecord = invoice.getMedicalRecord() == null ? fallbackMedicalRecord : invoice.getMedicalRecord();
        Long medicalRecordId = medicalRecord == null ? null : medicalRecord.getId();
        Long invoiceId = invoice.getId() > 0 ? invoice.getId() : null;

        return InvoicePreviewResponse.builder()
                .id(invoiceId)
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .note(invoice.getNote())
                .createdAt(invoice.getCreatedAt())
                .paymentDate(invoice.getPaymentDate())
                .medicalRecordId(medicalRecordId)
                .medicalRecord(InvoicePreviewResponse.IdRef.builder().id(medicalRecordId).build())
                .build();
    }

}
