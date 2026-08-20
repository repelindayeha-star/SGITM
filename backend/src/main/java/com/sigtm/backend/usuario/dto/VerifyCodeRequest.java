package com.sigtm.backend.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyCodeRequest(
        @NotBlank String correo,
        @NotBlank @Pattern(regexp = "\\d{6}", message = "El codigo debe tener 6 digitos") String codigo
) {}
