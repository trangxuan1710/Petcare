package com.petical.config;

import com.petical.entity.ExamTypeOption;
import com.petical.entity.Medicine;
import com.petical.entity.PetBreed;
import com.petical.entity.PetSpecies;
import com.petical.enums.ExamType;
import com.petical.repository.ExamTypeOptionRepository;
import com.petical.repository.MedicineRepository;
import com.petical.repository.PetBreedRepository;
import com.petical.repository.PetSpeciesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LookupDataSeeder implements ApplicationRunner {
    private final PetSpeciesRepository petSpeciesRepository;
    private final PetBreedRepository petBreedRepository;
    private final ExamTypeOptionRepository examTypeOptionRepository;
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        PetSpecies dog = upsertSpecies("cho", "Chó", 1);
        PetSpecies cat = upsertSpecies("meo", "Mèo", 2);
        deactivateSpecies("khac");

        seedDogBreeds(dog);
        seedCatBreeds(cat);

        upsertExamType("khammoi", "Khám mới", ExamType.NEW_EXAM, 1);
        upsertExamType("taikham", "Tái khám", ExamType.RE_EXAM, 2);

        backfillMedicineSpecies(dog, cat);
    }

    private PetSpecies upsertSpecies(String code, String name, int sortOrder) {
        PetSpecies species = petSpeciesRepository.findByCodeIgnoreCase(code)
                .orElseGet(() -> PetSpecies.builder().code(code).build());
        species.setName(name);
        species.setActive(true);
        species.setSortOrder(sortOrder);
        return petSpeciesRepository.save(species);
    }

    private void deactivateSpecies(String code) {
        petSpeciesRepository.findByCodeIgnoreCase(code).ifPresent(species -> {
            species.setActive(false);
            petSpeciesRepository.save(species);
        });
    }

    private void seedDogBreeds(PetSpecies dog) {
        String[] breeds = {
                "Poodle",
                "Corgi",
                "Husky",
                "Golden Retriever",
                "Pug",
                "Shiba",
                "Chihuahua",
                "Labrador",
                "Phốc sóc (Pomeranian)",
                "Becgie (German Shepherd)"
        };
        for (int i = 0; i < breeds.length; i++) {
            upsertBreed(dog, breeds[i], i + 1);
        }
    }

    private void seedCatBreeds(PetSpecies cat) {
        String[] breeds = {
                "Mèo Anh lông ngắn",
                "Mèo Anh lông dài",
                "Mèo Ba Tư",
                "Mèo Xiêm",
                "Mèo Bengal",
                "Maine Coon",
                "Scottish Fold",
                "Munchkin",
                "Mèo ta",
                "Mèo Sphynx"
        };
        for (int i = 0; i < breeds.length; i++) {
            upsertBreed(cat, breeds[i], i + 1);
        }
    }

    private void upsertBreed(PetSpecies species, String name, int sortOrder) {
        PetBreed breed = petBreedRepository.findBySpeciesCodeIgnoreCaseAndNameIgnoreCase(species.getCode(), name)
                .orElseGet(() -> PetBreed.builder().species(species).name(name).build());
        breed.setSpecies(species);
        breed.setName(name);
        breed.setActive(true);
        breed.setSortOrder(sortOrder);
        petBreedRepository.save(breed);
    }

    private void upsertExamType(String code, String name, ExamType examType, int sortOrder) {
        ExamTypeOption option = examTypeOptionRepository.findByCodeIgnoreCase(code)
                .orElseGet(() -> ExamTypeOption.builder().code(code).build());
        option.setName(name);
        option.setExamType(examType);
        option.setActive(true);
        option.setSortOrder(sortOrder);
        examTypeOptionRepository.save(option);
    }

    private void backfillMedicineSpecies(PetSpecies dog, PetSpecies cat) {
        List<Medicine> medicines = medicineRepository.findAll()
                .stream()
                .filter(medicine -> medicine.getMedicineSpeciesLinks() == null || medicine.getMedicineSpeciesLinks().isEmpty())
                .toList();
        medicines.forEach(medicine -> {
            medicine.addSpecies(dog);
            medicine.addSpecies(cat);
        });
        if (!medicines.isEmpty()) {
            medicineRepository.saveAll(medicines);
        }
    }
}
