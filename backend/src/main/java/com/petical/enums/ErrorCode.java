package com.petical.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;


@Getter
public enum ErrorCode {
    SERVER_ERROR(500, "Server Error", HttpStatus.INTERNAL_SERVER_ERROR),
    UN_AUTHORIZED(1001, "Unauthorized", HttpStatus.UNAUTHORIZED),
    PHONE_ALREADY_EXIST(1002, "phone number is used", HttpStatus.BAD_REQUEST),
    ERROR_INPUT(1003, "Error input", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1004, "User not found", HttpStatus.NOT_FOUND),
    LOGIN_FAIL(1005, "email or password is incorrect", HttpStatus.NOT_FOUND),
    NO_PERMISSION(1006, "You don't have permission", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND(1007, "Resource not found", HttpStatus.NOT_FOUND),
    CLIENT_NOT_FOUND(1008, "Client not found", HttpStatus.NOT_FOUND),
    PET_NOT_FOUND(1009, "Pet not found", HttpStatus.NOT_FOUND),
    RECEPTIONIST_NOT_FOUND(1010, "Receptionist not found", HttpStatus.NOT_FOUND),
    PET_NOT_BELONG_TO_CLIENT(1011, "Pet does not belong to client", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_BODY(1012, "Invalid request body", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED(1013, "Method not allowed", HttpStatus.METHOD_NOT_ALLOWED),
    API_NOT_FOUND(1014, "API not found", HttpStatus.NOT_FOUND),
    MISSING_REQUEST_PARAM(1015, "Missing request parameter", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_PARAM(1016, "Invalid request parameter", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_ERROR(1017, "Data integrity violation", HttpStatus.CONFLICT),

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
