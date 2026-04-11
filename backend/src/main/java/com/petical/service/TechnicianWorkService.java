package com.petical.service;

import com.petical.dto.request.TechnicianRecordServiceResultRequest;
import com.petical.dto.response.TechnicianAssignedServiceListResponse;
import com.petical.dto.response.TechnicianServiceTaskDetailResponse;
import com.petical.enums.TechnicianServiceTaskStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TechnicianWorkService {
    TechnicianAssignedServiceListResponse getAssignedServices(long technicianId, TechnicianServiceTaskStatus status, String keyword);

    TechnicianAssignedServiceListResponse getMyAssignedServices(TechnicianServiceTaskStatus status, String keyword);

    TechnicianServiceTaskDetailResponse getMyAssignedServiceDetail(long serviceOrderId);

    TechnicianServiceTaskDetailResponse startMyAssignedService(long serviceOrderId);

    TechnicianServiceTaskDetailResponse recordMyAssignedServiceResult(
            long serviceOrderId,
            TechnicianRecordServiceResultRequest request,
            List<MultipartFile> images
    );
}
