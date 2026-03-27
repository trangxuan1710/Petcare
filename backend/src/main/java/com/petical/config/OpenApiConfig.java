package com.petical.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";
    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/auth/public",
            "/users/avatar",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-ui.html"
    );

    @Bean
    public OpenAPI peticalOpenApi() {
        return new OpenAPI()
                        .servers(List.of(
                new Server()
                        .url("https://api.daidq.io.vn/api")
                        .description("Production server"), 
                new Server()
                        .url("http://localhost:8080/api")
                        .description("Local development server")
        ))
                .components(new Components().addSecuritySchemes(
                        BEARER_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                ))
                .info(new Info()
                        .title("Petical API")
                        .description("OpenAPI documentation for Petical pet clinic management system")
                        .version("v1")
                        .contact(new Contact().name("Petical Team"))
                        .license(new License().name("Internal Use")));
    }

    @Bean
    public OpenApiCustomizer addSecurityForNonPublicEndpoints() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }
            openApi.getPaths().forEach((path, pathItem) -> {
                String normalizedPath = path.startsWith("/api/") ? path.substring(4) : path;
                boolean isPublicPath = PUBLIC_PATH_PREFIXES.stream().anyMatch(prefix ->
                        path.startsWith(prefix) || normalizedPath.startsWith(prefix)
                );
                if (isPublicPath) {
                    return;
                }
                pathItem.readOperations().forEach(operation -> {
                    if (operation.getSecurity() == null || operation.getSecurity().isEmpty()) {
                        operation.addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME));
                    }
                });
            });
        };
    }
}
