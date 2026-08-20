package com.sigtm.backend.factura.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Genera una factura a partir de una o varias ordenes YA CERRADAS de un mismo cliente. */
public record FacturaRequest(@NotNull Long clienteId, @NotEmpty List<Long> ordenIds) {}
