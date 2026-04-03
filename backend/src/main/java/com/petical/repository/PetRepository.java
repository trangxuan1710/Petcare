package com.petical.repository;

import com.petical.entity.Client;
import com.petical.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    boolean existsByIdAndClientId(long id, long clientId);
    @Query("select p from Pet p where p.client.id = :clientId")
    List<Pet> findByClientId(Long clientId);
}
