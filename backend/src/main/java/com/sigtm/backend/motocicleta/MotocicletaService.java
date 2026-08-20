package com.sigtm.backend.motocicleta;

import com.sigtm.backend.cliente.Cliente;
import com.sigtm.backend.cliente.ClienteService;
import com.sigtm.backend.common.ForbiddenOperationException;
import com.sigtm.backend.common.ResourceNotFoundException;
import com.sigtm.backend.motocicleta.dto.MotocicletaRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Unica fuente de verdad para leer/escribir motos. El modulo "Portal del cliente"
 * NO duplica esta logica: reutiliza estos mismos metodos con el filtro de propiedad.
 */
@Service
public class MotocicletaService {

    private final MotocicletaRepository motocicletaRepository;
    private final ClienteService clienteService;

    public MotocicletaService(MotocicletaRepository motocicletaRepository, ClienteService clienteService) {
        this.motocicletaRepository = motocicletaRepository;
        this.clienteService = clienteService;
    }

    public List<Motocicleta> listarTodas() {
        return motocicletaRepository.findAll();
    }

    public List<Motocicleta> listarPorCliente(Long clienteId) {
        return motocicletaRepository.findByClienteId(clienteId);
    }

    public Motocicleta obtenerPorId(Long id) {
        return motocicletaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Motocicleta no encontrada: " + id));
    }

    /** Usado por el portal del cliente: lanza 403 si la moto no es de este cliente (previene IDOR). */
    public Motocicleta obtenerVerificandoPropietario(Long motoId, Long clienteId) {
        Motocicleta moto = obtenerPorId(motoId);
        if (!moto.getCliente().getId().equals(clienteId)) {
            throw new ForbiddenOperationException("Esta moto no pertenece al cliente autenticado.");
        }
        return moto;
    }

    @Transactional
    public Motocicleta registrar(MotocicletaRequest request) {
        Cliente cliente = clienteService.obtenerPorId(request.clienteId());

        Motocicleta moto = new Motocicleta();
        moto.setCliente(cliente);
        aplicarDatos(moto, request);
        return motocicletaRepository.save(moto);
    }

    @Transactional
    public Motocicleta actualizar(Long id, MotocicletaRequest request) {
        Motocicleta moto = obtenerPorId(id);
        aplicarDatos(moto, request);
        return motocicletaRepository.save(moto);
    }

    private void aplicarDatos(Motocicleta moto, MotocicletaRequest request) {
        moto.setMarca(request.marca());
        moto.setModelo(request.modelo());
        moto.setPlaca(request.placa());
        moto.setAnio(request.anio());
        moto.setCilindraje(request.cilindraje());
        moto.setColor(request.color());
        moto.setChasis(request.chasis());
    }
}
