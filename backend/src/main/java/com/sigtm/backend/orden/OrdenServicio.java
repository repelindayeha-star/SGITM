package com.sigtm.backend.orden;

import com.sigtm.backend.motocicleta.Motocicleta;
import com.sigtm.backend.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** El corazon del sistema: una orden de diagnostico/servicio sobre una moto. */
@Entity
@Table(name = "ordenes_servicio")
@Getter
@Setter
@NoArgsConstructor
public class OrdenServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "moto_id", nullable = false)
    private Motocicleta moto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mecanico_id")
    private Usuario mecanico;

    @Column(nullable = false)
    private Instant fecha = Instant.now();

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoOrden estado = EstadoOrden.ABIERTA;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn = Instant.now();

    @PreUpdate
    void preUpdate() {
        this.actualizadoEn = Instant.now();
    }
}
