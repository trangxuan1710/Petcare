package com.petical.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface SseNotificationService {
    SseEmitter subscribe(Long userId, String role);
    void sendNotificationToUser(Long userId, Object message);
    void sendNotificationToRole(String role, Object message);
}
