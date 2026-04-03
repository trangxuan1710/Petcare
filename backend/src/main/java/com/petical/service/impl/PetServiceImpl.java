package com.petical.service.impl;


import com.petical.dto.request.CreatePetRequest;
import com.petical.dto.response.PetExamHistoryItemResponse;
import com.petical.dto.response.PetExamHistoryMedicineResponse;
import com.petical.dto.response.PetExamHistoryResponse;
import com.petical.dto.response.PetExamHistoryServiceResponse;
import com.petical.entity.Client;
import com.petical.entity.ExamResult;
import com.petical.entity.MedicalRecord;
import com.petical.entity.Prescription;
import com.petical.entity.PrescriptionDetail;
import com.petical.entity.Pet;
import com.petical.entity.ReceptionRecord;
import com.petical.entity.ReceptionService;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.ClientRepository;
import com.petical.repository.ExamResultRepository;
import com.petical.repository.MedicalRecordRepository;
import com.petical.repository.PetRepository;
import com.petical.repository.PrescriptionDetailRepository;
import com.petical.repository.PrescriptionRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.repository.ReceptionServiceRepository;
import com.petical.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PetServiceImpl implements PetService {
    private final PetRepository petRepository;
    private final ClientRepository clientRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ReceptionServiceRepository receptionServiceRepository;
    private final ExamResultRepository examResultRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;

    @Override
    public Pet createPet(CreatePetRequest pet) {
        Client c = clientRepository.findById(pet.getClientId()).orElse(null);
        if(c==null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        Pet p = Pet.builder().name(pet.getName()).species(pet.getSpecies())
                .breed(pet.getBreed())
            .dateOfBirth(pet.getDateOfBirth())
                .build();
        p.setClient(c);
        return petRepository.save(p);
    }

        @Override
        @Transactional(readOnly = true)
        public PetExamHistoryResponse getExamHistory(long petId) {
        Pet pet = petRepository.findById(petId)
            .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));

        List<ReceptionRecord> receptions = receptionRecordRepository.findByPetIdOrderByReceptionTimeDesc(petId);
        if (receptions.isEmpty()) {
            return PetExamHistoryResponse.builder()
                .petId(pet.getId())
                .petName(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .timeline(List.of())
                .build();
        }

        List<Long> receptionIds = receptions.stream().map(ReceptionRecord::getId).toList();

        Map<Long, MedicalRecord> medicalRecordByReceptionId = medicalRecordRepository
            .findByReceptionRecordIdIn(receptionIds)
            .stream()
            .collect(Collectors.toMap(mr -> mr.getReceptionRecord().getId(), Function.identity(), (left, right) -> left));

        Map<Long, List<ReceptionService>> receptionServiceByReceptionId = receptionServiceRepository
            .findByReceptionRecordIdIn(receptionIds)
            .stream()
            .collect(Collectors.groupingBy(rs -> rs.getReceptionRecord().getId()));

        List<Long> medicalRecordIds = medicalRecordByReceptionId.values().stream().map(MedicalRecord::getId).toList();

        Map<Long, ExamResult> examResultByMedicalRecordId = medicalRecordIds.isEmpty()
            ? Collections.emptyMap()
            : examResultRepository.findByMedicalRecordIdIn(medicalRecordIds)
            .stream()
            .collect(Collectors.toMap(
                er -> er.getMedicalRecord().getId(),
                Function.identity(),
                (left, right) -> left.getId() >= right.getId() ? left : right
            ));

        List<Long> examResultIds = examResultByMedicalRecordId.values().stream().map(ExamResult::getId).toList();
        Map<Long, Prescription> prescriptionByExamResultId = examResultIds.isEmpty()
            ? Collections.emptyMap()
            : prescriptionRepository.findByExamResultIdIn(examResultIds)
            .stream()
            .collect(Collectors.toMap(p -> p.getExamResult().getId(), Function.identity(), (left, right) -> left));

        List<Long> prescriptionIds = prescriptionByExamResultId.values().stream().map(Prescription::getId).toList();
        Map<Long, List<PrescriptionDetail>> prescriptionDetailsByPrescriptionId = prescriptionIds.isEmpty()
            ? Collections.emptyMap()
            : prescriptionDetailRepository.findByPrescriptionIdIn(prescriptionIds)
            .stream()
            .collect(Collectors.groupingBy(detail -> detail.getPrescription().getId()));

        List<PetExamHistoryItemResponse> timeline = receptions.stream().map(reception -> {
            MedicalRecord medicalRecord = medicalRecordByReceptionId.get(reception.getId());

            List<PetExamHistoryServiceResponse> services = receptionServiceByReceptionId
                .getOrDefault(reception.getId(), List.of())
                .stream()
                .map(rs -> PetExamHistoryServiceResponse.builder()
                    .serviceId(rs.getService().getId())
                    .serviceName(rs.getService().getName())
                    .build())
                .toList();

            ExamResult examResult = medicalRecord == null ? null : examResultByMedicalRecordId.get(medicalRecord.getId());
            Prescription prescription = examResult == null ? null : prescriptionByExamResultId.get(examResult.getId());

            LocalDateTime examDate = medicalRecord == null ? null : medicalRecord.getExamDate();
            if (examDate == null && examResult != null) {
                examDate = examResult.getStartTime();
            }
            if (examDate == null) {
                examDate = reception.getReceptionTime();
            }

            List<PetExamHistoryMedicineResponse> medicines = prescription == null
                ? List.of()
                : prescriptionDetailsByPrescriptionId.getOrDefault(prescription.getId(), List.of())
                .stream()
                .map(detail -> {
                String dosage = detail.getDosageReference() == null
                    ? null
                    : detail.getDosageReference().getTiming() + " - "
                    + detail.getDosageReference().getQuantity() + " "
                    + detail.getDosageReference().getUnit();
                return PetExamHistoryMedicineResponse.builder()
                    .medicineId(detail.getMedicine().getId())
                    .medicineName(detail.getMedicine().getName())
                    .quantity(detail.getQuantity())
                    .unit(detail.getMedicine().getUnit())
                    .dosage(dosage)
                    .build();
                })
                .toList();

            String mainDoctorName = medicalRecord != null && medicalRecord.getDoctor() != null
                ? medicalRecord.getDoctor().getFullName()
                : (reception.getDoctor() != null ? reception.getDoctor().getFullName() : null);
            String assistantDoctorName = reception.getDoctor() != null ? reception.getDoctor().getFullName() : null;

            return PetExamHistoryItemResponse.builder()
                .receptionRecordId(reception.getId())
                .medicalRecordId(medicalRecord == null ? null : medicalRecord.getId())
                .examType(reception.getExamForm() == null || reception.getExamForm().getExamType() == null
                    ? null
                    : reception.getExamForm().getExamType().getValue())
                .status(reception.getStatus() == null ? null : reception.getStatus().getValue())
                .receptionTime(reception.getReceptionTime())
                .examDate(examDate)
                .examReason(reception.getExamReason())
                .symptomDescription(reception.getSymptomDescription())
                .note(reception.getNote())
                .conclusion(examResult == null ? null : examResult.getConclusion())
                .treatmentDirection(examResult == null || examResult.getTreatmentDirection() == null
                    ? null
                    : examResult.getTreatmentDirection().getName())
                .evidencePaths(readEvidencePaths(examResult == null ? null : examResult.getEvidencePath()))
                .mainDoctorName(mainDoctorName)
                .assistantDoctorName(assistantDoctorName)
                .serviceCount(services.size())
                .medicineCount(medicines.size())
                .services(services)
                .medicines(medicines)
                .build();
        }).toList();

        return PetExamHistoryResponse.builder()
            .petId(pet.getId())
            .petName(pet.getName())
            .species(pet.getSpecies())
            .breed(pet.getBreed())
            .timeline(timeline)
            .build();
        }

    private List<String> readEvidencePaths(String rawEvidencePath) {
        if (rawEvidencePath == null || rawEvidencePath.isBlank()) {
            return List.of();
        }

        return Arrays.stream(rawEvidencePath.split(";"))
                .map(String::trim)
                .filter(path -> !path.isBlank())
                .toList();
    }



}
