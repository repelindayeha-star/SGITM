package com.sigtm.backend.cliente;

import com.sigtm.backend.cliente.dto.ClienteUpdateRequest;
import com.sigtm.backend.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    /** Solo el rol TALLER puede listar todos los clientes (se valida en el controller via SecurityConfig). */
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Cliente obtenerPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + id));
    }

    public Cliente obtenerPorUsuarioId(Long usuarioId) {
        return clienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un cliente asociado a este usuario."));
    }

    @Transactional
    public Cliente actualizar(Long id, ClienteUpdateRequest request) {
        Cliente cliente = obtenerPorId(id);
        cliente.setNombre(request.nombre());
        cliente.setTelefono(request.telefono());
        cliente.setDocumento(request.documento());
        return clienteRepository.save(cliente);
    }
}
