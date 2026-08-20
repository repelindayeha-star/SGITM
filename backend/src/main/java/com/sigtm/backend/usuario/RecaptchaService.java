package com.sigtm.backend.usuario;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

/** Verifica el token de reCAPTCHA contra la API de Google antes de aceptar login/registro. */
@Service
public class RecaptchaService {

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    private final String secret;
    private final RestClient restClient = RestClient.create();

    public RecaptchaService(@Value("${app.security.recaptcha.secret}") String secret) {
        this.secret = secret;
    }

    public boolean esValido(String token) {
        if (token == null || token.isBlank()) return false;

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", secret);
        form.add("response", token);

        try {
            Map<String, Object> resultado = restClient.post()
                    .uri(VERIFY_URL)
                    .contentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);
            return resultado != null && Boolean.TRUE.equals(resultado.get("success"));
        } catch (Exception e) {
            // Si el servicio de Google falla, preferimos bloquear el intento a dejarlo pasar sin validar.
            return false;
        }
    }
}
