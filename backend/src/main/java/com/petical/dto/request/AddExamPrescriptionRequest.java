package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Schema(name = "AddExamPrescriptionRequest", description = "Payload thêm đơn thuốc cho phiếu khám")
public class AddExamPrescriptionRequest {
    @Valid
    @NotEmpty
    @Schema(description = "Danh sách thuốc/vật tư kê trong đơn")
    private List<AddExamPrescriptionItemRequest> items;
}
