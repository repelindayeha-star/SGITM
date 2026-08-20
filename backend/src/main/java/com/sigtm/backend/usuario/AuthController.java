package com.sigtm.backend.usuario;

import com.sigtm.backend.security.AuthenticatedUser;
import com.sigtm.backend.security.CookieUtil;
import com.sigtm.backend.usuario.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Modulo "Autenticacion y cuentas": registro, login local/Google, verificacion por correo. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;
    private final UsuarioRepository usuarioRepository;

    public AuthController(AuthService authService, CookieUtil cookieUtil, UsuarioRepository usuarioRepository) {
        this.authService = authService;
        this.cookieUtil = cookieUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/register")
    public UsuarioResponse registrar(@Valid @RequestBody RegisterRequest request) {
        return authService.registrar(request);
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String token = authService.iniciarSesionLocal(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.construirCookieSesion(token).toString())
                .build();
    }

    @PostMapping("/login/google")
    public ResponseEntity<Void> loginGoogle(@Valid @RequestBody GoogleLoginRequest request, HttpServletRequest httpRequest) {
        String token = authService.iniciarSesionGoogle(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.construirCookieSesion(token).toString())
                .build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verificar(@Valid @RequestBody VerifyCodeRequest request) {
        authService.verificarCodigo(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify/resend")
    public ResponseEntity<Void> reenviarCodigo(@RequestParam String correo) {
        authService.reenviarCodigo(correo);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.construirCookieLogout().toString())
                .build();
    }

    @GetMapping("/me")
    public UsuarioResponse yo(@AuthenticationPrincipal AuthenticatedUser principal) {
        Usuario usuario = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new IllegalStateException("Usuario del token ya no existe."));
        return UsuarioResponse.from(usuario);
    }
}
