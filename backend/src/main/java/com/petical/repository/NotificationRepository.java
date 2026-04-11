package com.petical.repository;

import com.petical.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String role);
    List<Notification> findByTargetRoleInOrderByCreatedAtDesc(List<String> roles);
    List<Notification> findByTargetUserIdOrTargetRoleOrderByCreatedAtDesc(Long userId, String role);
}