package com.sigtm.backend.usuario;

import com.sigtm.backend.cliente.Cliente;
import com.sigtm.backend.cliente.ClienteRepository;
import com.sigtm.backend.security.GoogleTokenVerifierService;
import com.sigtm.backend.security.JwtService;
import com.sigtm.backend.usuario.dto.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Registro/login local y con Google, y verificacion de cuenta por correo.
 *
 * Decision de diseno (documentar/confirmar con el profesor): el registro publico
 * (/api/auth/register) SOLO crea cuentas de rol CLIENTE (autoregistro). Las cuentas
 * de rol TALLER (mecanicos/administradores) no se crean desde un endpoint publico,
 * se dan de alta manualmente -- de lo contrario cualquiera podria auto-asignarse
 * el rol TALLER y ver datos de todos los clientes.
 */
@Service
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final CodigoVerificacionRepository codigoRepository;
    private final RegistroSesionRepository registroSesionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RecaptchaService recaptchaService;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final EmailService emailService;

    public AuthService(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
                        CodigoVerificacionRepository codigoRepository, RegistroSesionRepository registroSesionRepository,
                        PasswordEncoder passwordEncoder, JwtService jwtService, RecaptchaService recaptchaService,
                        GoogleTokenVerifierService googleTokenVerifierService, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.codigoRepository = codigoRepository;
        this.registroSesionRepository = registroSesionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.recaptchaService = recaptchaService;
        this.googleTokenVerifierService = googleTokenVerifierService;
        this.emailService = emailService;
    }

    @Transactional
    public UsuarioResponse registrar(RegisterRequest request) {
        if (!recaptchaService.esValido(request.recaptchaToken())) {
            throw new IllegalArgumentException("Verificacion reCAPTCHA fallida.");
        }
        if (usuarioRepository.existsByCorreo(request.correo())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo.");
        }

        Usuario usuario = new Usuario();
        usuario.setCorreo(request.correo());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        usuario.setRol(Rol.CLIENTE);
        usuario.setCorreoVerificado(false);
        usuario = usuarioRepository.save(usuario);

        Cliente cliente = new Cliente();
        cliente.setUsuario(usuario);
        cliente.setNombre(request.nombre());
        cliente.setTelefono(request.telefono());
        cliente.setDocumento(request.documento());
        clienteRepository.save(cliente);

        enviarNuevoCodigoVerificacion(usuario);

        return UsuarioResponse.from(usuario);
    }

    @Transactional
    public String iniciarSesionLocal(LoginRequest request, String ip) {
        if (!recaptchaService.esValido(request.recaptchaToken())) {
            throw new IllegalArgumentException("Verificacion reCAPTCHA fallida.");
        }

        Usuario usuario = usuarioRepository.findByCorreo(request.correo()).orElse(null);

        boolean credencialesValidas = usuario != null
                && usuario.getPasswordHash() != null
                && passwordEncoder.matches(request.password(), usuario.getPasswordHash());

        registrarIntento(usuario, request.correo(), "LOCAL", credencialesValidas, ip);

        if (!credencialesValidas) {
            throw new IllegalArgumentException("Correo o contraseña incorrectos.");
        }
        if (!usuario.isCorreoVerificado()) {
            throw new IllegalArgumentException("Debes verificar tu correo antes de iniciar sesion.");
        }
        if (!usuario.isActivo()) {
            throw new IllegalArgumentException("Esta cuenta esta deshabilitada.");
        }

        return jwtService.generarToken(usuario.getId(), usuario.getCorreo(), usuario.getRol().name());
    }

    @Transactional
    public String iniciarSesionGoogle(GoogleLoginRequest request, String ip) {
        GoogleTokenVerifierService.GooglePerfil perfil = googleTokenVerifierService.verificar(request.idToken());

        Usuario usuario = usuarioRepository.findByGoogleId(perfil.googleId()).orElse(null);

        if (usuario == null) {
            usuario = usuarioRepository.findByCorreo(perfil.correo()).orElse(null);
            if (usuario == null) {
                // Autoregistro con Google: solo crea cuentas CLIENTE, igual que el registro local.
                usuario = new Usuario();
                usuario.setCorreo(perfil.correo());
                usuario.setGoogleId(perfil.googleId());
                usuario.setRol(Rol.CLIENTE);
                usuario.setCorreoVerificado(perfil.correoVerificado());
                usuario = usuarioRepository.save(usuario);

                Cliente cliente = new Cliente();
                cliente.setUsuario(usuario);
                cliente.setNombre(perfil.correo()); // el cliente puede completar su nombre despues
                clienteRepository.save(cliente);
            } else {
                usuario.setGoogleId(perfil.googleId());
                usuarioRepository.save(usuario);
            }
        }

        registrarIntento(usuario, perfil.correo(), "GOOGLE", true, ip);

        if (!usuario.isActivo()) {
            throw new IllegalArgumentException("Esta cuenta esta deshabilitada.");
        }

        return jwtService.generarToken(usuario.getId(), usuario.getCorreo(), usuario.getRol().name());
    }

    @Transactional
    public void verificarCodigo(VerifyCodeRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.correo())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada."));

        CodigoVerificacion codigo = codigoRepository
                .findFirstByUsuarioIdAndUsadoFalseOrderByCreadoEnDesc(usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("No hay un codigo pendiente. Solicita uno nuevo."));

        if (codigo.expirado()) {
            throw new IllegalArgumentException("El codigo expiro. Solicita uno nuevo.");
        }
        if (codigo.getIntentos() >= 5) {
            throw new IllegalArgumentException("Superaste el numero de intentos. Solicita un codigo nuevo.");
        }

        codigo.setIntentos(codigo.getIntentos() + 1);

        if (!passwordEncoder.matches(request.codigo(), codigo.getCodigoHash())) {
            codigoRepository.save(codigo);
            throw new IllegalArgumentException("Codigo incorrecto.");
        }

        codigo.setUsado(true);
        codigoRepository.save(codigo);

        usuario.setCorreoVerificado(true);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void reenviarCodigo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada."));
        if (usuario.isCorreoVerificado()) {
            throw new IllegalArgumentException("Esta cuenta ya esta verificada.");
        }
        enviarNuevoCodigoVerificacion(usuario);
    }

    private void enviarNuevoCodigoVerificacion(Usuario usuario) {
        String codigoPlano = String.format("%06d", RANDOM.nextInt(1_000_000));

        CodigoVerificacion codigo = new CodigoVerificacion();
        codigo.setUsuario(usuario);
        codigo.setCodigoHash(passwordEncoder.encode(codigoPlano)); // se guarda hasheado, nunca en texto plano
        codigo.setExpiraEn(Instant.now().plus(10, ChronoUnit.MINUTES));
        codigoRepository.save(codigo);

        emailService.enviarCodigoVerificacion(usuario.getCorreo(), codigoPlano);
    }

    private void registrarIntento(Usuario usuario, String correoIntento, String metodo, boolean exitoso, String ip) {
        RegistroSesion registro = new RegistroSesion();
        registro.setUsuario(usuario);
        registro.setCorreoIntento(correoIntento);
        registro.setMetodo(metodo);
        registro.setExitoso(exitoso);
        registro.setIp(ip);
        registroSesionRepository.save(registro);
    }
}
