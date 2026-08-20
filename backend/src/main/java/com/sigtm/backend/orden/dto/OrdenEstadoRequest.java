package com.sigtm.backend.orden.dto;

import com.sigtm.backend.orden.EstadoOrden;
import jakarta.validation.constraints.NotNull;

public record OrdenEstadoRequest(@NotNull EstadoOrden estado) {}
