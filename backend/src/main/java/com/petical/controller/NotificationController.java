package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.entity.Notification;
import com.petical.entity.User;
import com.petical.repository.NotificationRepository;
import com.petical.service.SseNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping({"/notifications", "/v1/notifications"})
@RequiredArgsConstructor
public class NotificationController {

    private final SseNotificationService sseNotificationService;
    private final NotificationRepository notificationRepository;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal User user) {
        String role = user.getRole() != null ? user.getRole() : null;
        return sseNotificationService.subscribe(user.getId(), role);
    }

    @GetMapping("/my")
    public ApiResponse<List<Notification>> getMyNotifications(@AuthenticationPrincipal User user) {
        return ApiResponse.<List<Notification>>builder()
                .data(loadNotificationsForUser(user))
                .build();
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        long unreadCount = loadNotificationsForUser(user)
                .stream()
                .filter(item -> !item.isRead())
                .count();

        Map<String, Long> payload = new LinkedHashMap<>();
        payload.put("unreadCount", unreadCount);

        return ApiResponse.<Map<String, Long>>builder()
                .data(payload)
                .build();
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Map<String, Object>> markAsRead(
            @PathVariable("id") Long notificationId,
            @AuthenticationPrincipal User user
    ) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);

        if (notification == null) {
            return ApiResponse.<Map<String, Object>>builder()
                    .code(404)
                    .message("Notification not found")
                    .build();
        }

        List<String> roleCandidates = buildRoleCandidates(user.getRole());
        boolean canAccess = canAccessNotification(notification, user.getId(), roleCandidates);

        if (!canAccess) {
            return ApiResponse.<Map<String, Object>>builder()
                    .code(403)
                    .message("Forbidden")
                    .build();
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", notification.getId());
        payload.put("read", true);
        payload.put("updatedAt", LocalDateTime.now());

        return ApiResponse.<Map<String, Object>>builder()
                .data(payload)
                .build();
    }

    @PatchMapping("/read-all")
    public ApiResponse<Map<String, Object>> markAllAsRead(@AuthenticationPrincipal User user) {
        List<Notification> unreadNotifications = loadNotificationsForUser(user)
                .stream()
                .filter(item -> !item.isRead())
                .toList();

        unreadNotifications.forEach(notification -> notification.setRead(true));
        if (!unreadNotifications.isEmpty()) {
            notificationRepository.saveAll(unreadNotifications);
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", true);
        payload.put("updatedCount", unreadNotifications.size());
        payload.put("updatedAt", LocalDateTime.now());

        return ApiResponse.<Map<String, Object>>builder()
                .data(payload)
                .build();
    }

    private List<Notification> loadNotificationsForUser(User user) {
        Long userId = user.getId();
        List<String> roleCandidates = buildRoleCandidates(user.getRole());

        List<Notification> userNotifications = notificationRepository.findByTargetUserIdOrderByCreatedAtDesc(userId);
        List<Notification> roleNotifications = roleCandidates.isEmpty()
                ? List.of()
                : notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(roleCandidates);

        Map<Long, Notification> merged = new LinkedHashMap<>();
        userNotifications.forEach(item -> merged.put(item.getId(), item));
        roleNotifications.forEach(item -> merged.put(item.getId(), item));

        return merged.values().stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    private List<String> buildRoleCandidates(String role) {
        if (role == null || role.isBlank()) {
            return List.of();
        }

        String normalizedRole = role.trim().toUpperCase(Locale.ROOT);
        List<String> roles = new ArrayList<>();
        roles.add(normalizedRole);

        String prefixedRole = normalizedRole.startsWith("ROLE_") ? normalizedRole : "ROLE_" + normalizedRole;
        if (!roles.contains(prefixedRole)) {
            roles.add(prefixedRole);
        }

        return roles;
    }

    private boolean canAccessNotification(Notification notification, Long userId, List<String> roleCandidates) {
        if (notification.getTargetUserId() != null && notification.getTargetUserId().equals(userId)) {
            return true;
        }

        String targetRole = notification.getTargetRole();
        return targetRole != null && roleCandidates.contains(targetRole);
    }
}
