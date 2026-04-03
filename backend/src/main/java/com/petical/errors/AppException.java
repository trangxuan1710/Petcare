package com.petical.errors;


//import com.demo.enums.ErrorCode;

import com.petical.enums.ErrorCode;
import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
//    private ErrorCode errorCode;
    private ErrorCode err;

    public AppException(ErrorCode err) {
        super(err.getMessage());
        this.err = err;
    }
}
