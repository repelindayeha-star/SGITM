package com.sigtm.backend.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifica el id_token de Google SIEMPRE en el servidor (nunca confiar en un correo/nombre
 * que venga directo del frontend) usando la libreria oficial de Google.
 */
@Service
public class GoogleTokenVerifierService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService(@Value("${app.google.client-id}") String googleClientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    public record GooglePerfil(String googleId, String correo, boolean correoVerificado) {}

    public GooglePerfil verificar(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Token de Google invalido.");
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            return new GooglePerfil(
                    payload.getSubject(),
                    payload.getEmail(),
                    Boolean.TRUE.equals(payload.getEmailVerified())
            );
        } catch (GeneralSecurityException | java.io.IOException e) {
            throw new IllegalArgumentException("No se pudo verificar el token de Google.", e);
        }
    }
}
