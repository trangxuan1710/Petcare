package com.petical.service;

import com.petical.entity.Client;
import com.petical.entity.Pet;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ClientService {
    Client findByPhone(String phone);
    Client createCustomerEntity(Client client);
    List<Client> searchClient(String keyword);
    List<Pet> getPetsByCustomerId(long clientId);
    Pet createPetEntity(Pet pet);
}
