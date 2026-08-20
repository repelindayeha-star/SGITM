package com.sigtm.backend.orden.dto;

import com.sigtm.backend.orden.OrdenServicio;

import java.time.Instant;

public record OrdenResponse(
        Long id, Long motoId, String motoPlaca, String motoDescripcion,
        Long mecanicoId, String mecanicoNombre, Instant fecha, String diagnostico, String estado
) {
    public static OrdenResponse from(OrdenServicio o) {
        return new OrdenResponse(
                o.getId(),
                o.getMoto().getId(),
                o.getMoto().getPlaca(),
                o.getMoto().getMarca() + " " + o.getMoto().getModelo(),
                o.getMecanico() != null ? o.getMecanico().getId() : null,
                o.getMecanico() != null ? o.getMecanico().getCorreo() : null,
                o.getFecha(),
                o.getDiagnostico(),
                o.getEstado().name()
        );
    }
}
