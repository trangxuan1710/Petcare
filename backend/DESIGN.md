# Petical — Thiết kế Sequence Diagram & REST API

> Dự án triển khai theo mô hình **Client–Server**. Client gọi server qua REST API.  
> Mọi response đều theo cấu trúc chuẩn `ApiResponse<T>`.

---

## Cấu trúc response chuẩn

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    @Builder.Default
    private int code = 200;
    @Builder.Default
    private String message = "Success";
    private T data;
}
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `code` | `int` | HTTP status code (200, 201, 400, 401, 403, 404, 500...) |
| `message` | `String` | Thông điệp mô tả kết quả |
| `data` | `T` | Payload trả về (null khi lỗi hoặc không có dữ liệu) |

---

## Tổng quan các actors

| Actor | Vai trò |
|-------|---------|
| **Lễ tân** | Tiếp đón, tra cứu khách hàng, tạo phiếu, thanh toán |
| **Bác sĩ** | Khám lâm sàng, chỉ định CLS, kết luận, kê đơn thuốc |
| **Kỹ thuật viên (KTV)** | Thực hiện dịch vụ cận lâm sàng, ghi nhận kết quả |
| **Client** | Ứng dụng Petical (mobile/web) — gửi REST request |
| **Server** | Backend Spring Boot — xử lý nghiệp vụ |
| **Database** | Lưu trữ dữ liệu |

---

## Status flow của phiếu khám

```
PENDING → RECEIVED → ONGOING → WAITING_CONCLUSION → COMPLETED → PAID
```

| Status | Ý nghĩa |
|--------|---------|
| `PENDING` | Phiếu vừa tạo, chưa tiếp đón xong |
| `RECEIVED` | Đã tiếp đón, chờ bác sĩ |
| `ONGOING` | Bác sĩ đang thực hiện khám |
| `WAITING_CONCLUSION` | Chờ bác sĩ kết luận (sau CLS) |
| `COMPLETED` | Bác sĩ đã kết luận, chờ thanh toán |
| `PAID` | Đã thanh toán — kết thúc quy trình |

---

## 1. Sequence Diagram — Tiếp đón

### Mô tả

Lễ tân tra cứu khách hàng qua SĐT, tạo hồ sơ nếu mới, sau đó tạo phiếu tiếp đón. Hệ thống tự gửi notification (WebSocket) cho bác sĩ.

### Sơ đồ

```
Lễ tân          Client               Server               Database
  |               |                    |                     |
  |--Nhập SĐT --> |                    |                     |
  |               |--GET /customers?phone=... -->             |
  |               |                    |--SELECT customer --> |
  |               |                    |<-- customer | null --|
  |               |                    |                     |
  |               | [alt: KH cũ tìm thấy]                   |
  |               |<-- 200 {data:customer} --|               |
  |<-- Hiện thông tin KH --|            |                     |
  |               |                    |                     |
  |               | [else: không tìm thấy → tạo mới KH]     |
  |               |--POST /customers -->|                     |
  |               |                    |--INSERT customer --> |
  |               |                    |<-- customerId -------|
  |               |<-- 201 {data:customer} --|               |
  |               |                    |                     |
  |--Nhấn "Tạo phiếu" -->|             |                     |
  |               |--POST /reception-slips -->               |
  |               |                    |--INSERT slip ------> |
  |               |                    |<-- slipId -----------|
  |               |<-- 201 {data:receptionSlip} --|          |
  |<-- Hiện "Đã tiếp đón" --|          |                     |
  |               |                    |                     |
  |               |<-- WebSocket: notify bác sĩ --|          |
```

---

## 2. Sequence Diagram — Khám Lâm sàng

### Mô tả

Bác sĩ nhận notification, bắt đầu khám, hệ thống cập nhật trạng thái, bác sĩ thực hiện khám và ghi nhận kết quả kèm hướng xử trí.

### Sơ đồ

```
Bác sĩ          Client               Server               Database
  |               |                    |                     |
  |               |<-- WS: push notify "phiếu mới" --|       |
  |<-- Hiện thông báo --|              |                     |
  |               |                    |                     |
  |--Click "Bắt đầu" --> |             |                     |
  |               |--PATCH /examination-slips/{id}/start --> |
  |               |                    |--UPDATE status="ONGOING"->|
  |               |<-- 200 {data:slip} --|                   |
  |               |                    |                     |
  |  [opt: có lưu ý]                   |                     |
  |<-- Hiện popup lưu ý --|            |                     |
  |               |                    |                     |
  |--Click "Thực hiện dịch vụ" -->|    |                     |
  |               |--GET /medicines/suggestions?petId=... -->|
  |               |<-- 200 {data:[{medicine,dosage}]} --|    |
  |               |                    |                     |
  |--Nhập kết quả + chọn hướng xử trí -->|                  |
  |               |--POST /examination-results -->           |
  |               |                    |--INSERT result ----> |
  |               |                    |--UPDATE status+direction->|
  |               |<-- 201 {data:result} --|                 |
  |<-- Điều hướng theo hướng xử trí --|  |                   |
  |               |                    |                     |
  |               |<-- WS: notify Lễ tân / KTV --|           |
```

---

## 3. Sequence Diagram — Khám Cận lâm sàng

### Mô tả

Bác sĩ chỉ định dịch vụ CLS và KTV. Hệ thống gửi notification cho KTV. KTV thực hiện và ghi kết quả. Khi tất cả xong, bác sĩ được notify để kết luận.

### Sơ đồ

