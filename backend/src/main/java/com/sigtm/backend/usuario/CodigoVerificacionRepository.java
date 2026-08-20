package com.sigtm.backend.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodigoVerificacionRepository extends JpaRepository<CodigoVerificacion, Long> {
    Optional<CodigoVerificacion> findFirstByUsuarioIdAndUsadoFalseOrderByCreadoEnDesc(Long usuarioId);
}
