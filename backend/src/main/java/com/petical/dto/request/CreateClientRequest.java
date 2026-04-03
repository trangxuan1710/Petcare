package com.petical.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClientRequest {
    private String name;
    private String phone;
}
