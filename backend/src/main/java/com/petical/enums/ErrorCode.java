package com.petical.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;


@Getter
public enum ErrorCode {
    SERVER_ERROR(500, "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR),
    UN_AUTHORIZED(1001, "Chưa được xác thực", HttpStatus.UNAUTHORIZED),
    PHONE_ALREADY_EXIST(1002, "Số điện thoại đã được sử dụng", HttpStatus.BAD_REQUEST),
    ERROR_INPUT(1003, "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1004, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    LOGIN_FAIL(1005, "Số điện thoại hoặc mật khẩu không đúng", HttpStatus.NOT_FOUND),
    NO_PERMISSION(1006, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND(1007, "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    CLIENT_NOT_FOUND(1008, "Không tìm thấy khách hàng", HttpStatus.NOT_FOUND),
    PET_NOT_FOUND(1009, "Không tìm thấy thú cưng", HttpStatus.NOT_FOUND),
    RECEPTIONIST_NOT_FOUND(1010, "Không tìm thấy lễ tân", HttpStatus.NOT_FOUND),
    PET_NOT_BELONG_TO_CLIENT(1011, "Thú cưng không thuộc về khách hàng này", HttpStatus.BAD_REQUEST),
    RECEPTION_ALREADY_OPEN(1020, "Đã tồn tại hồ sơ tiếp nhận đang mở cho thú cưng này", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_BODY(1012, "Nội dung request không hợp lệ", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED(1013, "Phương thức không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),
    API_NOT_FOUND(1014, "Không tìm thấy API", HttpStatus.NOT_FOUND),
    MISSING_REQUEST_PARAM(1015, "Thiếu tham số bắt buộc", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_PARAM(1016, "Tham số không hợp lệ", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_ERROR(1017, "Vi phạm toàn vẹn dữ liệu", HttpStatus.CONFLICT),

    ;
    private int code;
    private String message;
    private HttpStatus status;
    ErrorCode(int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
