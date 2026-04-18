-- Phase B: move exam intake fields from exam_form to medical_record.
-- Safe for repeated execution on MySQL 8+.

ALTER TABLE medical_record
    ADD COLUMN IF NOT EXISTS exam_type_option_id BIGINT NULL,
    ADD COLUMN IF NOT EXISTS emergency BIT(1) NOT NULL DEFAULT b'0';

UPDATE medical_record mr
JOIN reception_record rr ON rr.id = mr.reception_record_id
LEFT JOIN exam_form ef ON ef.id = rr.exam_form_id
SET mr.exam_type_option_id = COALESCE(mr.exam_type_option_id, ef.exam_type_option_id),
    mr.emergency = CASE
        WHEN mr.emergency IS NULL THEN COALESCE(ef.is_emergency, b'0')
        ELSE mr.emergency
    END
WHERE rr.id IS NOT NULL;

SET @fk_exam_type_option := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'medical_record'
      AND kcu.COLUMN_NAME = 'exam_type_option_id'
      AND kcu.REFERENCED_TABLE_NAME = 'exam_type_options'
    LIMIT 1
);

SET @add_fk_exam_type_option_sql := IF(
    @fk_exam_type_option IS NULL,
    'ALTER TABLE medical_record ADD CONSTRAINT fk_medical_record_exam_type_option FOREIGN KEY (exam_type_option_id) REFERENCES exam_type_options(id)',
    'SELECT 1'
);
PREPARE stmt_add_fk_exam_type_option FROM @add_fk_exam_type_option_sql;
EXECUTE stmt_add_fk_exam_type_option;
DEALLOCATE PREPARE stmt_add_fk_exam_type_option;

