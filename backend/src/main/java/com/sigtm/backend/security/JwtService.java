package com.sigtm.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Firma y valida los JWT que viajan en una cookie httpOnly (nunca en localStorage,
 * para que un XSS no pueda robar el token).
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    // Si JWT_SECRET no se define por variable de entorno, application.yml cae en este
    // valor literal, que queda PUBLICO en el repositorio de GitHub. Cualquiera que lo
    // lea podria firmar tokens validos. Nunca debe usarse fuera de desarrollo local.
    private static final String SECRETO_POR_DEFECTO_INSEGURO =
            "CAMBIAR_ESTE_SECRETO_POR_UNO_REAL_DE_AL_MENOS_256_BITS";

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(@Value("${app.security.jwt.secret}") String secret,
                       @Value("${app.security.jwt.expiration-minutes:60}") long expirationMinutes) {
        if (SECRETO_POR_DEFECTO_INSEGURO.equals(secret)) {
            log.warn("!!! ATENCION: JWT_SECRET no esta configurado por variable de entorno. Se esta usando "
                    + "el valor por defecto de application.yml, que es publico en el repositorio de GitHub. "
                    + "Esto es aceptable SOLO en desarrollo local; antes de desplegar de verdad (o de mostrarlo "
                    + "al profesor como funcional en un servidor real) hay que definir JWT_SECRET en el .env "
                    + "con un valor propio de al menos 32 caracteres aleatorios.");
        }
        // El secreto debe tener al menos 256 bits (32 bytes) para HS256; si es mas corto,
        // Keys.hmacShaKeyFor lanza una excepcion aqui mismo, al arrancar la aplicacion.
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public String generarToken(Long usuarioId, String correo, String rol) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(usuarioId))
                .claim("correo", correo)
                .claim("rol", rol)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusSeconds(expirationMinutes * 60)))
                .signWith(key)
                .compact();
    }

    public Claims validarYObtenerClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationSeconds() {
        return expirationMinutes * 60;
    }
}
