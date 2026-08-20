package com.sigtm.backend.orden;

import com.sigtm.backend.common.ForbiddenOperationException;
import com.sigtm.backend.common.ResourceNotFoundException;
import com.sigtm.backend.motocicleta.Motocicleta;
import com.sigtm.backend.motocicleta.MotocicletaService;
import com.sigtm.backend.orden.dto.OrdenRequest;
import com.sigtm.backend.usuario.Usuario;
import com.sigtm.backend.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Unica fuente de verdad para ordenes de servicio. El "Portal del cliente" reutiliza
 * listarPorCliente/obtenerVerificandoPropietario en modo solo lectura, no repite la logica.
 */
@Service
public class OrdenServicioService {

    private final OrdenServicioRepository ordenRepository;
    private final MotocicletaService motocicletaService;
    private final UsuarioRepository usuarioRepository;

    public OrdenServicioService(OrdenServicioRepository ordenRepository, MotocicletaService motocicletaService,
                                 UsuarioRepository usuarioRepository) {
        this.ordenRepository = ordenRepository;
        this.motocicletaService = motocicletaService;
        this.usuarioRepository = usuarioRepository;
    }

    public List<OrdenServicio> listarTodas() {
        return ordenRepository.findAll();
    }

    public List<OrdenServicio> listarPorMoto(Long motoId) {
        return ordenRepository.findByMotoId(motoId);
    }

    /** Usado por el portal: todas las ordenes de todas las motos de un cliente. */
    public List<OrdenServicio> listarPorCliente(Long clienteId) {
        return ordenRepository.findByMotoClienteId(clienteId);
    }

    public OrdenServicio obtenerPorId(Long id) {
        return ordenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada: " + id));
    }

    /** Usado por el portal del cliente: 403 si la orden no es de una moto de ese cliente. */
    public OrdenServicio obtenerVerificandoPropietario(Long ordenId, Long clienteId) {
        OrdenServicio orden = obtenerPorId(ordenId);
        if (!orden.getMoto().getCliente().getId().equals(clienteId)) {
            throw new ForbiddenOperationException("Esta orden no pertenece al cliente autenticado.");
        }
        return orden;
    }

    @Transactional
    public OrdenServicio crear(OrdenRequest request) {
        Motocicleta moto = motocicletaService.obtenerPorId(request.motoId());

        OrdenServicio orden = new OrdenServicio();
        orden.setMoto(moto);
        orden.setDiagnostico(request.diagnostico());
        if (request.mecanicoId() != null) {
            Usuario mecanico = usuarioRepository.findById(request.mecanicoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mecanico no encontrado: " + request.mecanicoId()));
            orden.setMecanico(mecanico);
        }
        return ordenRepository.save(orden);
    }

    @Transactional
    public OrdenServicio actualizarDiagnostico(Long id, OrdenRequest request) {
        OrdenServicio orden = obtenerPorId(id);
        orden.setDiagnostico(request.diagnostico());
        if (request.mecanicoId() != null) {
            Usuario mecanico = usuarioRepository.findById(request.mecanicoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mecanico no encontrado: " + request.mecanicoId()));
            orden.setMecanico(mecanico);
        }
        return ordenRepository.save(orden);
    }

    @Transactional
    public OrdenServicio cambiarEstado(Long id, EstadoOrden nuevoEstado) {
        OrdenServicio orden = obtenerPorId(id);
        orden.setEstado(nuevoEstado);
        return ordenRepository.save(orden);
    }
}
