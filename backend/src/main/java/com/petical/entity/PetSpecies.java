package com.petical.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(
        name = "pet_species",
        uniqueConstraints = @UniqueConstraint(name = "uk_pet_species_code", columnNames = "code")
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetSpecies {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    private boolean active;

    private int sortOrder;

    @JsonIgnore
    @OneToMany(mappedBy = "species")
    @Builder.Default
    private Set<MedicineSpecies> medicineSpeciesLinks = new LinkedHashSet<>();
}
