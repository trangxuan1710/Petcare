package com.petical.service;

import com.petical.dto.request.SaveParaclinicalServicesRequest;
import com.petical.dto.response.ParaclinicalSelectedServiceResponse;
import com.petical.dto.response.ParaclinicalServiceOptionResponse;
import com.petical.dto.response.SaveParaclinicalServicesResponse;
import com.petical.dto.response.TechnicianOptionResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ParaclinicalService {
    List<TechnicianOptionResponse> searchTechnicians(String keyword, Integer limit);

    List<ParaclinicalServiceOptionResponse> searchServices(String keyword, Integer limit);

    SaveParaclinicalServicesResponse saveSelectedServices(long receptionRecordId, SaveParaclinicalServicesRequest request);

    List<ParaclinicalSelectedServiceResponse> getSelectedServices(long receptionRecordId);
}
