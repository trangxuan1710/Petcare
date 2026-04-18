package com.petical.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LookupOptionResponse {
    private long id;
    private String code;
    private String name;
    private String parentCode;
    private String value;
}