```
Bác sĩ   KTV      Client             Server             Database
  |        |         |                  |                  |
  |--Chọn dịch vụ + KTV -->|            |                  |
  |        |         |--GET /services?type=PARACLINICAL --> |
  |        |         |<-- 200 {data:[services]} --|        |
  |        |         |--GET /technicians -->       |        |
  |        |         |<-- 200 {data:[technicians]}--|      |
  |        |         |                  |                  |
  |        |         |--POST /service-orders -->            |
  |        |         |                  |--INSERT orders -> |
  |        |         |<-- 201 {data:serviceOrder} --|      |
  |<-- Điều hướng về trang chủ --|     |                   |
  |        |         |                  |                  |
  |        |         |<-- WS: notify KTV --|               |
  |        |<-- Hiện công việc mới --|   |                  |
  |        |         |                  |                  |
  |        |--Click "Bắt đầu" -->|      |                  |
  |        |         |--PATCH /service-orders/{id}/start -->|
  |        |         |<-- 200 OK --|    |                  |
  |        |         |                  |                  |
  |        |--Nhập kết quả + upload ảnh -->|               |
  |        |         |--POST /service-results -->           |
  |        |         |                  |--INSERT result -> |
  |        |         |<-- 201 {data:result} --|            |
  |        |<-- Cập nhật "Hoàn thành" --|  |               |
  |        |         |                  |                  |
  |        |         |     [all done]   |                  |
  |        |         |<-- WS: notify Bác sĩ --|            |
  |<-- Hiện phiếu "Chờ kết luận" --|   |                   |
  |        |         |                  |                  |
  |--Xem kết quả + nhập kết luận -->|   |                  |
  |        |         |--PATCH /examination-slips/{id}/conclude -->|
  |        |         |                  |--UPDATE slip+status->|
  |        |         |<-- 200 {data:concludedSlip} --|     |
```

---

## 4. Sequence Diagram — Thanh toán

### Mô tả

Sau khi phiếu khám ở trạng thái `COMPLETED`, lễ tân nhận notification, xem chi tiết hóa đơn, chọn hình thức thanh toán và xác nhận.

### Sơ đồ

```
Lễ tân          Client               Server               Database
  |               |                    |                     |
  |               |<-- WS: "Chờ thanh toán" --|              |
  |<-- Hiện thông báo --|              |                     |
  |               |                    |                     |
  |--Click xem chi tiết -->|           |                     |
  |               |--GET /reception-slips/{id}/invoice -->   |
  |               |<-- 200 {data:invoiceDetail} --|          |
  |<-- Hiển thị chi tiết + tổng tiền --|         |           |
  |               |                    |                     |
  |--Nhấn "Thanh toán" -->|            |                     |
  |               |--GET /payment-methods -->                |
  |               |<-- 200 {data:[methods]} --|              |
  |<-- Hiện bottom sheet PTTT --|      |                     |
  |               |                    |                     |
  |  [alt: chưa chọn PTTT]             |                     |
  |               |<-- 400 {message:"Vui lòng chọn PTTT"} --|
  |               |                    |                     |
  |--Chọn PTTT → Xác nhận -->|         |                     |
  |               |--POST /invoices --> |                     |
  |               |                    |--INSERT invoice ---> |
  |               |                    |--UPDATE status="PAID"->|
  |               |<-- 201 {data:invoice} --|                |
  |<-- Hiển thị "Hoàn thành" --|       |                     |
```

---

## 5. API Design chi tiết

### 5.1. Khách hàng & Thú cưng

#### `GET /customers`

Tìm kiếm khách hàng theo số điện thoại.

**Query params:**

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `phone` | Có | Số điện thoại khách hàng |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "C001",
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "address": "Hà Nội",
    "pets": [
      { "id": "P001", "name": "Miu", "species": "CAT" }
    ]
  }
}
```

> Trả về `null` trong `data` nếu không tìm thấy (code vẫn là 200).

---

#### `POST /customers`

Tạo mới khách hàng và nhập luôn thú cưng đầu tiên.

**Request body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "address": "Hà Nội",
  "pet": {
    "name": "Bông",
    "species": "DOG",
    "breed": "Corgi",
    "gender": "Female",
    "dateOfBirth": "2022-05-10",
    "weight": 8.5
  }
}
```

**Response:** `201` — `Customer`

---

#### `GET /customers/{id}/pets`

Lấy danh sách thú cưng của khách hàng.

**Response:** `200` — `Pet[]`

---

#### `POST /pets`

Tạo mới thú cưng.

**Request body:**
```json
{
  "customerId": "C001",
  "name": "Bông",
  "species": "DOG",
  "breed": "Corgi",
  "gender": "MALE",
  "dob": "2022-05-10",
  "weight": 8.5
}
```

**Response:** `201` — `Pet`

---

### 5.2. Tiếp đón

#### `GET /reception-slips`

Lấy danh sách phiếu tiếp đón.

**Query params:**

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `status` | Không | Lọc theo trạng thái |
| `date` | Không | Lọc theo ngày (yyyy-MM-dd) |
| `branchId` | Không | Lọc theo chi nhánh |

**Response:** `200` — `ReceptionSlip[]`

---

#### `GET /reception-slips/{id}`

Xem chi tiết phiếu tiếp đón.

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "REC-20250322-001",
    "customerId": "C001",
    "customerName": "Nguyễn Văn A",
    "petId": "P001",
    "petName": "Miu",
    "examTypeId": "ET_CLINIC",
    "weight": 3.2,
    "description": "Bỏ ăn 2 ngày, nôn mửa",
    "note": "Tiền sử dị ứng penicillin",
    "isEmergency": false,
    "status": "RECEIVED",
    "scheduledDate": "2025-03-22T09:00:00",
    "createdAt": "2025-03-22T08:45:00",
    "createdBy": "lt001"
  }
}
```

---

#### `POST /reception-slips`

Tạo mới phiếu tiếp đón.

**Request body:**
```json
{
  "customerId": "C001",
  "petId": "P001",
  "examTypeId": "ET_CLINIC",
  "weight": 3.2,
  "description": "Bỏ ăn 2 ngày, nôn mửa",
  "note": "Tiền sử dị ứng penicillin",
  "isEmergency": false,
  "scheduledDate": "2025-03-22T09:00:00"
}
```

**Response:** `201` — `ReceptionSlip`

---

#### `PATCH /reception-slips/{id}`

Cập nhật thông tin phiếu tiếp đón.

**Request body:**
```json
{
  "weight": 3.5,
  "description": "Cập nhật: thêm tiêu chảy",
  "note": "Lưu ý thuốc kháng sinh"
}
```

**Response:** `200` — `ReceptionSlip`

---

### 5.3. Khám Lâm sàng

#### `GET /examination-slips`

Lấy danh sách phiếu khám của bác sĩ.

**Query params:**

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `status` | Không | Lọc theo trạng thái |
| `doctorId` | Không | Lọc theo bác sĩ |
| `date` | Không | Lọc theo ngày |

**Response:** `200` — `ExaminationSlip[]`

---

#### `GET /examination-slips/{id}`

Xem chi tiết phiếu khám.

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "EX-001",
    "receptionSlipId": "REC-20250322-001",
    "doctorId": "BS001",
    "doctorName": "BS. Trần Thị B",
    "petId": "P001",
    "petName": "Miu",
    "status": "ONGOING",
    "direction": null,
    "services": [],
    "createdAt": "2025-03-22T09:05:00"
  }
}
```

