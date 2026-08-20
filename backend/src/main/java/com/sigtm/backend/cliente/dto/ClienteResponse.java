package com.sigtm.backend.cliente.dto;

import com.sigtm.backend.cliente.Cliente;

public record ClienteResponse(Long id, String nombre, String telefono, String documento, String correo) {
    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(c.getId(), c.getNombre(), c.getTelefono(), c.getDocumento(), c.getUsuario().getCorreo());
    }
}
