package com.sigtm.backend.factura;

import com.sigtm.backend.cliente.Cliente;
import com.sigtm.backend.orden.OrdenServicio;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * La factura NO vuelve a guardar los repuestos/mano de obra: solo referencia las ordenes
 * que cubre (factura_ordenes) y guarda el total ya calculado a partir de sus items,
 * exactamente para no duplicar esa informacion en dos lugares.
 */
@Entity
@Table(name = "facturas")
@Getter
@Setter
@NoArgsConstructor
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToMany
    @JoinTable(
            name = "factura_ordenes",
            joinColumns = @JoinColumn(name = "factura_id"),
            inverseJoinColumns = @JoinColumn(name = "orden_id")
    )
    private Set<OrdenServicio> ordenes = new HashSet<>();

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoFactura estado = EstadoFactura.PENDIENTE;

    @Column(nullable = false)
    private Instant fecha = Instant.now();

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();
}