---

#### `PATCH /examination-slips/{id}/start`

Bắt đầu khám — chuyển trạng thái sang `ONGOING`.

**Request body:** _(không có)_

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "id": "EX-001", "status": "ONGOING" }
}
```

---

#### `GET /medicines/suggestions`

Lấy gợi ý liều dùng thuốc theo thông tin thú cưng.

**Query params:**

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `petId` | Có | ID thú cưng |
| `medicineId` | Không | Lọc theo thuốc cụ thể |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "medicine": { "id": "M012", "name": "Metronidazole", "unit": "viên" },
      "suggestedDosage": {
        "qty": 10,
        "usage": "2 lần/ngày, sau ăn",
        "durationDays": 5,
        "basis": "Dựa trên cân nặng 3.2kg"
      }
    }
  ]
}
```

---

#### `POST /examination-results`

Ghi nhận kết quả khám lâm sàng.

**Request body:**
```json
{
  "examinationSlipId": "EX-001",
  "conclusion": "Viêm dạ dày cấp tính, nghi do thức ăn nhiễm khuẩn",
  "direction": "OUTPATIENT",
  "medicines": [
    { "id": "M012", "qty": 10, "usage": "2 lần/ngày, sau ăn" },
    { "id": "M045", "qty": 5,  "usage": "1 lần/ngày, buổi tối" }
  ],
  "attachments": []
}
```

> `direction` nhận một trong các giá trị: `PARACLINICAL` | `INPATIENT` | `OUTPATIENT` | `DISCHARGED`

**Response:**
```json
{
  "code": 201,
  "message": "Success",
  "data": {
    "id": "ER-001",
    "examinationSlipId": "EX-001",
    "conclusion": "Viêm dạ dày cấp tính, nghi do thức ăn nhiễm khuẩn",
    "direction": "OUTPATIENT",
    "medicines": [
      { "medicineId": "M012", "name": "Metronidazole", "qty": 10, "usage": "2 lần/ngày, sau ăn" }
    ],
    "attachments": [],
    "startTime": "2025-03-22T09:10:00",
    "endTime": "2025-03-22T09:35:00"
  }
}
```

---

#### `PATCH /examination-results/{id}`

Cập nhật kết quả lâm sàng.

**Request body:**
```json
{
  "conclusion": "Cập nhật kết luận sau xem XN",
  "direction": "INPATIENT",
  "medicines": [],
  "attachments": ["https://storage/file.jpg"]
}
```

**Response:** `200` — `ExaminationResult`

---

#### `GET /pets/{id}/history`

Xem lịch sử khám của thú cưng.

**Query params:** `page`, `limit`

**Response:** `200` — `ExaminationSlip[]`

---

### 5.4. Khám Cận lâm sàng

#### `GET /services`

Lấy danh sách dịch vụ.

**Query params:**

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `type` | Không | `PARACLINICAL` \| `GROOMING` \| ... |
| `keyword` | Không | Tìm theo tên dịch vụ |

**Response:** `200` — `Service[]`

---

#### `GET /technicians`

Lấy danh sách kỹ thuật viên.

**Query params:**

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `branchId` | Không | Lọc theo chi nhánh |
| `available` | Không | `true` — chỉ lấy người đang rảnh |

**Response:** `200` — `Technician[]`

---

#### `POST /service-orders`

Bác sĩ chỉ định dịch vụ CLS.

**Request body:**
```json
{
  "examinationSlipId": "EX-001",
  "items": [
    { "serviceId": "SV_BLOOD_TEST", "technicianId": "KTV001" },
    { "serviceId": "SV_XRAY",       "technicianId": "KTV002" }
  ]
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Success",
  "data": {
    "id": "SO-003",
    "examinationSlipId": "EX-001",
    "items": [
      { "id": "SOI-001", "serviceId": "SV_BLOOD_TEST", "technicianId": "KTV001", "status": "PENDING" },
      { "id": "SOI-002", "serviceId": "SV_XRAY",       "technicianId": "KTV002", "status": "PENDING" }
    ],
    "createdAt": "2025-03-22T09:38:00"
  }
}
```

---

#### `GET /service-orders`

Lấy danh sách công việc của KTV.

**Query params:**

| Param | Bắt buộc | Mô tả |
|-------|----------|-------|
| `technicianId` | Không | Lọc theo KTV |
| `status` | Không | `PENDING` \| `ONGOING` \| `DONE` |

**Response:** `200` — `ServiceOrder[]`

---

#### `PATCH /service-orders/{id}/start`

KTV bắt đầu thực hiện công việc.

