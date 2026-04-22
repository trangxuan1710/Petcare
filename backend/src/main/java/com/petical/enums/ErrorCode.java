package com.petical.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    SERVER_ERROR(500, "Loi he thong", HttpStatus.INTERNAL_SERVER_ERROR),
    UN_AUTHORIZED(1001, "Chua duoc xac thuc", HttpStatus.UNAUTHORIZED),
    PHONE_ALREADY_EXIST(1002, "So dien thoai da duoc su dung", HttpStatus.BAD_REQUEST),
    ERROR_INPUT(1003, "Du lieu dau vao khong hop le", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1004, "Khong tim thay nguoi dung", HttpStatus.NOT_FOUND),
    LOGIN_FAIL(1005, "So dien thoai hoac mat khau khong dung", HttpStatus.NOT_FOUND),
    NO_PERMISSION(1006, "Ban khong co quyen thuc hien thao tac nay", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND(1007, "Khong tim thay tai nguyen", HttpStatus.NOT_FOUND),
    CLIENT_NOT_FOUND(1008, "Khong tim thay khach hang", HttpStatus.NOT_FOUND),
    PET_NOT_FOUND(1009, "Khong tim thay thu cung", HttpStatus.NOT_FOUND),
    RECEPTIONIST_NOT_FOUND(1010, "Khong tim thay le tan", HttpStatus.NOT_FOUND),
    PET_NOT_BELONG_TO_CLIENT(1011, "Thu cung khong thuoc ve khach hang nay", HttpStatus.BAD_REQUEST),
    RECEPTION_ALREADY_OPEN(1020, "Da ton tai ho so tiep nhan dang mo cho thu cung nay", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_BODY(1012, "Noi dung request khong hop le", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED(1013, "Phuong thuc khong duoc ho tro", HttpStatus.METHOD_NOT_ALLOWED),
    API_NOT_FOUND(1014, "Khong tim thay API", HttpStatus.NOT_FOUND),
    MISSING_REQUEST_PARAM(1015, "Thieu tham so bat buoc", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_PARAM(1016, "Tham so khong hop le", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_ERROR(1017, "Vi pham toan ven du lieu", HttpStatus.CONFLICT),
    RESULT_SUMMARY_NOT_CONFIRMED(1018, "Vui long xac nhan xem ket qua truoc khi ket luan", HttpStatus.CONFLICT);

    private final int code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}