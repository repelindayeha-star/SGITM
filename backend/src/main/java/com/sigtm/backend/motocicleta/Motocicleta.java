package com.sigtm.backend.motocicleta;

import com.sigtm.backend.cliente.Cliente;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** Datos fijos de una moto. Un cliente puede tener varias; estos datos viven en un solo lugar y todas las ordenes la referencian. */
@Entity
@Table(name = "motocicletas")
@Getter
@Setter
@NoArgsConstructor
public class Motocicleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 60)
    private String marca;

    @Column(nullable = false, length = 60)
    private String modelo;

    @Column(nullable = false, unique = true, length = 15)
    private String placa;

    private Integer anio;

    private Integer cilindraje;

    @Column(length = 40)
    private String color;

    @Column(unique = true, length = 60)
    private String chasis;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn = Instant.now();

    @PreUpdate
    void preUpdate() {
        this.actualizadoEn = Instant.now();
    }
}
