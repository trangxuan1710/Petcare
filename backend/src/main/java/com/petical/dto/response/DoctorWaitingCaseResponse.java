package com.petical.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DoctorWaitingCaseResponse {
    private long id;
    private String fullName;
    private String phoneNumber;
    private long waitingCaseCount;
}