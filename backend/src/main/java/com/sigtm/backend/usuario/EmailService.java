package com.sigtm.backend.usuario;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCodigoVerificacion(String correoDestino, String codigo) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(correoDestino);
        mensaje.setSubject("MotoNexus - Codigo de verificacion");
        mensaje.setText("Tu codigo de verificacion es: " + codigo + "\n\nExpira en 10 minutos. Si no fuiste tu, ignora este correo.");
        mailSender.send(mensaje);
    }
}
