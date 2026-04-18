package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.LookupOptionResponse;
import com.petical.entity.ExamTypeOption;
import com.petical.entity.PetBreed;
import com.petical.entity.PetSpecies;
import com.petical.repository.ExamTypeOptionRepository;
import com.petical.repository.PetBreedRepository;
import com.petical.repository.PetSpeciesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lookups")
public class LookupController {
    private final PetSpeciesRepository petSpeciesRepository;
    private final PetBreedRepository petBreedRepository;
    private final ExamTypeOptionRepository examTypeOptionRepository;

    @GetMapping("/pet-species")
    public ApiResponse<List<LookupOptionResponse>> getPetSpecies() {
        return ApiResponse.<List<LookupOptionResponse>>builder()
                .data(petSpeciesRepository.findByActiveTrueOrderBySortOrderAscNameAsc()
                        .stream()
                        .map(this::toSpeciesOption)
                        .toList())
                .build();
    }

    @GetMapping("/pet-breeds")
    public ApiResponse<List<LookupOptionResponse>> getPetBreeds(
            @RequestParam(value = "species", required = false) String species
    ) {
        List<PetBreed> breeds = species == null || species.isBlank()
                ? petBreedRepository.findByActiveTrueOrderBySpeciesSortOrderAscSortOrderAscNameAsc()
                : petBreedRepository.findBySpeciesCodeIgnoreCaseAndActiveTrueOrderBySortOrderAscNameAsc(species.trim());

        return ApiResponse.<List<LookupOptionResponse>>builder()
                .data(breeds.stream().map(this::toBreedOption).toList())
                .build();
    }

    @GetMapping("/exam-types")
    public ApiResponse<List<LookupOptionResponse>> getExamTypes() {
        return ApiResponse.<List<LookupOptionResponse>>builder()
                .data(examTypeOptionRepository.findByActiveTrueOrderBySortOrderAscNameAsc()
                        .stream()
                        .map(this::toExamTypeOption)
                        .toList())
                .build();
    }

    @GetMapping("/medicine-species")
    public ApiResponse<List<LookupOptionResponse>> getMedicineSpecies() {
        return ApiResponse.<List<LookupOptionResponse>>builder()
                .data(petSpeciesRepository.findByActiveTrueOrderBySortOrderAscNameAsc()
                        .stream()
                        .map(this::toSpeciesOption)
                        .toList())
                .build();
    }

    @GetMapping("/medicine-objectives")
    public ApiResponse<List<LookupOptionResponse>> getMedicineObjectives() {
        return getMedicineSpecies();
    }

    private LookupOptionResponse toSpeciesOption(PetSpecies species) {
        return LookupOptionResponse.builder()
                .id(species.getId())
                .code(species.getCode())
                .name(species.getName())
                .value(species.getCode())
                .build();
    }

    private LookupOptionResponse toBreedOption(PetBreed breed) {
        return LookupOptionResponse.builder()
                .id(breed.getId())
                .code(String.valueOf(breed.getId()))
                .name(breed.getName())
                .parentCode(breed.getSpecies() == null ? null : breed.getSpecies().getCode())
                .value(breed.getName())
                .build();
    }

    private LookupOptionResponse toExamTypeOption(ExamTypeOption option) {
        return LookupOptionResponse.builder()
                .id(option.getId())
                .code(option.getCode())
                .name(option.getName())
                .value(option.getCode())
                .build();
    }
}
