package com.sigtm.backend.portal;

import com.sigtm.backend.cliente.Cliente;
import com.sigtm.backend.cliente.ClienteService;
import com.sigtm.backend.item.ItemOrdenService;
import com.sigtm.backend.item.dto.ItemOrdenResponse;
import com.sigtm.backend.motocicleta.dto.MotocicletaResponse;
import com.sigtm.backend.motocicleta.MotocicletaService;
import com.sigtm.backend.orden.OrdenServicio;
import com.sigtm.backend.orden.OrdenServicioService;
import com.sigtm.backend.orden.dto.OrdenResponse;
import com.sigtm.backend.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

/**
 * Modulo "Portal del cliente" (rol CLIENTE, solo lectura).
 *
 * IMPORTANTE: este controller NO tiene su propia logica de negocio ni sus propias
 * consultas a la base de datos. Reutiliza exactamente los mismos servicios que usa
 * el taller (MotocicletaService, OrdenServicioService, ItemOrdenService) y unicamente
 * agrega el filtro "esto es del cliente autenticado" -- asi los datos y las reglas
 * de negocio siguen viviendo en un solo lugar, sin duplicarse para el rol cliente.
 */
@RestController
@RequestMapping("/api/portal")
public class PortalController {

    private final ClienteService clienteService;
    private final MotocicletaService motocicletaService;
    private final OrdenServicioService ordenService;
    private final ItemOrdenService itemService;

    public PortalController(ClienteService clienteService, MotocicletaService motocicletaService,
                             OrdenServicioService ordenService, ItemOrdenService itemService) {
        this.clienteService = clienteService;
        this.motocicletaService = motocicletaService;
        this.ordenService = ordenService;
        this.itemService = itemService;
    }

    @GetMapping("/mis-motos")
    public List<MotocicletaResponse> misMotos(@AuthenticationPrincipal AuthenticatedUser principal) {
        Cliente cliente = clienteService.obtenerPorUsuarioId(principal.id());
        return motocicletaService.listarPorCliente(cliente.getId()).stream()
                .map(MotocicletaResponse::from)
                .toList();
    }

    @GetMapping("/motos/{motoId}/historial")
    public List<PortalHistorialResponse> historialDeMoto(@PathVariable Long motoId,
                                                           @AuthenticationPrincipal AuthenticatedUser principal) {
        Cliente cliente = clienteService.obtenerPorUsuarioId(principal.id());
        // Lanza 403 si la moto no es de este cliente -- misma validacion que usa el taller.
        motocicletaService.obtenerVerificandoPropietario(motoId, cliente.getId());

        List<OrdenServicio> ordenes = ordenService.listarPorMoto(motoId).stream()
                .sorted(Comparator.comparing(OrdenServicio::getFecha).reversed())
                .toList();

        return ordenes.stream()
                .map(orden -> new PortalHistorialResponse(
                        OrdenResponse.from(orden),
                        itemService.listarPorOrden(orden.getId()).stream().map(ItemOrdenResponse::from).toList()
                ))
                .toList();
    }
}
