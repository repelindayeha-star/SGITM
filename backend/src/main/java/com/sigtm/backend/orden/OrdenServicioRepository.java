package com.sigtm.backend.orden;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, Long> {
    List<OrdenServicio> findByMotoId(Long motoId);
    List<OrdenServicio> findByMotoClienteId(Long clienteId);
}
