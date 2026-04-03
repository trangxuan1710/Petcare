package com.petical.controller;

import com.petical.dto.request.CreateClientRequest;
import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.ClientResponse;
import com.petical.entity.Client;
import com.petical.entity.Pet;
import com.petical.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clients")
@Tag(name = "Khách hàng", description = "API tra cứu và tạo mới khách hàng")
public class ClientController {
    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "Tra cứu khách hàng theo số điện thoại", description = "Dùng trong tiếp đón để tìm khách hàng cũ; trả về null nếu không tồn tại")
    public ApiResponse<Client> findByPhone(@RequestParam("phone") String phone) {
        return ApiResponse.<Client>builder().data(clientService.findByPhone(phone)).build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo khách hàng mới", description = "Tạo hồ sơ chủ nuôi mới theo tên và số điện thoại")
    public ApiResponse<Client> createCustomer(@RequestBody CreateClientRequest request) {
        return ApiResponse.<Client>builder()
                .code(201)
                .message("Created")
                .data(clientService.createCustomerEntity(request))
                .build();
    }

    @GetMapping("/{id}/pets")
    @Operation(summary = "Lấy danh sách thú cưng của khách hàng", description = "Phục vụ bước chọn thú cưng khi tạo phiếu tiếp đón")
    public ApiResponse<List<Pet>> listPets(@PathVariable("id") long customerId) {
        return ApiResponse.<List<Pet>>builder()
                .data(clientService.getPetsByCustomerId(customerId))
                .build();
    }
    @GetMapping("/search")
    @Operation(summary = "Tìm khách hàng theo từ khóa số điện thoại", description = "Trả về danh sách rút gọn để autocomplete tại màn tiếp đón")
    public ApiResponse<List<ClientResponse>> searchClient(@RequestParam("phone") String phone) {
        return ApiResponse.<List<ClientResponse>>builder()
                .data(clientService.searchClient(phone))
                .build();
    }
}
