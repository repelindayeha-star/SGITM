package com.sigtm.backend.item;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemOrdenRepository extends JpaRepository<ItemOrden, Long> {
    List<ItemOrden> findByOrdenId(Long ordenId);
    List<ItemOrden> findByOrdenIdIn(List<Long> ordenIds);
}
