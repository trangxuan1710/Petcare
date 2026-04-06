-- Detach reception_services from medical_record.
-- Prescription ownership is via reception_service_id.

SET @fk_name := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'reception_services'
      AND kcu.COLUMN_NAME = 'medical_record_id'
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @drop_fk_sql := IF(
    @fk_name IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE reception_services DROP FOREIGN KEY `', @fk_name, '`')
);
PREPARE stmt_drop_fk FROM @drop_fk_sql;
EXECUTE stmt_drop_fk;
DEALLOCATE PREPARE stmt_drop_fk;

SET @drop_column_sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.COLUMNS c
     WHERE c.TABLE_SCHEMA = DATABASE()
       AND c.TABLE_NAME = 'reception_services'
       AND c.COLUMN_NAME = 'medical_record_id') = 0,
    'SELECT 1',
    'ALTER TABLE reception_services DROP COLUMN medical_record_id'
);
PREPARE stmt_drop_column FROM @drop_column_sql;
EXECUTE stmt_drop_column;
DEALLOCATE PREPARE stmt_drop_column;
