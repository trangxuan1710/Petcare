# Domain Redesign (2026-04-18)

## 1. Current Problems

Main fragmentation points in current domain:

- `Exam` lifecycle is split across 3 entities:
  - `ExamForm` (exam type, emergency)
  - `MedicalRecord` (doctor, status, exam date)
  - `ExamResult` (conclusion, treatment direction, time range, evidence legacy)
- `ReceptionRecord` still points to `ExamForm`, while billing/paraclinical/prescription flows point to `MedicalRecord` + `ExamResult`.
- Read-side code repeatedly joins 2-3 repositories to answer a single "exam detail" use case.

## 2. Target Domain (Aggregate-oriented)

### Bounded Contexts

- `Identity`: `User`, `Doctor`, `Receptionist`, `Technician`
- `ClientCare`: `Client`, `Pet`, `PetSpecies`, `PetBreed`
- `Encounter`: `Reception`, `Exam`, `ExamService`, `ExamPrescription`, `ExamEvidence`
- `Billing`: `Invoice`, `PaymentMethod`
- `Catalog`: `Service`, `Medicine`, `TreatmentDirection`, `ExamTypeOption`

### Target Aggregate Root in Encounter

- `Exam` is aggregate root (one exam per reception)
- `Exam` owns:
  - intake/form fields (exam type, emergency)
  - clinical state fields (doctor, status, exam date)
  - conclusion/result fields (treatment direction, conclusion, start/end)
  - evidence references

Target logical shape:

```text
Reception(1) --- (1) Exam
Exam(1) --- (n) ExamService (mapped from ReceptionService + ServiceOrder + ServiceResult)
Exam(1) --- (n) ExamPrescriptionItem (mapped from Prescription + PrescriptionDetail)
Exam(1) --- (n) ExamEvidence (mapped from ResultFile)
```

## 3. Transitional Strategy

This repo is currently in transition mode, so redesign is done in phases:

### Phase A (already started)

- `MedicalRecord.status` switched to enum (`MedicalRecordStatus`).
- Legacy status table removed (`exam_status`).
- Added aggregate read endpoint:
  - `GET /reception-slips/{id}/exam`
  - returns unified data from `ExamForm + MedicalRecord + ExamResult`.

### Phase B

- Replace direct UI dependency on `receptionRecord.examForm` with `/reception-slips/{id}/exam`.
- Stop creating new `ExamForm` rows; write intake fields directly into `MedicalRecord` extension columns.

Status: partially implemented.

- `MedicalRecord` now stores `examTypeOption` + `emergency`.
- New records are dual-written (legacy `ExamForm` + new fields in `MedicalRecord`) for backward compatibility.
- SQL migration added: `backend/sql/2026-04-18-phase-b-exam-intake-to-medical-record.sql`.

### Phase C

- Migrate persistence:
  - move `ExamForm` fields into `medical_record` (or rename to `exam` table).
  - move `ExamResult` fields into same aggregate table.
  - migrate references from `exam_result_id` to `exam_id` for prescription/evidence.

Status: started (part 1).

- `Prescription` now has direct relation to `MedicalRecord` (`medical_record_id`) while keeping `exam_result_id` for compatibility.
- Read path in autofill logic now prefers `Prescription -> MedicalRecord -> ReceptionRecord`.
- SQL migration added: `backend/sql/2026-04-18-phase-c-prescription-to-medical-record.sql`.

### Phase D

- Drop legacy tables/columns:
  - `exam_form`
  - `exam_result`
  - `reception_record.exam_form_id`
  - legacy evidence text column after full `ResultFile` migration.

Status: partially implemented.

- `ExamForm` entity/repository removed from codebase.
- SQL migration added to drop legacy schema:
  - `backend/sql/2026-04-18-drop-legacy-exam-form.sql`

## 4. Immediate Coding Rule for New Features

For any new exam-related use case:

- read through aggregate API (`/reception-slips/{id}/exam`)
- avoid adding new cross-entity joins between `ExamForm`, `MedicalRecord`, `ExamResult`
- treat `ExamForm` and `ExamResult` as legacy persistence layers until Phase C completes.
