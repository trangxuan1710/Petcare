package com.petical.service.impl;

import com.petical.dto.request.CreateClientRequest;
import com.petical.dto.response.ClientResponse;
import com.petical.entity.Client;
import com.petical.entity.Pet;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.ClientRepository;
import com.petical.repository.InvoiceRepository;
import com.petical.repository.PetRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.repository.projection.ClientSpentProjection;
import com.petical.repository.projection.ClientVisitCountProjection;
import com.petical.service.ClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clientRepository;
    private final PetRepository petRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final InvoiceRepository invoiceRepository;
    @Override
    @Transactional(readOnly = true)
    public Client findByPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        log.info("Searching client by phone {}", phone);

        return clientRepository.findByPhoneNumber(phone.trim()).orElse(null);
    }

    @Override
    @Transactional
    public Client createCustomerEntity(CreateClientRequest req) {
        if(clientRepository.existsByPhoneNumber(req.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXIST);
        }
        Client c = new Client();
        c.setPhoneNumber(req.getPhone());
        c.setFullName(req.getName());
        return clientRepository.save(c);
    }

    @Override
    public List<ClientResponse> searchClient(String keyword) {
        keyword = keyword.trim();
        if(keyword.isEmpty()) {
            return List.of();
        }

        List<Client> clients = clientRepository.findByPhoneNumberLike(keyword+"%");
        if (clients.isEmpty()) {
            return List.of();
        }

        List<Long> clientIds = clients.stream().map(Client::getId).toList();

        Map<Long, Long> visitCountByClientId = receptionRecordRepository.countVisitsByClientIds(clientIds)
            .stream()
            .collect(Collectors.toMap(ClientVisitCountProjection::getClientId, ClientVisitCountProjection::getVisitCount));

        Map<Long, BigDecimal> totalSpentByClientId = invoiceRepository.sumTotalSpentByClientIds(clientIds)
            .stream()
            .collect(Collectors.toMap(ClientSpentProjection::getClientId, ClientSpentProjection::getTotalSpent, (left, right) -> left));

        return clients.stream()
            .map(c -> ClientResponse.builder()
                .id(c.getId())
                .name(c.getFullName())
                .phone(c.getPhoneNumber())
                .visitCount(visitCountByClientId.getOrDefault(c.getId(), 0L))
                .totalSpent(totalSpentByClientId.getOrDefault(c.getId(), BigDecimal.ZERO))
                .build())
            .toList();
    }

    @Override
    public List<Pet> getPetsByCustomerId(long clientId) {

        Client client = clientRepository.findById(clientId).orElse(null);
        if(client == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        List<Pet> pets = petRepository.findByClientId(clientId);
        return pets;
    }

}
