package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@Schema(name = "PetExamHistoryResponse", description = "Thông tin lịch sử khám/điều trị của một thú cưng")
public class PetExamHistoryResponse {
    @Schema(description = "Mã thú cưng", example = "1")
    private long petId;
    @Schema(description = "Tên thú cưng", example = "Kuro")
    private String petName;
    @Schema(description = "Loài", example = "Chó")
    private String species;
    @Schema(description = "Giống", example = "Poodle")
    private String breed;
    @Schema(description = "Danh sách mốc lịch sử khám/điều trị")
    private List<PetExamHistoryItemResponse> timeline;
}