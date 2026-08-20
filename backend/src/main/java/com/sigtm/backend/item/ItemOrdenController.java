package com.sigtm.backend.item;

import com.sigtm.backend.item.dto.ItemOrdenRequest;
import com.sigtm.backend.item.dto.ItemOrdenResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Modulo "Items de la orden" (rol TALLER). Alimenta Facturacion, no se repite alli. */
@RestController
@RequestMapping("/api/items-orden")
public class ItemOrdenController {

    private final ItemOrdenService itemService;

    public ItemOrdenController(ItemOrdenService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<ItemOrdenResponse> listarPorOrden(@RequestParam Long ordenId) {
        return itemService.listarPorOrden(ordenId).stream().map(ItemOrdenResponse::from).toList();
    }

    @PostMapping
    public ItemOrdenResponse agregar(@Valid @RequestBody ItemOrdenRequest request) {
        return ItemOrdenResponse.from(itemService.agregar(request));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        itemService.eliminar(id);
    }
}
