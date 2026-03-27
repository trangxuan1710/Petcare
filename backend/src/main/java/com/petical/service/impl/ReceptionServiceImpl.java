package com.petical.service.impl;

import com.petical.entity.*;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.*;
import com.petical.service.ReceptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceptionServiceImpl implements ReceptionService {

    private static final String RECEIVED_STATUS = "Đã tiếp đón";

    private final ClientRepository clientRepository;
    private final PetRepository petRepository;
    private final ReceptionistRepository receptionistRepository;
    private final ExamFormRepository examFormRepository;
    private final ReceptionRecordRepository receptionRecordRepository;

        @Override
        @Transactional
        public ReceptionRecord createReceptionEntity(ReceptionRecord request) {
                if (request == null
                                || request.getClient() == null
                                || request.getPet() == null
                                || request.getReceptionist() == null) {
                        throw new AppException(ErrorCode.ERROR_INPUT);
                }

                Client client = clientRepository.findById(request.getClient().getId())
                                .orElseThrow(() -> new AppException(ErrorCode.CLIENT_NOT_FOUND));

                Pet pet = petRepository.findById(request.getPet().getId())
                                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));

                if (!petRepository.existsByIdAndClientId(pet.getId(), client.getId())) {
                        throw new AppException(ErrorCode.PET_NOT_BELONG_TO_CLIENT);
                }

                Receptionist receptionist = receptionistRepository.findById(request.getReceptionist().getId())
                                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));

                ExamForm examForm;
                if (request.getExamForm() != null && request.getExamForm().getId() > 0) {
                        examForm = examFormRepository.findById(request.getExamForm().getId())
                                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                } else {
                        examForm = ExamForm.builder()
                                        .examType(request.getExamForm() != null ? request.getExamForm().getExamType() : "GENERAL")
                                        .isEmergency(request.getExamForm() != null && request.getExamForm().isEmergency())
                                        .build();
                        examFormRepository.save(examForm);
                }

                if (request.getPet().getWeight() != null) {
                        pet.setWeight(request.getPet().getWeight());
                        petRepository.save(pet);
                }

                ReceptionRecord receptionRecord = ReceptionRecord.builder()
                                .client(client)
                                .pet(pet)
                                .receptionist(receptionist)
                                .examForm(examForm)
                                .examReason(request.getExamReason())
                                .symptomDescription(request.getSymptomDescription())
                                .note(request.getNote())
                                .receptionTime(request.getReceptionTime())
                                .status(RECEIVED_STATUS)
                                .build();
                return receptionRecordRepository.save(receptionRecord);
        }

    @Override
    @Transactional(readOnly = true)
    public List<ReceptionRecord> listReceptionSlips(String status, LocalDate date, Long branchId) {
                List<ReceptionRecord> records;
                if (status != null && !status.isBlank() && date != null) {
                        LocalDateTime start = date.atStartOfDay();
                        LocalDateTime end = date.plusDays(1).atStartOfDay();
                        records = receptionRecordRepository.findByStatusIgnoreCaseAndReceptionTimeBetween(status.trim(), start, end);
                } else if (status != null && !status.isBlank()) {
                        records = receptionRecordRepository.findByStatusIgnoreCase(status.trim());
                } else if (date != null) {
                        LocalDateTime start = date.atStartOfDay();
                        LocalDateTime end = date.plusDays(1).atStartOfDay();
                        records = receptionRecordRepository.findByReceptionTimeBetween(start, end);
                } else {
                        records = receptionRecordRepository.findAll();
                }
                return records;
        }

    @Override
    @Transactional(readOnly = true)
    public ReceptionRecord getReceptionSlip(long id) {
                ReceptionRecord record = receptionRecordRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return record;
        }

    @Override
    @Transactional
    public ReceptionRecord updateReceptionSlip(long id, ReceptionRecord request) {
                ReceptionRecord record = receptionRecordRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                if (request.getPet() != null && request.getPet().getWeight() != null) {
                        record.getPet().setWeight(request.getPet().getWeight());
                }
                if (request.getSymptomDescription() != null && !request.getSymptomDescription().isBlank()) {
                        record.setSymptomDescription(request.getSymptomDescription());
                }
                if (request.getNote() != null) {
                        record.setNote(request.getNote());
                }

                return receptionRecordRepository.save(record);
        }
}
