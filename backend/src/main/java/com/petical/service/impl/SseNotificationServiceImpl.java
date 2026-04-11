package com.petical.service.impl;

import com.petical.dto.response.NotificationMessage;
import com.petical.entity.Notification;
import com.petical.repository.NotificationRepository;
import com.petical.service.SseNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
@RequiredArgsConstructor
public class SseNotificationServiceImpl implements SseNotificationService {

    private final Map<Long, List<SseEmitter>> userEmittersMap = new ConcurrentHashMap<>();
    private final Map<String, List<SseEmitter>> roleEmittersMap = new ConcurrentHashMap<>();
    
    private final NotificationRepository notificationRepository;

    @Override
    public SseEmitter subscribe(Long userId, String role) {
        // Create an SseEmitter with a timeout. 0 or -1 means no timeout (or container default).
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1 hour

        userEmittersMap.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        if (role != null) {
            roleEmittersMap.computeIfAbsent(role, k -> new CopyOnWriteArrayList<>()).add(emitter);
        }

        Runnable onCompletionOrTimeout = () -> {
            List<SseEmitter> uEmitters = userEmittersMap.get(userId);
            if (uEmitters != null) {
                uEmitters.remove(emitter);
            }
            if (role != null) {
                List<SseEmitter> rEmitters = roleEmittersMap.get(role);
                if (rEmitters != null) {
                    rEmitters.remove(emitter);
                }
            }
        };

        emitter.onCompletion(onCompletionOrTimeout);
        emitter.onTimeout(onCompletionOrTimeout);
        emitter.onError(e -> onCompletionOrTimeout.run());

        try {
            // Send an initial event so the client knows it's connected
            emitter.send(SseEmitter.event().name("INIT").data("Connected successfully"));
        } catch (IOException e) {
            log.warn("Error sending init event for user {}", userId);
            onCompletionOrTimeout.run();
        }

        return emitter;
    }

    @Override
    public void sendNotificationToUser(Long userId, Object message) {
        if (message instanceof NotificationMessage msg) {
            Notification notification = Notification.builder()
                    .title(msg.getTitle())
                    .message(msg.getMessage())
                    .link(msg.getLink())
                    .type(msg.getType())
                    .targetUserId(userId)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }

        List<SseEmitter> emitters = userEmittersMap.get(userId);
        if (emitters != null) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("notification")
                            .data(message));
                } catch (IOException e) {
                    deadEmitters.add(emitter);
                }
            }
            emitters.removeAll(deadEmitters);
        }
    }

    @Override
    public void sendNotificationToRole(String role, Object message) {
        if (message instanceof NotificationMessage msg) {
            Notification notification = Notification.builder()
                    .title(msg.getTitle())
                    .message(msg.getMessage())
                    .link(msg.getLink())
                    .type(msg.getType())
                    .targetRole(role)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }

        List<SseEmitter> emitters = roleEmittersMap.get(role);
        if (emitters != null) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("notification")
                            .data(message));
                } catch (IOException e) {
                    deadEmitters.add(emitter);
                }
            }
            emitters.removeAll(deadEmitters);
        }
    }
}
