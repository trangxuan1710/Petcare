package com.petical.entity;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

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

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "box_price")
    private BigDecimal boxPrice;

    private BigDecimal price;

    private String type;
}
