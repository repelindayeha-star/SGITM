package com.sigtm.backend.motocicleta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MotocicletaRequest(
        @NotNull Long clienteId,
        @NotBlank String marca,
        @NotBlank String modelo,
        @NotBlank String placa,
        Integer anio,
        Integer cilindraje,
        String color,
        String chasis
) {}
