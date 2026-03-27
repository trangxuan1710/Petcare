package com.petical.repository;

import com.petical.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    boolean existsByPhoneNumber(String phoneNumber);

    Optional<Client> findByPhoneNumber(String phoneNumber);

    List<Client> findByPhoneNumberLike(String s);
}
