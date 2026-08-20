package com.sigtm.backend.factura.dto;

import com.sigtm.backend.factura.EstadoFactura;
import jakarta.validation.constraints.NotNull;

public record FacturaEstadoRequest(@NotNull EstadoFactura estado) {}
