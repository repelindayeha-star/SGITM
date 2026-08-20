package com.sigtm.backend.usuario.dto;

import jakarta.validation.constraints.NotBlank;

/** El frontend obtiene este id_token del boton "Continuar con Google" y solo lo reenvia; nunca confiamos en datos que vengan aparte. */
public record GoogleLoginRequest(@NotBlank String idToken) {}
