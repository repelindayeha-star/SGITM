package com.sigtm.backend.factura;

import com.sigtm.backend.cliente.Cliente;
import com.sigtm.backend.cliente.ClienteService;
import com.sigtm.backend.common.ResourceNotFoundException;
import com.sigtm.backend.factura.dto.FacturaRequest;
import com.sigtm.backend.item.ItemOrdenService;
import com.sigtm.backend.orden.EstadoOrden;
import com.sigtm.backend.orden.OrdenServicio;
import com.sigtm.backend.orden.OrdenServicioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Genera facturas SUMANDO lo que ya existe en items_orden -- no vuelve a pedir que
 * se digite cada repuesto/mano de obra otra vez.
 */
@Service
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final ClienteService clienteService;
    private final OrdenServicioService ordenService;
    private final ItemOrdenService itemService;

    public FacturaService(FacturaRepository facturaRepository, ClienteService clienteService,
                           OrdenServicioService ordenService, ItemOrdenService itemService) {
        this.facturaRepository = facturaRepository;
        this.clienteService = clienteService;
        this.ordenService = ordenService;
        this.itemService = itemService;
    }

    public List<Factura> listarTodas() {
        return facturaRepository.findAll();
    }

    public List<Factura> listarPorCliente(Long clienteId) {
        return facturaRepository.findByClienteId(clienteId);
    }

    public Factura obtenerPorId(Long id) {
        return facturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada: " + id));
    }

    @Transactional
    public Factura generar(FacturaRequest request) {
        Cliente cliente = clienteService.obtenerPorId(request.clienteId());

        Set<OrdenServicio> ordenes = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Long ordenId : request.ordenIds()) {
            OrdenServicio orden = ordenService.obtenerPorId(ordenId);

            if (!orden.getMoto().getCliente().getId().equals(cliente.getId())) {
                throw new IllegalArgumentException("La orden " + ordenId + " no pertenece a este cliente.");
            }
            if (orden.getEstado() != EstadoOrden.CERRADA) {
                throw new IllegalArgumentException("Solo se pueden facturar ordenes cerradas (orden " + ordenId + ").");
            }

            ordenes.add(orden);
            total = total.add(itemService.calcularTotalOrden(ordenId));
        }

        Factura factura = new Factura();
        factura.setCliente(cliente);
        factura.setOrdenes(ordenes);
        factura.setTotal(total);
        return facturaRepository.save(factura);
    }

    @Transactional
    public Factura cambiarEstado(Long id, EstadoFactura nuevoEstado) {
        Factura factura = obtenerPorId(id);
        factura.setEstado(nuevoEstado);
        return facturaRepository.save(factura);
    }
}
