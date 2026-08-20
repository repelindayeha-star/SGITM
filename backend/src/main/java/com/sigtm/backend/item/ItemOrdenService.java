package com.sigtm.backend.item;

import com.sigtm.backend.common.ResourceNotFoundException;
import com.sigtm.backend.item.dto.ItemOrdenRequest;
import com.sigtm.backend.orden.OrdenServicio;
import com.sigtm.backend.orden.OrdenServicioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Unica fuente de verdad de los items (pruebas/repuestos/mano de obra). El modulo de
 * Facturacion y el Portal del cliente reutilizan listarPorOrden/calcularTotal en vez
 * de volver a guardar o recalcular esta informacion por su cuenta.
 */
@Service
public class ItemOrdenService {

    private final ItemOrdenRepository itemRepository;
    private final OrdenServicioService ordenService;

    public ItemOrdenService(ItemOrdenRepository itemRepository, OrdenServicioService ordenService) {
        this.itemRepository = itemRepository;
        this.ordenService = ordenService;
    }

    public List<ItemOrden> listarPorOrden(Long ordenId) {
        return itemRepository.findByOrdenId(ordenId);
    }

    public List<ItemOrden> listarPorOrdenes(List<Long> ordenIds) {
        return itemRepository.findByOrdenIdIn(ordenIds);
    }

    /** Usado por Facturacion: suma de subtotales de una orden, calculado una sola vez a partir de los items reales. */
    public BigDecimal calcularTotalOrden(Long ordenId) {
        return listarPorOrden(ordenId).stream()
                .map(ItemOrden::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public ItemOrden agregar(ItemOrdenRequest request) {
        OrdenServicio orden = ordenService.obtenerPorId(request.ordenId());

        ItemOrden item = new ItemOrden();
        item.setOrden(orden);
        item.setTipo(request.tipo());
        item.setDescripcion(request.descripcion());
        item.setCantidad(request.cantidad());
        item.setValorUnitario(request.valorUnitario());
        return itemRepository.save(item);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item no encontrado: " + id);
        }
        itemRepository.deleteById(id);
    }
}
