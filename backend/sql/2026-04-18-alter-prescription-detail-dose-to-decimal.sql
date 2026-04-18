-- Align prescription_detail dose columns with recommendation table.
-- Keep quantity as INT for current billing flow compatibility.

ALTER TABLE prescription_detail
    MODIFY COLUMN dose_morning DECIMAL(6, 2) NULL,
    MODIFY COLUMN dose_noon DECIMAL(6, 2) NULL,
    MODIFY COLUMN dose_afternoon DECIMAL(6, 2) NULL,
    MODIFY COLUMN dose_evening DECIMAL(6, 2) NULL;
