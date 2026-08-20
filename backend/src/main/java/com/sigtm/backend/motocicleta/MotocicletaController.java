package com.sigtm.backend.motocicleta;

import com.sigtm.backend.motocicleta.dto.MotocicletaRequest;
import com.sigtm.backend.motocicleta.dto.MotocicletaResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Modulo "Motocicletas" (rol TALLER). */
@RestController
@RequestMapping("/api/motocicletas")
public class MotocicletaController {

    private final MotocicletaService motocicletaService;

    public MotocicletaController(MotocicletaService motocicletaService) {
        this.motocicletaService = motocicletaService;
    }

    @GetMapping
    public List<MotocicletaResponse> listar(@RequestParam(required = false) Long clienteId) {
        var lista = clienteId != null
                ? motocicletaService.listarPorCliente(clienteId)
                : motocicletaService.listarTodas();
        return lista.stream().map(MotocicletaResponse::from).toList();
    }

    @GetMapping("/{id}")
    public MotocicletaResponse obtener(@PathVariable Long id) {
        return MotocicletaResponse.from(motocicletaService.obtenerPorId(id));
    }

    @PostMapping
    public MotocicletaResponse registrar(@Valid @RequestBody MotocicletaRequest request) {
        return MotocicletaResponse.from(motocicletaService.registrar(request));
    }

    @PutMapping("/{id}")
    public MotocicletaResponse actualizar(@PathVariable Long id, @Valid @RequestBody MotocicletaRequest request) {
        return MotocicletaResponse.from(motocicletaService.actualizar(id, request));
    }
}
