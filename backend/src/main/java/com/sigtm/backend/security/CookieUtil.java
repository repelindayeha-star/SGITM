package com.sigtm.backend.security;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    private final JwtProperties jwtProperties;
    private final JwtService jwtService;

    public CookieUtil(JwtProperties jwtProperties, JwtService jwtService) {
        this.jwtProperties = jwtProperties;
        this.jwtService = jwtService;
    }

    /** Cookie httpOnly + secure + SameSite=None (frontend y backend en dominios distintos). */
    public ResponseCookie construirCookieSesion(String token) {
        return ResponseCookie.from(jwtProperties.getCookieName(), token)
                .httpOnly(true)
                .secure(true) // en local sobre http, el navegador la ignora; en produccion debe ir sobre https
                .sameSite("None")
                .path("/")
                .maxAge(jwtService.getExpirationSeconds())
                .build();
    }

    public ResponseCookie construirCookieLogout() {
        return ResponseCookie.from(jwtProperties.getCookieName(), "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();
    }
}
