package com.petical.config.security;


import com.petical.dto.response.ApiResponse;
import com.petical.enums.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuthEntrypoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper;
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        log.error("token: {}", request.getHeader("Authorization"));
        log.error("Unauthorized request");
        ApiResponse<?> error = ApiResponse.builder()
            .code(ErrorCode.UN_AUTHORIZED.getCode())
            .message(ErrorCode.UN_AUTHORIZED.getMessage())
            .build();
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }
}
