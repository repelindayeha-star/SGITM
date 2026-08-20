package com.sigtm.backend.item.dto;

import com.sigtm.backend.item.ItemOrden;

import java.math.BigDecimal;

public record ItemOrdenResponse(
        Long id, Long ordenId, String tipo, String descripcion,
        BigDecimal cantidad, BigDecimal valorUnitario, BigDecimal subtotal
) {
    public static ItemOrdenResponse from(ItemOrden item) {
        return new ItemOrdenResponse(
                item.getId(), item.getOrden().getId(), item.getTipo().name(),
                item.getDescripcion(), item.getCantidad(), item.getValorUnitario(), item.getSubtotal()
        );
    }
}
