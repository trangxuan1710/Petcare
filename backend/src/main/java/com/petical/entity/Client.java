package com.petical.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clients")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String fullName;
    @Column(unique = true, nullable = false)
    private String phoneNumber;
    private String address;

    @Transient
    private Pet pet;

}
