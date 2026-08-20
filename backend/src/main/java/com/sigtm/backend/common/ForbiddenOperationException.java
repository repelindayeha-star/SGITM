package com.sigtm.backend.common;

/**
 * Lanzada cuando un usuario autenticado intenta acceder a un recurso que no le pertenece
 * (ej: un cliente intentando ver la moto de otro cliente). Esta validacion SIEMPRE se hace
 * en el Service, nunca solo ocultando botones en el frontend (prevencion de IDOR).
 */
public class ForbiddenOperationException extends RuntimeException {
    public ForbiddenOperationException(String message) {
        super(message);
    }
}