**Request body:** _(không có)_

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "id": "SOI-001", "status": "ONGOING" }
}
```

---

#### `POST /service-results`

KTV ghi nhận kết quả thực hiện dịch vụ.

**Request body:**
```json
{
  "serviceOrderItemId": "SOI-001",
  "summary": "WBC: 12.5 (↑ nhẹ), RBC: bình thường, PLT: bình thường",
  "medicines": [
    { "id": "M020", "qty": 2 }
  ],
  "attachments": ["https://storage/results/blood-001.jpg"]
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Success",
  "data": {
    "id": "SR-001",
    "serviceOrderItemId": "SOI-001",
    "summary": "WBC: 12.5 (↑ nhẹ), RBC: bình thường, PLT: bình thường",
    "attachments": ["https://storage/results/blood-001.jpg"],
    "completedAt": "2025-03-22T09:55:00"
  }
}
```

---

#### `PATCH /examination-slips/{id}/conclude`

Bác sĩ kết luận sau khi xem toàn bộ kết quả CLS.

**Request body:**
```json
{
  "conclusion": "Nhiễm khuẩn đường tiêu hoá, bạch cầu tăng nhẹ",
  "direction": "OUTPATIENT",
  "addServices": []
}
```

**Response:** `200` — `ExaminationSlip` (status → `COMPLETED`)

---

### 5.5. Điều trị Nội / Ngoại trú

#### `POST /treatment-slips`

Tạo phiếu điều trị nội trú hoặc ngoại trú.

**Request body:**
```json
{
  "examinationSlipId": "EX-001",
  "type": "OUTPATIENT",
  "plan": "Điều trị ngoại trú 5 ngày, tái khám ngày 27/03",
  "medicines": [
    { "id": "M012", "qty": 10, "usage": "2 lần/ngày, sau ăn" }
  ],
  "services": []
}
```

> `type` nhận `INPATIENT` hoặc `OUTPATIENT`

**Response:** `201` — `TreatmentSlip`

---

#### `GET /treatment-slips/{id}`

Xem chi tiết phiếu điều trị.

**Response:** `200` — `TreatmentSlip`

---

#### `PATCH /treatment-slips/{id}`

Cập nhật phiếu điều trị.

**Request body:**
```json
{
  "plan": "Kéo dài điều trị thêm 3 ngày",
  "medicines": [
    { "id": "M012", "qty": 15, "usage": "2 lần/ngày, sau ăn" }
  ]
}
```

**Response:** `200` — `TreatmentSlip`

---

### 5.6. Thanh toán

#### `GET /reception-slips/{id}/invoice`

Lấy chi tiết hóa đơn để lễ tân xem trước khi thanh toán.

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "receptionSlipId": "REC-20250322-001",
    "petName": "Miu",
    "customerName": "Nguyễn Văn A",
    "items": [
      { "type": "SERVICE", "name": "Khám lâm sàng",    "qty": 1, "unitPrice": 150000, "total": 150000 },
      { "type": "SERVICE", "name": "Xét nghiệm máu",    "qty": 1, "unitPrice": 250000, "total": 250000 },
      { "type": "MEDICINE","name": "Metronidazole 250mg","qty": 10,"unitPrice": 5000,   "total": 50000  }
    ],
    "subtotal": 450000,
    "prepaid": 0,
    "total": 450000
  }
}
```

---

#### `GET /payment-methods`

Lấy danh sách phương thức thanh toán.

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    { "id": "PM_CASH",  "name": "Tiền mặt" },
    { "id": "PM_CARD",  "name": "Thẻ ngân hàng" },
    { "id": "PM_TRANSFER", "name": "Chuyển khoản" }
  ]
}
```

---

#### `POST /invoices`

Xác nhận thanh toán và tạo hóa đơn.

**Request body:**
```json
{
  "receptionSlipId": "REC-20250322-001",
  "paymentMethodId": "PM_CASH",
  "amount": 450000,
  "note": ""
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Success",
  "data": {
    "id": "INV-20250322-001",
    "receptionSlipId": "REC-20250322-001",
    "paymentMethodId": "PM_CASH",
    "amount": 450000,
    "status": "PAID",
    "paidAt": "2025-03-22T10:20:00",
    "createdBy": "lt001"
  }
}
```

---

#### `GET /invoices/{id}`

Xem chi tiết hóa đơn.

**Response:** `200` — `Invoice`

---

#### `PATCH /invoices/{id}`

Cập nhật thông tin hóa đơn (trước khi xác nhận).

**Request body:**
```json
{
  "paymentMethodId": "PM_TRANSFER",
  "note": "Chuyển khoản Vietcombank"
}
```

**Response:** `200` — `Invoice`

---

#### `POST /prepayments`

Tạo phiếu tạm ứng.

**Request body:**
```json
{
  "receptionSlipId": "REC-20250322-001",
  "paymentMethodId": "PM_CASH",
  "amount": 200000
}
```

**Response:** `201` — `Prepayment`

---

#### `GET /prepayments`

Lấy danh sách phiếu tạm ứng.

**Query params:** `receptionSlipId`

**Response:** `200` — `Prepayment[]`

---

## 6. Lỗi chuẩn

| Code | Trường hợp |
|------|-----------|
| `400` | Thiếu trường bắt buộc, dữ liệu không hợp lệ |
| `401` | Chưa đăng nhập / token hết hạn |
| `403` | Không có quyền thực hiện thao tác này |
| `404` | Không tìm thấy tài nguyên |
| `409` | Xung đột dữ liệu (ví dụ: phiếu đã thanh toán) |
| `500` | Lỗi server nội bộ |

**Ví dụ lỗi 400:**
```json
{
  "code": 400,
  "message": "Vui lòng chọn hình thức thanh toán",
  "data": null
}
```

**Ví dụ lỗi 403:**
```json
{
  "code": 403,
  "message": "Bạn không có quyền thực hiện thao tác này",
  "data": null
}
```

---

## 7. Thiết kế ERD (Entity Relationship Diagram)

### 7.1. Chiến lược phân quyền — Inheritance Joined

Hệ thống áp dụng chiến lược **Joined Table Inheritance** (hay còn gọi là Table Per Subclass) cho nhóm người dùng. Một bảng `users` trung tâm lưu thông tin xác thực và role chung; mỗi loại người dùng cụ thể (bác sĩ, lễ tân, KTV) có bảng riêng với `user_id` là khóa chính đồng thời là khóa ngoại tham chiếu 1–1 về `users`.

```
users (bảng cha)
  ├── doctors       1─1  (user_id FK → users.id)
  ├── receptionists 1─1  (user_id FK → users.id)
  └── technicians   1─1  (user_id FK → users.id)
