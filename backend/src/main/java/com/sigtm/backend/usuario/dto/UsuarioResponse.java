package com.sigtm.backend.usuario.dto;

import com.sigtm.backend.usuario.Usuario;

public record UsuarioResponse(Long id, String correo, String rol, boolean correoVerificado) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getCorreo(), u.getRol().name(), u.isCorreoVerificado());
    }
}
