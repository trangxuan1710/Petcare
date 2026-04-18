package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(name = "PrescriptionAutofillContextRequest", description = "Ngữ cảnh gợi ý đơn thuốc theo loài và cân nặng")
public class PrescriptionAutofillContextRequest {
    @Schema(example = "1", description = "ID thuốc cần lấy đúng 1 liều gợi ý phù hợp")
    private Long medicineId;

    @Schema(example = "1", description = "ID loài trong bảng pet_species")
    private Long speciesId;

    @Schema(example = "cho", description = "Loài thú cưng: cho/meo/dog/cat...")
    private String species;

    @Schema(example = "4.0", description = "Cân nặng hiện tại (kg)")
    private BigDecimal weight;
}