```

**Ưu điểm của Joined Inheritance:**
- Không dư thừa cột NULL như Single Table
- Truy vấn xác thực chỉ cần join `users` — không phụ thuộc role cụ thể
- Dễ thêm subtype mới (ví dụ: `pharmacists`) mà không ảnh hưởng schema cũ
- Tách biệt rõ nghiệp vụ từng role trong bảng riêng

---

### 7.2. Mô tả chi tiết các bảng

#### Nhóm người dùng (Inheritance Joined)

**Bảng `users`** — bảng cha, lưu thông tin xác thực chung

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | UUID |
| `username` | `VARCHAR(100)` | UNIQUE, NOT NULL | Tên đăng nhập |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Mật khẩu đã hash (BCrypt) |
| `role` | `ENUM` | NOT NULL | `DOCTOR` \| `RECEPTIONIST` \| `TECHNICIAN` |
| `branch_id` | `VARCHAR(36)` | FK → `branches.id` | Chi nhánh làm việc |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Trạng thái tài khoản |
| `created_at` | `TIMESTAMP` | NOT NULL | Thời gian tạo |
| `updated_at` | `TIMESTAMP` | NOT NULL | Thời gian cập nhật |

---

**Bảng `doctors`** — subtype bác sĩ (quan hệ 1–1 với `users`)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `user_id` | `VARCHAR(36)` | PK, FK → `users.id` | Map 1–1 với bảng cha |
| `full_name` | `VARCHAR(200)` | NOT NULL | Họ và tên |
| `phone` | `VARCHAR(15)` | | Số điện thoại |
| `specialization` | `VARCHAR(100)` | | Chuyên khoa |
| `license_number` | `VARCHAR(50)` | UNIQUE | Số chứng chỉ hành nghề |

> `user_id` vừa là **PK** vừa là **FK** — đây là đặc trưng của Joined Table Inheritance.

---

**Bảng `receptionists`** — subtype lễ tân (quan hệ 1–1 với `users`)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `user_id` | `VARCHAR(36)` | PK, FK → `users.id` | Map 1–1 với bảng cha |
| `full_name` | `VARCHAR(200)` | NOT NULL | Họ và tên |
| `phone` | `VARCHAR(15)` | | Số điện thoại |

---

**Bảng `technicians`** — subtype kỹ thuật viên (quan hệ 1–1 với `users`)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `user_id` | `VARCHAR(36)` | PK, FK → `users.id` | Map 1–1 với bảng cha |
| `full_name` | `VARCHAR(200)` | NOT NULL | Họ và tên |
| `phone` | `VARCHAR(15)` | | Số điện thoại |
| `skill_tags` | `VARCHAR(255)` | | Nhãn kỹ năng (XN máu, X-Quang...) |

---

#### Nhóm khách hàng & thú cưng

**Bảng `customers`**

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | UUID |
| `full_name` | `VARCHAR(200)` | NOT NULL | Họ và tên chủ nuôi |
| `phone` | `VARCHAR(15)` | UNIQUE, NOT NULL | Số điện thoại (dùng tìm kiếm) |
| `address` | `VARCHAR(500)` | | Địa chỉ |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

**Bảng `pets`**

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | UUID |
| `customer_id` | `VARCHAR(36)` | FK → `customers.id`, NOT NULL | Chủ nuôi |
| `name` | `VARCHAR(100)` | NOT NULL | Tên thú cưng |
| `species` | `ENUM` | NOT NULL | `DOG` \| `CAT` \| `OTHER` |
| `breed` | `VARCHAR(100)` | | Giống |
| `gender` | `ENUM` | | `MALE` \| `FEMALE` \| `UNKNOWN` |
| `dob` | `DATE` | | Ngày sinh |
| `weight` | `DECIMAL(5,2)` | | Cân nặng (kg) |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

#### Nhóm tiếp đón

**Bảng `exam_types`** — hình thức khám

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `name` | `VARCHAR(100)` | NOT NULL | Tên hình thức |
| `is_emergency` | `BOOLEAN` | DEFAULT FALSE | Có phải cấp cứu không |

---

**Bảng `reception_slips`** — phiếu tiếp đón

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `customer_id` | `VARCHAR(36)` | FK → `customers.id`, NOT NULL | |
| `pet_id` | `VARCHAR(36)` | FK → `pets.id`, NOT NULL | |
| `receptionist_id` | `VARCHAR(36)` | FK → `receptionists.user_id` | Lễ tân tạo phiếu |
| `exam_type_id` | `VARCHAR(36)` | FK → `exam_types.id` | |
| `weight` | `DECIMAL(5,2)` | | Cân nặng tại thời điểm khám |
| `description` | `TEXT` | | Mô tả triệu chứng |
| `note` | `TEXT` | | Lưu ý (dị ứng, tiền sử...) |
| `is_emergency` | `BOOLEAN` | DEFAULT FALSE | |
| `status` | `ENUM` | NOT NULL | `PENDING`\|`RECEIVED`\|`ONGOING`\|`WAITING_CONCLUSION`\|`COMPLETED`\|`PAID` |
| `scheduled_date` | `TIMESTAMP` | | Ngày hẹn khám |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

#### Nhóm khám lâm sàng

**Bảng `examination_slips`** — phiếu khám (1–1 với phiếu tiếp đón)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `reception_slip_id` | `VARCHAR(36)` | FK → `reception_slips.id`, UNIQUE | Quan hệ 1–1 |
| `doctor_id` | `VARCHAR(36)` | FK → `doctors.user_id`, NOT NULL | Bác sĩ phụ trách |
| `direction` | `ENUM` | | `PARACLINICAL`\|`INPATIENT`\|`OUTPATIENT`\|`DISCHARGED` |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

**Bảng `examination_slip_statuses`** — lịch sử trạng thái phiếu khám

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `examination_slip_id` | `VARCHAR(36)` | FK → `examination_slips.id`, NOT NULL | |
| `status` | `ENUM` | NOT NULL | Trạng thái tại thời điểm ghi nhận |
| `changed_at` | `TIMESTAMP` | NOT NULL | Thời điểm đổi trạng thái |
| `changed_by` | `VARCHAR(36)` | FK → `users.id` | Người thực hiện |

---

**Bảng `examination_results`** — kết quả khám lâm sàng (1–1 với phiếu khám)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `examination_slip_id` | `VARCHAR(36)` | FK → `examination_slips.id`, UNIQUE | Quan hệ 1–1 |
| `conclusion` | `TEXT` | | Kết luận lâm sàng |
| `attachments` | `JSON` | | Mảng URL file đính kèm |
| `started_at` | `TIMESTAMP` | | Thời điểm bắt đầu khám |
| `ended_at` | `TIMESTAMP` | | Thời điểm kết thúc khám |

---

**Bảng `prescriptions`** — đơn thuốc (nhiều dòng trên 1 phiếu khám)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `examination_slip_id` | `VARCHAR(36)` | FK → `examination_slips.id`, NOT NULL | |
| `medicine_id` | `VARCHAR(36)` | FK → `medicines.id`, NOT NULL | |
| `quantity` | `INT` | NOT NULL | Số lượng |
| `usage` | `VARCHAR(255)` | | Hướng dẫn sử dụng |

---

#### Nhóm cận lâm sàng

**Bảng `services`** — danh mục dịch vụ

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `name` | `VARCHAR(200)` | NOT NULL | Tên dịch vụ |
| `type` | `ENUM` | NOT NULL | `PARACLINICAL`\|`GROOMING`\|`SURGERY`\|`OTHER` |
| `unit_price` | `DECIMAL(15,0)` | NOT NULL | Đơn giá |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | |

---

**Bảng `service_orders`** — đơn chỉ định dịch vụ CLS (1 đơn / phiếu khám)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `examination_slip_id` | `VARCHAR(36)` | FK → `examination_slips.id`, NOT NULL | |
| `ordered_by` | `VARCHAR(36)` | FK → `doctors.user_id` | Bác sĩ chỉ định |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

**Bảng `service_order_items`** — chi tiết từng dịch vụ trong đơn (n–n giữa đơn và dịch vụ)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `service_order_id` | `VARCHAR(36)` | FK → `service_orders.id`, NOT NULL | |
| `service_id` | `VARCHAR(36)` | FK → `services.id`, NOT NULL | |
| `technician_id` | `VARCHAR(36)` | FK → `technicians.user_id` | KTV được chỉ định |
| `status` | `ENUM` | NOT NULL | `PENDING`\|`ONGOING`\|`DONE` |

---

**Bảng `service_results`** — kết quả KTV ghi nhận (1–1 với service_order_items)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `service_order_item_id` | `VARCHAR(36)` | FK → `service_order_items.id`, UNIQUE | |
| `summary` | `TEXT` | | Tóm tắt kết quả |
| `attachments` | `JSON` | | Mảng URL ảnh / file kết quả |
| `started_at` | `TIMESTAMP` | | |
| `completed_at` | `TIMESTAMP` | | |

---

#### Nhóm thuốc & vật tư

**Bảng `medicines`**

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `name` | `VARCHAR(200)` | NOT NULL | Tên thuốc / vật tư |
| `type` | `ENUM` | NOT NULL | `MEDICINE`\|`SUPPLY` |
| `unit` | `VARCHAR(50)` | | Đơn vị (viên, lọ, gói...) |
| `unit_price` | `DECIMAL(15,0)` | | Giá bán |
| `stock_qty` | `INT` | DEFAULT 0 | Tồn kho |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | |

---

**Bảng `medicine_dosage_references`** — liều dùng tham khảo

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `medicine_id` | `VARCHAR(36)` | FK → `medicines.id`, NOT NULL | |
| `species` | `ENUM` | | `DOG`\|`CAT`\|`OTHER` |
| `weight_min` | `DECIMAL(5,2)` | | Cân nặng tối thiểu (kg) |
| `weight_max` | `DECIMAL(5,2)` | | Cân nặng tối đa (kg) |
| `qty_per_dose` | `DECIMAL(8,2)` | | Lượng mỗi lần dùng |
| `dose_unit` | `VARCHAR(50)` | | Đơn vị liều |
| `times_per_day` | `INT` | | Số lần dùng / ngày |
| `duration_days` | `INT` | | Số ngày điều trị |

---

#### Nhóm điều trị

**Bảng `treatment_slips`** — phiếu điều trị nội / ngoại trú

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `examination_slip_id` | `VARCHAR(36)` | FK → `examination_slips.id`, NOT NULL | |
| `type` | `ENUM` | NOT NULL | `INPATIENT`\|`OUTPATIENT` |
| `plan` | `TEXT` | | Phác đồ điều trị |
| `created_by` | `VARCHAR(36)` | FK → `doctors.user_id` | |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

**Bảng `treatment_medicines`** — thuốc trong phiếu điều trị

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `treatment_slip_id` | `VARCHAR(36)` | FK → `treatment_slips.id`, NOT NULL | |
| `medicine_id` | `VARCHAR(36)` | FK → `medicines.id`, NOT NULL | |
| `quantity` | `INT` | NOT NULL | |
| `usage` | `VARCHAR(255)` | | |

---

#### Nhóm thanh toán

**Bảng `payment_methods`**

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `name` | `VARCHAR(100)` | NOT NULL | Tiền mặt, Thẻ, Chuyển khoản... |

---

**Bảng `invoices`** — hóa đơn thanh toán (1–1 với phiếu tiếp đón)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `reception_slip_id` | `VARCHAR(36)` | FK → `reception_slips.id`, UNIQUE | Quan hệ 1–1 |
| `receptionist_id` | `VARCHAR(36)` | FK → `receptionists.user_id` | Lễ tân lập hóa đơn |
| `payment_method_id` | `VARCHAR(36)` | FK → `payment_methods.id` | |
| `total_amount` | `DECIMAL(15,0)` | NOT NULL | Tổng tiền |
| `status` | `ENUM` | NOT NULL | `PENDING`\|`PAID` |
| `paid_at` | `TIMESTAMP` | | Thời điểm thanh toán |
| `note` | `VARCHAR(500)` | | |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

**Bảng `prepayments`** — phiếu tạm ứng

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `reception_slip_id` | `VARCHAR(36)` | FK → `reception_slips.id`, NOT NULL | |
| `receptionist_id` | `VARCHAR(36)` | FK → `receptionists.user_id` | |
| `payment_method_id` | `VARCHAR(36)` | FK → `payment_methods.id` | |
| `amount` | `DECIMAL(15,0)` | NOT NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

#### Bảng phụ trợ

**Bảng `branches`** — chi nhánh bệnh viện

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `name` | `VARCHAR(200)` | NOT NULL | Tên chi nhánh |
| `address` | `VARCHAR(500)` | | Địa chỉ |
| `phone` | `VARCHAR(15)` | | |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | |

---

**Bảng `directions`** — danh mục hướng xử trí (lookup)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `VARCHAR(36)` | PK | |
| `code` | `ENUM` | UNIQUE | `PARACLINICAL`\|`INPATIENT`\|`OUTPATIENT`\|`DISCHARGED` |
| `label` | `VARCHAR(100)` | | Nhãn hiển thị |

---

### 7.3. Sơ đồ quan hệ tổng quát (ERD dạng text)

```
branches
  └── users (branch_id FK)
        ├── doctors       (user_id PK=FK, 1─1)
        ├── receptionists (user_id PK=FK, 1─1)
        └── technicians   (user_id PK=FK, 1─1)

