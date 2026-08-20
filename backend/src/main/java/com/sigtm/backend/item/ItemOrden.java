package com.sigtm.backend.item;

import com.sigtm.backend.orden.OrdenServicio;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Pruebas, repuestos y mano de obra de una orden. Esta es la UNICA tabla donde vive
 * esta informacion: la factura no vuelve a guardar una copia, solo referencia la orden
 * y calcula el total a partir de estos items (evita la redundancia que se pidio evitar).
 */
@Entity
@Table(name = "items_orden")
@Getter
@Setter
@NoArgsConstructor
public class ItemOrden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_id", nullable = false)
    private OrdenServicio orden;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoItem tipo;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad = BigDecimal.ONE;

    @Column(name = "valor_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorUnitario = BigDecimal.ZERO;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();

    public BigDecimal getSubtotal() {
        return cantidad.multiply(valorUnitario);
    }
}
