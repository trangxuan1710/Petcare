package com.petical.service;

import com.petical.dto.response.TechnicianAssignedServiceListResponse;
import com.petical.enums.TechnicianServiceTaskStatus;

public interface TechnicianWorkService {
    TechnicianAssignedServiceListResponse getAssignedServices(long technicianId, TechnicianServiceTaskStatus status, String keyword);

    TechnicianAssignedServiceListResponse getMyAssignedServices(TechnicianServiceTaskStatus status, String keyword);
}