customers
  └── pets (customer_id FK, 1─n)

receptionists ──(creates)──> reception_slips
customers     ──(has)──────> reception_slips
pets          ──(belongs to)> reception_slips
exam_types    ──(applied to)> reception_slips

reception_slips
  └── examination_slips (reception_slip_id FK UNIQUE, 1─1)
        ├── examination_slip_statuses (examination_slip_id FK, 1─n)
        ├── examination_results       (examination_slip_id FK UNIQUE, 1─1)
        │     └── [attachments JSON]
        ├── prescriptions             (examination_slip_id FK, 1─n)
        │     └── medicines FK
        ├── treatment_slips           (examination_slip_id FK, 1─n)
        │     └── treatment_medicines (treatment_slip_id FK, 1─n)
        │           └── medicines FK
        └── service_orders            (examination_slip_id FK, 1─1)
              └── service_order_items (service_order_id FK, 1─n)
                    ├── services FK
                    ├── technicians FK
                    └── service_results (service_order_item_id FK UNIQUE, 1─1)

reception_slips
  └── invoices    (reception_slip_id FK UNIQUE, 1─1)
  └── prepayments (reception_slip_id FK, 1─n)

medicines
  └── medicine_dosage_references (medicine_id FK, 1─n)
```

---

### 7.4. Mối quan hệ trọng yếu

| Bảng A | Quan hệ | Bảng B | Ghi chú |
|--------|---------|--------|---------|
| `users` | 1–1 | `doctors` | PK của doctors = FK → users |
| `users` | 1–1 | `receptionists` | PK của receptionists = FK → users |
| `users` | 1–1 | `technicians` | PK của technicians = FK → users |
| `customers` | 1–n | `pets` | Một KH nuôi nhiều thú |
| `reception_slips` | 1–1 | `examination_slips` | Mỗi lượt khám có 1 phiếu lâm sàng |
| `examination_slips` | 1–1 | `examination_results` | Kết quả lâm sàng tương ứng |
| `examination_slips` | 1–n | `prescriptions` | Một phiếu kê nhiều thuốc |
| `examination_slips` | 1–1 | `service_orders` | Một phiếu có 1 đơn CLS |
| `service_orders` | 1–n | `service_order_items` | Một đơn chứa nhiều dịch vụ |
| `service_order_items` | 1–1 | `service_results` | Mỗi dịch vụ có 1 kết quả |
| `reception_slips` | 1–1 | `invoices` | Một lượt khám có 1 hóa đơn |
| `reception_slips` | 1–n | `prepayments` | Có thể tạm ứng nhiều lần |
| `medicines` | 1–n | `medicine_dosage_references` | Một thuốc có nhiều mức liều theo cân nặng |

---

## 8. Phân quyền theo role (Inheritance Joined)

### 8.1. Cơ chế xác thực

Khi người dùng đăng nhập, server:

1. Xác minh `phoneNumber` + `password_hash` từ bảng `users`
2. Đọc `role` từ bảng `users`
3. Join sang bảng subtype tương ứng (`doctors` / `receptionists` / `technicians`) để lấy thông tin chi tiết
4. Ký JWT chứa `{ userId, role, branchId }`

```
POST /auth/public/login
Request:  { "phoneNumber": "0901000000", "password": "123456" }
Response: { "code": 200, "data": { "accessToken": "<jwt>", "role": "DOCTOR", "fullName": "BS. Trần Thị B" } }
```

Mọi request tiếp theo gửi kèm header:
```
Authorization: Bearer <accessToken>
```

---

### 8.2. Truy vấn thông tin người dùng theo Joined Strategy

Khi cần lấy đầy đủ thông tin một người dùng, server thực hiện JOIN:

```sql
-- Lấy thông tin bác sĩ đầy đủ
SELECT u.id, u.username, u.role, u.branch_id,
       d.full_name, d.phone, d.specialization, d.license_number
