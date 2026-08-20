package com.sigtm.backend.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService(
            "una-clave-de-prueba-de-al-menos-32-bytes-de-largo-1234567890",
            60
    );

    @Test
    void generaYValidaUnTokenConLosDatosCorrectos() {
        String token = jwtService.generarToken(42L, "cliente@correo.com", "CLIENTE");

        Claims claims = jwtService.validarYObtenerClaims(token);

        assertEquals("42", claims.getSubject());
        assertEquals("cliente@correo.com", claims.get("correo", String.class));
        assertEquals("CLIENTE", claims.get("rol", String.class));
    }
}
