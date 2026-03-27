package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.entity.Pet;
import com.petical.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pets")
@Tag(name = "Thú cưng", description = "API quản lý hồ sơ thú cưng")
public class PetController {
    private final ClientService clientService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo thú cưng mới", description = "Tạo hồ sơ thú cưng gắn với khách hàng để phục vụ quy trình khám")
    public ApiResponse<Pet> createPet(@RequestBody Pet request) {
        return ApiResponse.<Pet>builder()
                .code(201)
                .message("Created")
                .data(clientService.createPetEntity(request))
                .build();
    }
}
