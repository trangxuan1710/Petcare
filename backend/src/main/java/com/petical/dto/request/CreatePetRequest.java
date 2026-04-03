package com.petical.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreatePetRequest {
    private String name;
    private String species;
    private String breed;
    private LocalDate dateOfBirth;
    private long clientId;
}
