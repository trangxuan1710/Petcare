-- Drop legacy exam_form model after migrating intake fields into medical_record.
-- Safe for rerun.

SET @fk_reception_exam_form := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'reception_record'
      AND kcu.COLUMN_NAME = 'exam_form_id'
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @drop_fk_reception_exam_form_sql := IF(
    @fk_reception_exam_form IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE reception_record DROP FOREIGN KEY ', @fk_reception_exam_form)
);
PREPARE stmt_drop_fk_reception_exam_form FROM @drop_fk_reception_exam_form_sql;
EXECUTE stmt_drop_fk_reception_exam_form;
DEALLOCATE PREPARE stmt_drop_fk_reception_exam_form;

ALTER TABLE reception_record
    DROP COLUMN IF EXISTS exam_form_id;

DROP TABLE IF EXISTS exam_form;

