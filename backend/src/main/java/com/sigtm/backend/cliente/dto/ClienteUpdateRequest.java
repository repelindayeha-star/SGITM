package com.sigtm.backend.cliente.dto;

import jakarta.validation.constraints.NotBlank;

public record ClienteUpdateRequest(@NotBlank String nombre, String telefono, String documento) {}
