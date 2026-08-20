package com.sigtm.backend.cliente;

import com.sigtm.backend.cliente.dto.ClienteResponse;
import com.sigtm.backend.cliente.dto.ClienteUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Modulo "Clientes" (accesible solo por el rol TALLER, ver SecurityConfig). */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<ClienteResponse> listar() {
        return clienteService.listarTodos().stream().map(ClienteResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ClienteResponse obtener(@PathVariable Long id) {
        return ClienteResponse.from(clienteService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ClienteResponse actualizar(@PathVariable Long id, @Valid @RequestBody ClienteUpdateRequest request) {
        return ClienteResponse.from(clienteService.actualizar(id, request));
    }
}
