package com.sigtm.backend.item.dto;

import com.sigtm.backend.item.TipoItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ItemOrdenRequest(
        @NotNull Long ordenId,
        @NotNull TipoItem tipo,
        @NotBlank String descripcion,
        @NotNull BigDecimal cantidad,
        @NotNull BigDecimal valorUnitario
) {}
