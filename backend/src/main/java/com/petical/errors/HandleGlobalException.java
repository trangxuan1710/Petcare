package com.petical.errors;


import com.petical.dto.response.ApiResponse;
import com.petical.enums.ErrorCode;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

@Slf4j
@RestControllerAdvice
public class HandleGlobalException {



    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handle(AppException e) {
        ErrorCode err  = e.getErr();
        log.error("AppException: {}", err.getMessage());
        return buildResponse(err, err.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handle(MethodArgumentNotValidException e) {
        ErrorCode err = ErrorCode.ERROR_INPUT;
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + " " + fieldError.getDefaultMessage())
                .findFirst()
                .map(detail -> err.getMessage() + ": " + detail)
                .orElse(err.getMessage());
        return buildResponse(err, message);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(NoHandlerFoundException e) {
        return buildResponse(ErrorCode.API_NOT_FOUND, ErrorCode.API_NOT_FOUND.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleSerializeInput(HttpMessageNotReadableException e) {
        log.error("Invalid request body", e);
        return buildResponse(ErrorCode.INVALID_REQUEST_BODY, ErrorCode.INVALID_REQUEST_BODY.getMessage());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodNotExits(HttpRequestMethodNotSupportedException e) {
        return buildResponse(ErrorCode.METHOD_NOT_ALLOWED, ErrorCode.METHOD_NOT_ALLOWED.getMessage());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<?>> handleMissingRequestParam(MissingServletRequestParameterException e) {
        String message = ErrorCode.MISSING_REQUEST_PARAM.getMessage() + ": " + e.getParameterName();
        return buildResponse(ErrorCode.MISSING_REQUEST_PARAM, message);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<?>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        String message = ErrorCode.INVALID_REQUEST_PARAM.getMessage() + ": " + e.getName();
        return buildResponse(ErrorCode.INVALID_REQUEST_PARAM, message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleConstraintViolation(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .findFirst()
                .map(v -> ErrorCode.ERROR_INPUT.getMessage() + ": " + v.getMessage())
                .orElse(ErrorCode.ERROR_INPUT.getMessage());
        return buildResponse(ErrorCode.ERROR_INPUT, message);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException e) {
        return buildResponse(ErrorCode.NO_PERMISSION, ErrorCode.NO_PERMISSION.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrity(DataIntegrityViolationException e) {
        log.error("Data integrity violation", e);
        return buildResponse(ErrorCode.DATA_INTEGRITY_ERROR, ErrorCode.DATA_INTEGRITY_ERROR.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleUnexpectedException(Exception e) {
        log.error("Unhandled exception", e);
        return buildResponse(ErrorCode.SERVER_ERROR, ErrorCode.SERVER_ERROR.getMessage());
    }

    private ResponseEntity<ApiResponse<?>> buildResponse(ErrorCode errorCode, String message) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(message)
                .build();
        return new ResponseEntity<>(response, errorCode.getStatus());
        }

}
