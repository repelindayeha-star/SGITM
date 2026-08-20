package com.sigtm.backend.factura;

import com.sigtm.backend.factura.dto.FacturaEstadoRequest;
import com.sigtm.backend.factura.dto.FacturaRequest;
import com.sigtm.backend.factura.dto.FacturaResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Modulo "Facturacion" (rol TALLER). Generada a partir de items_orden, sin volver a digitarlos. */
@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final FacturaService facturaService;

    public FacturaController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @GetMapping
    public List<FacturaResponse> listar(@RequestParam(required = false) Long clienteId) {
        var lista = clienteId != null ? facturaService.listarPorCliente(clienteId) : facturaService.listarTodas();
        return lista.stream().map(FacturaResponse::from).toList();
    }

    @GetMapping("/{id}")
    public FacturaResponse obtener(@PathVariable Long id) {
        return FacturaResponse.from(facturaService.obtenerPorId(id));
    }

    @PostMapping
    public FacturaResponse generar(@Valid @RequestBody FacturaRequest request) {
        return FacturaResponse.from(facturaService.generar(request));
    }

    @PatchMapping("/{id}/estado")
    public FacturaResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody FacturaEstadoRequest request) {
        return FacturaResponse.from(facturaService.cambiarEstado(id, request.estado()));
    }
}
