package com.sigtm.backend.factura;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
    List<Factura> findByClienteId(Long clienteId);

    // Recorre la relacion ManyToMany factura_ordenes: true si esa orden ya quedo
    // incluida en alguna factura existente (sin importar el estado de la factura).
    boolean existsByOrdenesId(Long ordenId);
}
