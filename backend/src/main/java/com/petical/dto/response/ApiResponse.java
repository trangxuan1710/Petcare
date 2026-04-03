package com.petical.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(name = "ApiResponse", description = "Response chuẩn cho mọi API")
public class ApiResponse<T> {
    @Builder.Default
    @Schema(description = "Mã kết quả", example = "200")
    private int code = 200;
    @Builder.Default
    @Schema(description = "Thông điệp", example = "Success")
    private String message = "Success";
    @Schema(description = "Dữ liệu trả về")
    private T data;
}
