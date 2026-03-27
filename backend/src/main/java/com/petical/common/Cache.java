package com.petical.common;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class Cache {
    private final ScheduledExecutorService scheduledExecutorService;
    private final Map<String, String> data = new ConcurrentHashMap<>();

    public void add(String key, String value, long ttl) {
        data.put(key, value);
        scheduledExecutorService.schedule(() -> data.remove(key), ttl, TimeUnit.MILLISECONDS);
    }

    public boolean contains(String key) {
        return data.containsKey(key);
    }
}
