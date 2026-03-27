package com.petical.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DosageReference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String timing;

    private int quantity;

    private String unit;
}
