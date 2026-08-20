package com.sigtm.backend.orden.dto;

import jakarta.validation.constraints.NotNull;

public record OrdenRequest(@NotNull Long motoId, Long mecanicoId, String diagnostico) {}
