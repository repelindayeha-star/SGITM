package com.sigtm.backend.security;

/**
 * Principal ligero que se guarda en el SecurityContext tras validar el JWT.
 * Los servicios lo usan para saber "quien esta pidiendo esto" y aplicar
 * las reglas de autorizacion (ej: un cliente solo puede ver sus propias motos).
 */
public record AuthenticatedUser(Long id, String correo, String rol) {

    public boolean esTaller() {
        return "TALLER".equals(rol);
    }

    public boolean esCliente() {
        return "CLIENTE".equals(rol);
    }
}
