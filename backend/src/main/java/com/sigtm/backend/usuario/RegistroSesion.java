package com.sigtm.backend.usuario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** Auditoria de inicios de sesion (exitosos y fallidos), requisito del profesor. */
@Entity
@Table(name = "registros_sesion")
@Getter
@Setter
@NoArgsConstructor
public class RegistroSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "correo_intento")
    private String correoIntento;

    private String ip;

    @Column(nullable = false, length = 20)
    private String metodo; // LOCAL | GOOGLE

    @Column(nullable = false)
    private boolean exitoso;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();
}
