-- Bảng cấu hình gợi ý liều thuốc theo loài/cân nặng.
-- Dùng cho API /reception-slips/{id}/prescription-autofill
-- để tránh lấy dữ liệu đơn thuốc từ lần khám trước.

CREATE TABLE IF NOT EXISTS prescription_recommendation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    species VARCHAR(50) NULL,
    min_weight DECIMAL(6, 2) NULL,
    max_weight DECIMAL(6, 2) NULL,
    dose_morning DECIMAL(6, 2) NOT NULL DEFAULT 0,
    dose_noon DECIMAL(6, 2) NOT NULL DEFAULT 0,
    dose_afternoon DECIMAL(6, 2) NOT NULL DEFAULT 0,
    dose_evening DECIMAL(6, 2) NOT NULL DEFAULT 0,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    dosage_unit VARCHAR(255) NULL,
    treatment_days INT NOT NULL DEFAULT 1,
    instruction TEXT NULL,
    CONSTRAINT fk_prescription_recommendation_medicine
        FOREIGN KEY (medicine_id) REFERENCES medicine(id)
);

CREATE INDEX idx_prescription_recommendation_filter
    ON prescription_recommendation(species, min_weight, max_weight);
