package com.petical.config.security;

import com.petical.common.Cache;
import com.petical.common.util.JwtUtil;
import com.petical.entity.User;
import com.petical.service.UserService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final Cache cache;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = null;
            if(request.getHeader("Authorization") != null && request.getHeader("Authorization").startsWith("Bearer ")) {
                token = request.getHeader("Authorization").substring(7);
            } else if (request.getParameter("token") != null) {
                token = request.getParameter("token");
            }
            
            if(token != null) {
                log.info("Token in filter: {}", token);
                if(jwtUtil.validateToken(token)) {
                    Claims claims = jwtUtil.getClaims(token);
                    log.info("Claims: {}", claims);
                    if(!cache.contains(claims.getId())) {
                        User user = (User) userService.loadUserByUsername(claims.getSubject());
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                        log.info("User authenticated: {}", user.getPhoneNumber());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error: {}", e.getMessage());
        } finally {
            filterChain.doFilter(request, response);
        }
    }
}
