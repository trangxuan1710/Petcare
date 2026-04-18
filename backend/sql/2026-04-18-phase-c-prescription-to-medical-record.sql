-- Phase C (part 1): attach Prescription directly to MedicalRecord aggregate.
-- Safe to rerun on MySQL 8+.

ALTER TABLE prescription
    ADD COLUMN IF NOT EXISTS medical_record_id BIGINT NULL;

UPDATE prescription p
JOIN exam_result er ON er.id = p.exam_result_id
SET p.medical_record_id = COALESCE(p.medical_record_id, er.medical_record_id)
WHERE p.exam_result_id IS NOT NULL;

SET @fk_prescription_medical_record := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'prescription'
      AND kcu.COLUMN_NAME = 'medical_record_id'
      AND kcu.REFERENCED_TABLE_NAME = 'medical_record'
    LIMIT 1
);

SET @add_fk_prescription_medical_record_sql := IF(
    @fk_prescription_medical_record IS NULL,
    'ALTER TABLE prescription ADD CONSTRAINT fk_prescription_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_record(id)',
    'SELECT 1'
);
PREPARE stmt_add_fk_prescription_medical_record FROM @add_fk_prescription_medical_record_sql;
EXECUTE stmt_add_fk_prescription_medical_record;
DEALLOCATE PREPARE stmt_add_fk_prescription_medical_record;

SET @idx_prescription_medical_record := (
    SELECT s.INDEX_NAME
    FROM information_schema.STATISTICS s
    WHERE s.TABLE_SCHEMA = DATABASE()
      AND s.TABLE_NAME = 'prescription'
      AND s.INDEX_NAME = 'idx_prescription_medical_record_id'
    LIMIT 1
);

SET @add_idx_prescription_medical_record_sql := IF(
    @idx_prescription_medical_record IS NULL,
    'CREATE INDEX idx_prescription_medical_record_id ON prescription(medical_record_id)',
    'SELECT 1'
);
PREPARE stmt_add_idx_prescription_medical_record FROM @add_idx_prescription_medical_record_sql;
EXECUTE stmt_add_idx_prescription_medical_record;
DEALLOCATE PREPARE stmt_add_idx_prescription_medical_record;
