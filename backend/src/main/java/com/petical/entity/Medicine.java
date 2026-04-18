package com.petical.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int stockQuantity;

    private String unit;
    @Column(name = "quantity_per_box")
    private int quantityPerBox;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;
//
//    @Column(name = "box_price")
//    private BigDecimal boxPrice;

    private String type;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "medicine", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MedicineSpecies> medicineSpeciesLinks = new LinkedHashSet<>();

    public BigDecimal getBoxPrice() {
        BigDecimal basePrice = unitPrice != null ? unitPrice : BigDecimal.ZERO;
        int perBox = quantityPerBox > 0 ? quantityPerBox : 1;
        return basePrice.multiply(BigDecimal.valueOf(perBox));
    }

    public void addSpecies(PetSpecies species) {
        if (species == null) {
            return;
        }

        boolean exists = medicineSpeciesLinks.stream().anyMatch(link ->
                link.getSpecies() != null && link.getSpecies().getId() == species.getId()
        );
        if (exists) {
            return;
        }

        MedicineSpecies link = MedicineSpecies.builder()
                .id(MedicineSpeciesId.builder()
                        .medicineId(this.id > 0 ? this.id : null)
                        .speciesId(species.getId())
                        .build())
                .medicine(this)
                .species(species)
                .build();
        medicineSpeciesLinks.add(link);
    }
}
