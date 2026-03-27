package com.petical.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;

@Configuration
public class ScheduleConfig {

    @Bean
    public ScheduledExecutorService  scheduledExecutorService() {
        return new ScheduledThreadPoolExecutor(10);
    }
}
