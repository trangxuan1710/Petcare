package com.petical.service;

import java.time.LocalDate;
import java.util.Map;

public interface DashboardService {
    Map<String, Long> getDoctorSummary(LocalDate date);
}
