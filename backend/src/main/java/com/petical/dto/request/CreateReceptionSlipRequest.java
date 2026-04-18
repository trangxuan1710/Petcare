package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "CreateReceptionSlipRequest", description = "Payload tao moi phieu tiep don")
public class CreateReceptionSlipRequest {
    @NotNull
    @Schema(description = "Ma khach hang", example = "1")
    private Long clientId;

    @NotNull
    @Schema(description = "Ma thu cung", example = "2")
    private Long petId;

    @NotNull
    @Schema(description = "Ma le tan", example = "3")
    private Long receptionistId;

    @NotNull
    @Schema(description = "Ma bac si phu trach", example = "4")
    private Long doctorId;

    @Schema(description = "Ma form kham co san (neu tai su dung)", example = "10")
    private Long examFormId;

    @NotBlank
    @Schema(description = "Ly do kham", example = "Bo an, met")
    private String examReason;

    @Schema(description = "Luu y them", example = "Kho tiep can, can giu nhe")
    private String note;

    @NotNull
    @Schema(description = "Can nang (kg)", example = "4.2")
    private BigDecimal weight;

    @Schema(description = "Id option loai kham", example = "1")
    private Long examTypeOptionId;

    @Schema(description = "Ma loai kham (backward-compatible)", example = "khammoi")
    private String examType;

    @Schema(description = "Danh dau ca cap cuu", example = "false")
    private Boolean emergency;

    @Schema(description = "Thoi diem tiep don, de trong se lay thoi gian he thong", example = "2026-03-31T09:30:00")
    private LocalDateTime receptionTime;
}
