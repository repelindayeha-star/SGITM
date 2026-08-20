package com.sigtm.backend.motocicleta.dto;

import com.sigtm.backend.motocicleta.Motocicleta;

public record MotocicletaResponse(
        Long id, Long clienteId, String clienteNombre, String marca, String modelo,
        String placa, Integer anio, Integer cilindraje, String color, String chasis
) {
    public static MotocicletaResponse from(Motocicleta m) {
        return new MotocicletaResponse(
                m.getId(), m.getCliente().getId(), m.getCliente().getNombre(),
                m.getMarca(), m.getModelo(), m.getPlaca(), m.getAnio(),
                m.getCilindraje(), m.getColor(), m.getChasis()
        );
    }
}
