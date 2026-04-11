package com.petical.dto.response;

import com.petical.entity.Pet;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@Schema(name = "PetResponse", description = "Thông tin thú cưng kèm trạng thái đã từng khám hay chưa")
public class PetResponse {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private LocalDate dateOfBirth;
    private boolean hasHistory;

    public static PetResponse fromEntity(Pet pet, boolean hasHistory) {
        if (pet == null) return null;
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .dateOfBirth(pet.getDateOfBirth())
                .hasHistory(hasHistory)
                .build();
    }
}
