package com.petical.service;

import com.petical.dto.request.CreatePetRequest;
import com.petical.dto.response.PetExamHistoryResponse;
import com.petical.entity.Pet;
import org.springframework.stereotype.Service;

@Service
public interface PetService {
    Pet createPet(CreatePetRequest pet);
    PetExamHistoryResponse getExamHistory(long petId);
}
