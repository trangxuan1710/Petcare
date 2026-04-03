package com.petical.service;

import com.petical.dto.request.RecordExamResultRequest;
import com.petical.dto.response.RecordExamResultResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface ExamResultService {
    RecordExamResultResponse recordResult(long receptionRecordId, RecordExamResultRequest request, List<MultipartFile> images);
}
