-- Refactor medical_record.status from FK (exam_status) to enum-like VARCHAR column.
-- MySQL script, safe to re-run.

ALTER TABLE medical_record
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL;

UPDATE medical_record mr
JOIN exam_status es ON es.id = mr.status_id
SET mr.status = UPPER(TRIM(es.name))
WHERE mr.status IS NULL
  AND mr.status_id IS NOT NULL;

UPDATE medical_record
SET status = 'IN_PROGRESS'
WHERE status IS NULL OR TRIM(status) = '';

ALTER TABLE medical_record
    MODIFY COLUMN status VARCHAR(50) NOT NULL;

SET @fk_status_id := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'medical_record'
      AND kcu.COLUMN_NAME = 'status_id'
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @drop_fk_sql := IF(
    @fk_status_id IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE medical_record DROP FOREIGN KEY ', @fk_status_id)
);
PREPARE stmt_drop_fk FROM @drop_fk_sql;
EXECUTE stmt_drop_fk;
DEALLOCATE PREPARE stmt_drop_fk;

ALTER TABLE medical_record
    DROP COLUMN IF EXISTS status_id;

DROP TABLE IF EXISTS exam_status;

