package com.petical.config;

import com.petical.entity.ExamResult;
import com.petical.entity.ResultFile;
import com.petical.entity.ServiceResult;
import com.petical.repository.ExamResultRepository;
import com.petical.repository.ResultFileRepository;
import com.petical.repository.ServiceResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ResultFileBackfillRunner implements ApplicationRunner {
    private final ExamResultRepository examResultRepository;
    private final ServiceResultRepository serviceResultRepository;
    private final ResultFileRepository resultFileRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        backfillExamResultFiles();
        backfillServiceResultFiles();
    }

    private void backfillExamResultFiles() {
        for (ExamResult result : examResultRepository.findAll()) {
            List<String> paths = splitEvidencePaths(result.getEvidencePath());
            if (paths.isEmpty()) {
                continue;
            }

            if (resultFileRepository.findByExamResultIdOrderByIdAsc(result.getId()).isEmpty()) {
                resultFileRepository.saveAll(paths.stream()
                        .map(path -> ResultFile.builder()
                                .examResult(result)
                                .filePath(path)
                                .originalFileName(extractFileName(path))
                                .build())
                        .toList());
            }

            result.setEvidencePath(null);
            examResultRepository.save(result);
        }
    }

    private void backfillServiceResultFiles() {
        for (ServiceResult result : serviceResultRepository.findAll()) {
            List<String> paths = splitEvidencePaths(result.getEvidencePath());
            if (paths.isEmpty()) {
                continue;
            }

            if (resultFileRepository.findByServiceResultIdOrderByIdAsc(result.getId()).isEmpty()) {
                resultFileRepository.saveAll(paths.stream()
                        .map(path -> ResultFile.builder()
                                .serviceResult(result)
                                .filePath(path)
                                .originalFileName(extractFileName(path))
                                .build())
                        .toList());
            }

            result.setEvidencePath(null);
            serviceResultRepository.save(result);
        }
    }

    private List<String> splitEvidencePaths(String rawEvidencePath) {
        if (rawEvidencePath == null || rawEvidencePath.isBlank()) {
            return List.of();
        }

        return Arrays.stream(rawEvidencePath.split(";"))
                .map(String::trim)
                .filter(path -> !path.isBlank())
                .distinct()
                .toList();
    }

    private String extractFileName(String path) {
        if (path == null || path.isBlank()) {
            return null;
        }
        String normalized = path.replace("\\", "/");
        int slashIndex = normalized.lastIndexOf('/');
        return slashIndex >= 0 ? normalized.substring(slashIndex + 1) : normalized;
    }
}
