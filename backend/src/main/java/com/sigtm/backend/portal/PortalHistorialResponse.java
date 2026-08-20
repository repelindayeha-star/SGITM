package com.sigtm.backend.portal;

import com.sigtm.backend.item.dto.ItemOrdenResponse;
import com.sigtm.backend.orden.dto.OrdenResponse;

import java.util.List;

/** Combina una orden con sus items para la vista de historial del cliente (sin tablas nuevas: solo une lo ya existente). */
public record PortalHistorialResponse(OrdenResponse orden, List<ItemOrdenResponse> items) {}
