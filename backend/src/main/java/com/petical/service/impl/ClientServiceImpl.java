package com.petical.service.impl;

import com.petical.entity.Client;
import com.petical.entity.Pet;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.ClientRepository;
import com.petical.repository.PetRepository;
import com.petical.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clientRepository;
    private final PetRepository petRepository;

    @Override
    @Transactional(readOnly = true)
    public Client findByPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        return clientRepository.findByPhoneNumber(phone.trim()).orElse(null);
    }

    @Override
    @Transactional
    public Client createCustomerEntity(Client client) {
        if (client == null || client.getPhoneNumber() == null || client.getPhoneNumber().isBlank()) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }
        if (client.getPet() == null
                || client.getPet().getName() == null || client.getPet().getName().isBlank()
                || client.getPet().getSpecies() == null || client.getPet().getSpecies().isBlank()) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }
        if (clientRepository.existsByPhoneNumber(client.getPhoneNumber())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXIST);
        }

        Client toSave = Client.builder()
                .fullName(client.getFullName())
                .phoneNumber(client.getPhoneNumber())
                .address(client.getAddress())
                .build();
        Client savedClient = clientRepository.save(toSave);

        Pet firstPet = Pet.builder()
                .client(savedClient)
                .name(client.getPet().getName())
                .species(client.getPet().getSpecies())
                .breed(client.getPet().getBreed())
                .gender(client.getPet().getGender())
                .dateOfBirth(client.getPet().getDateOfBirth())
                .weight(client.getPet().getWeight())
                .build();
        petRepository.save(firstPet);

        return savedClient;
    }

    @Override
    public List<Client> searchClient(String keyword) {
        keyword = keyword.trim();
        if(keyword.isEmpty()) {
            return List.of();
        }
        return clientRepository.findByPhoneNumberLike("%"+keyword+"%");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getPetsByCustomerId(long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new AppException(ErrorCode.CLIENT_NOT_FOUND);
        }
        return petRepository.findByClientId(clientId);
    }

    @Override
    @Transactional
    public Pet createPetEntity(Pet pet) {
        if (pet == null || pet.getClient() == null || pet.getClient().getId() <= 0) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        Client client = clientRepository.findById(pet.getClient().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CLIENT_NOT_FOUND));

        Pet toSave = Pet.builder()
                .client(client)
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .gender(pet.getGender())
                .dateOfBirth(pet.getDateOfBirth())
                .weight(pet.getWeight())
                .build();
        return petRepository.save(toSave);
    }
}
