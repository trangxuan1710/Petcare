package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Schema(name = "SaveParaclinicalServicesRequest", description = "Payload lưu danh sách dịch vụ cận lâm sàng đã chọn")
public class SaveParaclinicalServicesRequest {
    @Valid
    @NotEmpty
    @Schema(description = "Danh sách dịch vụ đã chọn")
    private List<ParaclinicalServiceSelectionItemRequest> items;
}
