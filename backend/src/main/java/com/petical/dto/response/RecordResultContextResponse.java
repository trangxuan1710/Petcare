package com.petical.dto.response;

import com.petical.entity.ReceptionRecord;
import com.petical.entity.TreatmentSlip;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class RecordResultContextResponse {
    private long receptionRecordId;
    private ReceptionRecord reception;
    private TreatmentSlip treatmentSlip;
    private List<ParaclinicalSelectedServiceResponse> selectedParaclinicalServices;
    private List<ReceptionAssignedServiceResponse> assignedServices;
}
