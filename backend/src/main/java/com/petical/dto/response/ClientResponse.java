package com.petical.dto.response;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ClientResponse {
    private long id;
    private String name;
    private String phone;
    private BigDecimal totalSpent;
    private long visitCount;
}
