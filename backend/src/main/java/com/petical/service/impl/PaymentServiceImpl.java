package com.petical.service.impl;

import com.petical.entity.*;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.*;
import com.petical.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PAID = "PAID";

    private final InvoiceRepository invoiceRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PrepaymentRepository prepaymentRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ReceptionistRepository receptionistRepository;

    @Override
    @Transactional(readOnly = true)
    public Invoice getInvoiceByReceptionSlip(long receptionSlipId) {
        MedicalRecord medicalRecord = medicalRecordRepository.findByReceptionRecordId(receptionSlipId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return invoiceRepository.findByMedicalRecordId(medicalRecord.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
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
        Invoice toSave = Invoice.builder()
                .medicalRecord(medicalRecord)
                .paymentMethod(paymentMethod)
                .receptionist(receptionist)
                .totalAmount(request.getTotalAmount())
                .status(STATUS_PAID)
                .note(request.getNote())
                .createdAt(now)
                .paymentDate(now)
                .build();

        ReceptionRecord receptionRecord = medicalRecord.getReceptionRecord();
        if (receptionRecord != null) {
            receptionRecord.setStatus(STATUS_PAID);
            receptionRecordRepository.save(receptionRecord);
        }

        return invoiceRepository.save(toSave);
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
            }
        }
        if (invoice.getStatus() == null || invoice.getStatus().isBlank()) {
            invoice.setStatus(STATUS_PENDING);
        }

        return invoiceRepository.save(invoice);
    }

    @Override
    @Transactional
    public Prepayment createPrepayment(Prepayment request) {
        if (request == null
                || request.getReceptionRecord() == null
                || request.getReceptionRecord().getId() <= 0
                || request.getPaymentMethod() == null
                || request.getPaymentMethod().getId() <= 0
                || request.getAmount() == null) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        ReceptionRecord receptionRecord = receptionRecordRepository.findById(request.getReceptionRecord().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethod().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Receptionist receptionist = null;
        if (request.getReceptionist() != null && request.getReceptionist().getId() > 0) {
            receptionist = receptionistRepository.findById(request.getReceptionist().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));
        }

        Prepayment toSave = Prepayment.builder()
                .receptionRecord(receptionRecord)
                .paymentMethod(paymentMethod)
                .receptionist(receptionist)
                .amount(request.getAmount())
                .createdAt(LocalDateTime.now())
                .build();

        return prepaymentRepository.save(toSave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Prepayment> listPrepayments(Long receptionSlipId) {
        if (receptionSlipId == null) {
            return prepaymentRepository.findAll();
        }
        return prepaymentRepository.findByReceptionRecordId(receptionSlipId);
    }
}
