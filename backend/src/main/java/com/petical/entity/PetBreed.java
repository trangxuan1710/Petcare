package com.petical.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "pet_breeds",
        uniqueConstraints = @UniqueConstraint(name = "uk_pet_breed_species_name", columnNames = {"species_id", "name"}),
        indexes = @Index(name = "idx_pet_breeds_species", columnList = "species_id")
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetBreed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id", nullable = false)
    private PetSpecies species;

    @Column(nullable = false)
    private String name;

    private boolean active;

    private int sortOrder;
}