FROM users u
INNER JOIN doctors d ON d.user_id = u.id
WHERE u.id = :userId AND u.role = 'DOCTOR';

-- Lấy thông tin lễ tân đầy đủ
SELECT u.id, u.username, u.role, u.branch_id,
       r.full_name, r.phone
FROM users u
INNER JOIN receptionists r ON r.user_id = u.id
WHERE u.id = :userId AND u.role = 'RECEPTIONIST';
```

---

### 8.3. Ma trận phân quyền endpoint

| Endpoint nhóm | RECEPTIONIST | DOCTOR | TECHNICIAN |
|---------------|:---:|:---:|:---:|
| `GET /customers` | ✅ | ✅ | — |
| `POST /customers` | ✅ | — | — |
| `GET /customers/{id}/pets` | ✅ | ✅ | — |
| `POST /pets` | ✅ | — | — |
| `GET /reception-slips` | ✅ | Chỉ GET | — |
| `POST /reception-slips` | ✅ | — | — |
| `PATCH /reception-slips/{id}` | ✅ | — | — |
| `GET /examination-slips` | — | ✅ | — |
| `PATCH /examination-slips/{id}/start` | — | ✅ | — |
| `PATCH /examination-slips/{id}/conclude` | — | ✅ | — |
| `POST /examination-results` | — | ✅ | — |
| `PATCH /examination-results/{id}` | — | ✅ | — |
| `GET /medicines/suggestions` | — | ✅ | — |
| `GET /services` | — | ✅ | ✅ |
| `GET /technicians` | — | ✅ | — |
| `POST /service-orders` | — | ✅ | — |
| `GET /service-orders` | — | Chỉ GET | ✅ |
| `PATCH /service-orders/{id}/start` | — | — | ✅ |
| `POST /service-results` | — | — | ✅ |
| `GET /service-results` | — | ✅ | ✅ |
| `POST /treatment-slips` | — | ✅ | — |
| `PATCH /treatment-slips/{id}` | — | ✅ | — |
| `GET /reception-slips/{id}/invoice` | ✅ | — | — |
| `GET /payment-methods` | ✅ | — | — |
| `POST /invoices` | ✅ | — | — |
| `POST /prepayments` | ✅ | — | — |
| `POST /uploads` | ✅ | ✅ | ✅ |

> KTV chỉ được thao tác trên `service-orders` và `service-results` của **chính mình** (`technician_id = currentUserId`). Server kiểm tra điều kiện này sau khi xác thực role.

---

## 9. Realtime — WebSocket

Endpoint: `WS /ws/notifications?token=<jwt>`

| Event | Gửi đến | Trigger |
|-------|---------|---------|
| `RECEPTION_SLIP_CREATED` | Bác sĩ | Lễ tân tạo phiếu tiếp đón |
| `SERVICE_ORDER_ASSIGNED` | KTV | Bác sĩ chỉ định dịch vụ CLS |
| `SERVICE_ORDER_COMPLETED` | Bác sĩ | Tất cả CLS của phiếu hoàn thành |
| `EXAMINATION_COMPLETED` | Lễ tân | Bác sĩ kết luận xong |
| `PAYMENT_COMPLETED` | Bác sĩ / KTV | Lễ tân xác nhận thanh toán |

**Payload mẫu:**
```json
{
  "event": "SERVICE_ORDER_ASSIGNED",
  "payload": {
    "serviceOrderId": "SO-003",
    "serviceName": "Xét nghiệm máu",
    "petName": "Miu",
    "assignedBy": "BS. Trần Thị B"
  },
  "timestamp": "2025-03-22T09:38:00"
}
```

---

## 10. Upload file

#### `POST /uploads`

Upload ảnh kết quả xét nghiệm.

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `file` | File | File ảnh (.jpg, .png, .pdf) |
| `context` | String | `SERVICE_RESULT` \| `EXAM_RESULT` |

**Response:**
```json
{
  "code": 201,
  "message": "Success",
  "data": {
    "url": "https://storage.petical.vn/results/uuid-file.jpg",
    "fileName": "blood-test-001.jpg",
    "size": 204800
  }
}
```

> URL này được dùng trong `attachments[]` khi gọi `POST /service-results` hoặc `POST /examination-results`.

---

## 11. Dữ liệu test nhanh (theo `DataSeeder`)

### 11.1. Điều kiện seed

- Chạy profile `dev`.
- `app.seed.mock.enabled=true` (mặc định đang bật).
- Seeder chỉ chạy khi DB chưa có dữ liệu `clients` hoặc `doctors`.

### 11.2. Tài khoản đăng nhập mẫu

- Mật khẩu chung cho user seed: `123456`.
- Bác sĩ: `0901000000` → `0901000019`.
- Lễ tân: `0902000000` → `0902000019`.
- KTV: `0903000000` → `0903000019`.

Ví dụ login:

```json
{
  "phoneNumber": "0901000000",
  "password": "123456"
}
```

### 11.3. Dữ liệu nghiệp vụ seed để test API

- Khách hàng seed: phone `0914000000` → `0914000019`.
- Phiếu tiếp đón seed mặc định có `status = "Đã tiếp đón"`.
- Lý do khám seed: `"Khám tổng quát"`.
- Mô tả triệu chứng seed: `"Thú cưng có biểu hiện mệt, cần kiểm tra tổng quát"`.
- `examForm.isEmergency = true` với các index chia hết cho 5.

### 11.4. Gợi ý test nhanh theo luồng

1. Đăng nhập lễ tân bằng `0902000000` / `123456`.
2. Tra cứu khách hàng cũ: `GET /customers?phone=0914000000`.
3. Tạo khách hàng mới + thú cưng đầu tiên: `POST /customers` (payload ở mục 5.1).
4. Lấy danh sách thú cưng của khách: `GET /customers/{id}/pets`.
5. Tạo phiếu tiếp đón: `POST /reception-slips`.
6. Kiểm tra dashboard bác sĩ: `GET /dashboard/doctor-summary`.