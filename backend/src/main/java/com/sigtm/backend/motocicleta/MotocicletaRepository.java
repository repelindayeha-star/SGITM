package com.sigtm.backend.motocicleta;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MotocicletaRepository extends JpaRepository<Motocicleta, Long> {
    List<Motocicleta> findByClienteId(Long clienteId);
}
