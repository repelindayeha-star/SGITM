package com.sigtm.backend.common;

/** Lanzada cuando una entidad solicitada (cliente, moto, orden, etc.) no existe. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
