# MotoNexus (antes SIGTM)

Sistema de gestión para talleres de motocicletas. Proyecto ADSO-SENA, ficha 3114227,
Centro Manufactura Avanzada, Regional Antioquia. Instructor: Juan Carlos Quintero.

> Este repositorio empezó como una prueba de concepto en Node.js/Express/Prisma
> (commit inicial `feat: modelo de datos inicial...`). El equipo decidió construir
> el proyecto real sobre **Java + Spring Boot**, así que ese primer commit queda
> como historial (evidencia de que el trabajo empezó antes de esta fecha) pero el
> código activo del backend es el de la carpeta `backend/`.

## Qué hace

Un cliente registra sus motos (datos fijos: marca, modelo, placa, año, cilindraje,
color, chasis). El taller abre una orden de servicio por moto, registra el
diagnóstico y los ítems (pruebas realizadas, repuestos cambiados, mano de obra).
La factura se genera automáticamente a partir de esos ítems — nunca se vuelven a
digitar. El cliente tiene su propia cuenta y puede ver, en modo solo lectura, el
historial completo de cada una de sus motos (diagnósticos, repuestos, fechas).

## Stack técnico

| Capa | Tecnología |
|---|---|
| Backend | Java 21, Spring Boot 3.3, Spring Data JPA/Hibernate, Spring Security |
| Autenticación | JWT en cookie httpOnly, Google OAuth2 (verificación server-side), bcrypt, reCAPTCHA, verificación de correo por código |
| Migraciones de esquema | Flyway |
| Base de datos | PostgreSQL (Neon) |
| Frontend | React (Vite), React Router |

## Los 7 módulos

1. **Autenticación y cuentas** — registro/login local con verificación por correo, login con Google, JWT, reCAPTCHA.
2. **Clientes** — alta y consulta de clientes del taller.
3. **Motocicletas** — datos fijos por moto; un cliente puede tener varias.
4. **Órdenes de servicio / diagnóstico** — una orden por moto, con mecánico, fecha, diagnóstico y estado.
5. **Ítems de la orden** — pruebas, repuestos y mano de obra; alimentan la factura automáticamente.
6. **Facturación** — generada a partir de los ítems de órdenes cerradas, sin duplicar esa información.
7. **Portal del cliente** — vista de solo lectura que **reutiliza** los servicios de Motocicletas/Órdenes/Ítems con un filtro de propiedad, en vez de repetir su lógica.

Este último punto es la respuesta concreta a "que no haya redundancia entre los módulos":
el dato y la regla de negocio viven en un solo lugar (el módulo del taller); el portal
del cliente solo agrega la verificación "esto es tuyo" antes de mostrar lo mismo.

## Estructura del repositorio

```
MotoNexus/
├── backend/     Spring Boot (Maven) — ver backend/README y backend/.env.example
└── frontend/    React (Vite) — ver frontend/.env.example
```

## Cómo levantar el proyecto localmente

**Backend**
```
cd backend
cp .env.example .env   # llenar con la cadena real de Neon, secretos, etc. — nunca commitear .env
mvn spring-boot:run
```

**Frontend**
```
cd frontend
npm install
npm run dev
```

## Seguridad — decisiones ya tomadas

- El JWT viaja en una cookie `httpOnly` + `Secure` + `SameSite=None`, nunca en `localStorage` (evita robo por XSS).
- La autorización (que un cliente solo vea sus propias motos) se valida **siempre en el backend** (capa Service), nunca solo ocultando botones en el frontend — es la prevención de IDOR que pidió el profesor.
- El registro público (`/api/auth/register`) solo crea cuentas de rol `CLIENTE`. Las cuentas de rol `TALLER` (mecánicos/staff) se crean manualmente, no desde un endpoint público — de lo contrario cualquiera podría autoasignarse acceso a los datos de todos los clientes. **Esta es una decisión de diseño tomada por el equipo, pendiente de confirmar que el profesor esté de acuerdo.**
- El token de Google se verifica siempre del lado del servidor (nunca se confía en datos que el frontend diga que vienen de Google).
- Los códigos de verificación de correo se guardan hasheados (nunca en texto plano) y expiran en 10 minutos.

## Flujo de ramas

- `main` — siempre desplegable.
- `develop` — integración del equipo.
- `feature/<modulo>-<persona>` — una rama por tarea, mergeada a `develop` por PR.

## Equipo y reparto de tareas

| Integrante | Enfoque |
|---|---|
| Harrison Cadavid | Backend general |
| Dayana Perez | Backend + Seguridad |
| Yesica Gomez | Frontend + Test |

## Pendientes conocidos (no inventados, para que el equipo los revise)

- Integrar el widget real de reCAPTCHA en el frontend (por ahora el campo `recaptchaToken` se envía como placeholder).
- Integrar el botón oficial de Google Identity Services en el frontend.
- Definir el formato final de "pruebas" en el diagnóstico (por ahora es texto libre, como los repuestos y mano de obra).
- Confirmar con el profesor si el autoregistro de clientes (sin que el taller los cree primero) es el flujo correcto.
