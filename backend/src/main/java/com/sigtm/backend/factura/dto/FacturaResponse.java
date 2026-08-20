package com.sigtm.backend.factura.dto;

import com.sigtm.backend.factura.Factura;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record FacturaResponse(
        Long id, Long clienteId, String clienteNombre, List<Long> ordenIds,
        BigDecimal total, String estado, Instant fecha
) {
    public static FacturaResponse from(Factura f) {
        return new FacturaResponse(
                f.getId(), f.getCliente().getId(), f.getCliente().getNombre(),
                f.getOrdenes().stream().map(o -> o.getId()).toList(),
                f.getTotal(), f.getEstado().name(), f.getFecha()
        );
    }
}
