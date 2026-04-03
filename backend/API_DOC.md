# Petcare Backend API Docs

Base URL: `http://localhost:8080/api`

Swagger UI: `http://localhost:8080/api/swagger-ui/index.html`

OpenAPI JSON: `http://localhost:8080/api/v3/api-docs`

## 1) Authentication (required)

- Tất cả API nghiệp vụ đều yêu cầu Bearer token.
- API public dùng để lấy token:
  - `POST /auth/public/login`

### Login mẫu (seed data)

```bash
curl -X POST 'http://localhost:8080/api/auth/public/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "0901000000",
    "password": "123456"
  }'
```

Sau khi login, dùng token cho mọi API protected:

```bash
-H 'Authorization: Bearer <access_token>'
```

## 2) Seed data chuẩn để gọi API ngay

Các dữ liệu dưới đây được seed ở profile `dev` (deterministic seed):

- Doctor login: `0901000000 / 123456`
- Client phone: `0914000000`
- Receptionist phone: `0902000000`
- Technician phone: `0903000000`
- Service IDs khả dụng: `1..20`
- Medicine IDs khả dụng: `1..20`
- PaymentMethod IDs khả dụng: `1..20`

> Gợi ý nhanh: trong DB mới seed, `doctorId=1`, `clientId=1`, `petId=1`, `technicianId=41`, `serviceId=2`, `medicineId=12` thường có sẵn để test.

---

## 3) Search APIs (theo tên)

### 3.1 Thuốc

`GET /medicines/search?keyword=<name>&limit=<n>`

```bash
curl 'http://localhost:8080/api/medicines/search?keyword=Medicine&limit=5' \
  -H 'Authorization: Bearer <access_token>'
```

### 3.2 Kỹ thuật viên

`GET /technicians/search?keyword=<name>&limit=<n>`

```bash
curl 'http://localhost:8080/api/technicians/search?keyword=Anh&limit=5' \
  -H 'Authorization: Bearer <access_token>'
```

### 3.3 Dịch vụ cận lâm sàng

`GET /paraclinical-services/search?keyword=<name>&limit=<n>`

```bash
curl 'http://localhost:8080/api/paraclinical-services/search?keyword=Service&limit=5' \
  -H 'Authorization: Bearer <access_token>'
```

---

## 4) Flow cận lâm sàng (chọn dịch vụ + người thực hiện)

### 4.1 Lưu danh sách đã chọn

`POST /reception-slips/{receptionRecordId}/paraclinical-services`

Request body:

```json
{
  "items": [
    { "serviceId": 2, "technicianId": 41, "quantity": 1 },
    { "serviceId": 3, "technicianId": 42, "quantity": 1 }
  ]
}
```

cURL:

```bash
curl -X POST 'http://localhost:8080/api/reception-slips/30/paraclinical-services' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      {"serviceId": 2, "technicianId": 41, "quantity": 1},
      {"serviceId": 3, "technicianId": 42, "quantity": 1}
    ]
  }'
```

### 4.2 Lấy danh sách đã chọn (để hiển thị dưới kết quả search)

`GET /reception-slips/{receptionRecordId}/paraclinical-services`

```bash
curl 'http://localhost:8080/api/reception-slips/30/paraclinical-services' \
  -H 'Authorization: Bearer <access_token>'
```

---

## 5) Ghi nhận kết quả khám (multipart/form-data)

`POST /reception-slips/{receptionRecordId}/exam-results`

- Part `payload`: JSON string
- Part `images`: optional, nhiều file

### `payload` mẫu

```json
{
  "doctorId": 1,
  "treatmentDecision": "PARACLINICAL_EXAM",
  "conclusion": "Hô hấp nhẹ, chỉ định cận lâm sàng",
  "serviceIds": [2, 3],
  "medicines": [
    {
      "medicineId": 12,
      "soldQuantity": 2,
      "morning": 1,
      "noon": 0,
      "afternoon": 1,
      "evening": 0,
      "instruction": "Uống trước khi ăn",
      "dosageUnit": "Viên"
    }
  ]
}
```

### cURL không ảnh

```bash
curl -X POST 'http://localhost:8080/api/reception-slips/30/exam-results' \
  -H 'Authorization: Bearer <access_token>' \
  -F 'payload={"doctorId":1,"treatmentDecision":"PARACLINICAL_EXAM","conclusion":"Hô hấp nhẹ, chỉ định cận lâm sàng","serviceIds":[2,3],"medicines":[{"medicineId":12,"soldQuantity":2,"morning":1,"noon":0,"afternoon":1,"evening":0,"instruction":"Uống trước khi ăn","dosageUnit":"Viên"}]}'
```

### cURL có ảnh

```bash
curl -X POST 'http://localhost:8080/api/reception-slips/30/exam-results' \
  -H 'Authorization: Bearer <access_token>' \
  -F 'payload={"doctorId":1,"treatmentDecision":"PARACLINICAL_EXAM","conclusion":"Hô hấp nhẹ, chỉ định cận lâm sàng","serviceIds":[2,3],"medicines":[{"medicineId":12,"soldQuantity":2,"morning":1,"noon":0,"afternoon":1,"evening":0,"instruction":"Uống trước khi ăn","dosageUnit":"Viên"}]}' \
  -F 'images=@/absolute/path/kq-1.jpg' \
  -F 'images=@/absolute/path/kq-2.jpg'
```

### `treatmentDecision` enum

- `DISCHARGE`
- `INPATIENT_TREATMENT`
- `OUTPATIENT_TREATMENT`
- `PARACLINICAL_EXAM`

(Hỗ trợ cả tiếng Việt: `cho về`, `điều trị nội trú`, `điều trị ngoại trú`, `khám cận lâm sàng`)

---

## 6) Lịch sử điều trị thú cưng

`GET /pets/{petId}/exam-history`

```bash
curl 'http://localhost:8080/api/pets/1/exam-history' \
  -H 'Authorization: Bearer <access_token>'
```

---

## 7) Thanh toán

### 7.1 Xem trước hóa đơn theo phiếu tiếp đón

`GET /reception-slips/{receptionRecordId}/invoice`

```bash
curl 'http://localhost:8080/api/reception-slips/30/invoice' \
  -H 'Authorization: Bearer <access_token>'
```

### 7.2 Tạo hóa đơn

`POST /invoices`

- Nếu không gửi `totalAmount`, backend tự tính từ dịch vụ + thuốc (`soldQuantity`).
- Một `medicalRecord` chỉ có 1 hóa đơn.

```bash
curl -X POST 'http://localhost:8080/api/invoices' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "medicalRecord": {"id": 21},
    "paymentMethod": {"id": 1},
    "note": "Thanh toán tại quầy"
  }'
```

---

## 8) Reception statuses

- `WAITING_EXECUTION` (`chờ thực hiện`)
- `WAITING_CONCLUSION` (`chờ kết luận`)
- `IN_PROGRESS` (`đang thực hiện`)
- `WAITING_PAYMENT` (`chờ thanh toán`)
- `PAID` (`đã thanh toán`)

---

## 9) Gợi ý chạy nhanh end-to-end

1. Login lấy token.
2. Search technician + service theo tên.
3. Lưu dịch vụ cận lâm sàng đã chọn cho `receptionRecordId`.
4. Ghi nhận kết quả khám (multipart `payload`, optional `images`).
5. Xem `exam-history` của pet.
6. Xem/tạo hóa đơn.

> Tất cả endpoint trong flow trên đều cần Bearer token từ bước login.
