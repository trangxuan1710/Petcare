package com.petical.service;

import com.petical.dto.request.CreateClientRequest;
import com.petical.dto.request.CreatePetRequest;
import com.petical.dto.response.ClientResponse;
import com.petical.entity.Client;
import com.petical.entity.Pet;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ClientService {
    Client findByPhone(String phone);
    Client createCustomerEntity(CreateClientRequest client);
    List<ClientResponse> searchClient(String keyword);
    List<Pet> getPetsByCustomerId(long clientId);
}
