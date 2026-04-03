package com.petical.repository.projection;

import java.math.BigDecimal;

public interface ClientSpentProjection {
    Long getClientId();
    BigDecimal getTotalSpent();
}
