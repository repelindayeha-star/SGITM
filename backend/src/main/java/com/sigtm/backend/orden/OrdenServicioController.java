package com.sigtm.backend.orden;

import com.sigtm.backend.orden.dto.OrdenEstadoRequest;
import com.sigtm.backend.orden.dto.OrdenRequest;
import com.sigtm.backend.orden.dto.OrdenResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Modulo "Ordenes de servicio / diagnostico" (rol TALLER). */
@RestController
@RequestMapping("/api/ordenes")
public class OrdenServicioController {

    private final OrdenServicioService ordenService;

    public OrdenServicioController(OrdenServicioService ordenService) {
        this.ordenService = ordenService;
    }

    @GetMapping
    public List<OrdenResponse> listar(@RequestParam(required = false) Long motoId) {
        var lista = motoId != null ? ordenService.listarPorMoto(motoId) : ordenService.listarTodas();
        return lista.stream().map(OrdenResponse::from).toList();
    }

    @GetMapping("/{id}")
    public OrdenResponse obtener(@PathVariable Long id) {
        return OrdenResponse.from(ordenService.obtenerPorId(id));
    }

    @PostMapping
    public OrdenResponse crear(@Valid @RequestBody OrdenRequest request) {
        return OrdenResponse.from(ordenService.crear(request));
    }

    @PutMapping("/{id}")
    public OrdenResponse actualizarDiagnostico(@PathVariable Long id, @Valid @RequestBody OrdenRequest request) {
        return OrdenResponse.from(ordenService.actualizarDiagnostico(id, request));
    }

    @PatchMapping("/{id}/estado")
    public OrdenResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody OrdenEstadoRequest request) {
        return OrdenResponse.from(ordenService.cambiarEstado(id, request.estado()));
    }
}
