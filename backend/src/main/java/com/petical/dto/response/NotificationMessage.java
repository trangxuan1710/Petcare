package com.petical.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    private String title;
    private String message;
    private String link;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    private String type;
}