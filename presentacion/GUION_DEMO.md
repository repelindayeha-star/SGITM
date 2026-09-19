# GUION DE DEMOSTRACIÓN — SIGTM / Moto Nexus

**Duración: 4 minutos.** Va justo después de la diapositiva 8.

---

## Antes de empezar

### Cuentas (contraseña `Sigtm2026*` en todas)

| Correo | Rol | Nombre en el sistema |
|---|---|---|
| `recepcion@sigtm.com` | Recepcionista | Laura Restrepo |
| `mecanico1@sigtm.com` | Mecánico | Andrés Gómez |
| `admin@sigtm.com` | Administrador | Administrador SIGTM |
| `cliente@sigtm.com` | Cliente | — |

### Pestañas abiertas ANTES de subir a exponer

- **Pestaña A** — `localhost:5173` con sesión de **recepción** ya iniciada, en la lista de órdenes
- **Pestaña B** — ventana de **incógnito**, `localhost:5173` con sesión de **mecánico1** ya iniciada
- **Pestaña C** — ventana de **incógnito**, `localhost:5173/seguimiento`, sin sesión
- **Pestaña D** — el video de respaldo, minimizada

**El captcha ya resuelto en A y B.** Resolverlo en vivo se come cuarenta segundos y se ve mal.

### Quién maneja el computador
**Dayana.** Harrison y Yessika Gómez hablan. Quien habla no maneja el mouse: se traba.

### Datos que se van a escribir (apréndanlos, no los improvisen)

- Cliente: **Marcela Ospina** · `marcela.ospina@correo.com` · `3145558822`
- Moto: **Bajaj** · **Pulsar NS 200** · año **2022** · placa **MXK12E**
- Problema: **Frenos delanteros hacen ruido y no responden bien**
- Mano de obra: **80000**
- Repuesto: **pastillas de freno**, cantidad **1**

> La placa `MXK12E` no debe existir ya en la base. Si el sistema la rechaza por duplicada, cambia la última letra y sigue sin detenerte — y aprovecha: *"miren, no deja repetir placas"*.

---

# PASO 1 — RECIBIR LA MOTO (50 segundos)

**Pantalla:** Pestaña A, sesión de recepción.

**Acción:** Clientes → **Nuevo cliente**. Escribe nombre, correo y teléfono. Guardar.

> **Ojo con esto, que es nuevo y es lo que más gusta:** en esa pantalla **no hay campo de contraseña**. Sale un aviso que dice *"No escribas ninguna contraseña"*. Señálalo.
Luego Motocicletas → **Nueva** → selecciona a Marcela, marca, modelo, año y placa. Guardar.
Luego Órdenes → **Nueva orden** → selecciona la moto, escribe el problema. Guardar.

**Qué se muestra:** el código que acaba de nacer, con formato `OT-2026-XXXXXX`.

**Quién habla:** **Harrison**.

> "Llega Marcela con una Pulsar. Recepción la registra, registra la moto, y abre la orden de trabajo.
>
> Fíjense en esto —" *(señala el código en pantalla)* "— **ese código lo acaba de generar el sistema**. Ese es el que va impreso en el recibo que se le entrega a Marcela, y es con el que ella va a poder consultar su moto sin llamar. Guárdenlo en la cabeza, que volvemos a él al final."

**Y si quieres ganarte un punto extra**, añade esto señalando el aviso del formulario:

> "Y noten una cosa: la recepcionista **no le pone contraseña al cliente**. No hay ni campo para eso. Al cliente le llega un código a su correo y él elige la suya. Nadie del taller conoce la contraseña de ningún cliente."

**Qué señalamos:** el código, y **léelo en voz alta**. El jurado tiene que reconocerlo cuando reaparezca en el paso 5.

**Cómo pasamos:** *"Ahora la moto pasa al taller."*

---

# PASO 2 — EL SISTEMA NO DEJA SALTARSE PASOS (35 segundos)

**Pantalla:** la misma orden que acabamos de crear.

**Acción:** en el selector de estado, intenta pasar de **Recibida** directo a **Entregada**.

**Qué se muestra:** el sistema **lo rechaza** y dice a cuáles estados sí se puede pasar.

**Quién habla:** **Harrison**.

> "Voy a intentar hacer trampa: la moto acaba de entrar y voy a marcarla como entregada, sin diagnóstico, sin cotización y sin reparación.
>
> No me deja. Y no me deja porque esa regla está en el servidor, no en la pantalla. Aunque alguien se saltara la interfaz, tampoco podría. Esto es lo que hace que el historial de un taller signifique algo."

*(Ahora sí, pásala a **En diagnóstico**.)*

**Qué señalamos:** el mensaje de error, y después el estado que sí cambió.

### ⚠️ Este es el momento más valioso de la demo
Es la única parte donde se **ve** una regla de negocio defendiéndose sola. No lo pases rápido.

**Cómo pasamos:** *"Ahora entra el mecánico."*

---

# PASO 3 — DIAGNOSTICAR Y COTIZAR (60 segundos)

**Pantalla:** Pestaña B, sesión de **mecánico1**.

**Acción:** abre la orden. Registra el diagnóstico. Añade mano de obra **80000**. Añade el repuesto **pastillas de freno**, cantidad 1. Guarda.

**Qué se muestra:** el total calculado solo — mano de obra más cada ítem por su cantidad.

**Quién habla:** **Dayana** (mientras Harrison maneja; aquí se cambian).

> "Esta es la pantalla del mecánico, y noten que es **otra cuenta**. Él ve sus órdenes asignadas, no todas las del taller ni las de otro mecánico.
>
> Escribe qué tiene la moto, pone la mano de obra y agrega los repuestos. **El total lo calcula el sistema**, no él con una calculadora aparte. Y cada repuesto que agrega aquí queda enlazado con el inventario."

**Qué señalamos:** el total, cuando cambie solo al agregar el repuesto.

**Cómo pasamos:** *"Marcela aprueba, y el trabajo arranca."*

---

# PASO 4 — REPARAR Y SUBIR LA FOTO (40 segundos)

**Pantalla:** la misma, sesión de mecánico.

**Acción:** pasa la orden a **Aprobada** y después a **En reparación**. Sube una foto desde la galería de evidencias.

**Qué se muestra:** la foto quedando asociada a la orden.

**Quién habla:** **Dayana**.

> "Aprobada, y a reparación. Y aquí el mecánico sube la foto del trabajo, desde el celular si quiere.
>
> Esto es lo que cambia la conversación en un taller: ya no es *'confíe en que le cambiamos la pastilla'*. Es *'mire la pastilla'*."

### ⚠️ Si el servicio de fotos aún no está conectado
La foto no se guarda en la nube. **No lo escondas, dilo de una vez y sigue:**

> "El módulo está construido y probado; lo que falta es la cuenta del servicio de imágenes, que es un trámite. Hoy se ve la pantalla, mañana se ve la foto."

**Cómo pasamos:** *"Y ahora lo importante: qué ve Marcela."*

---

# PASO 5 — LO QUE VE EL DUEÑO DE LA MOTO (55 segundos)

**Pantalla:** Pestaña C — **incógnito, sin sesión**.

**Acción:** escribe el código del paso 1 y consulta.

**Qué se muestra:** la línea de tiempo de cinco pasos, con la fecha de cada uno y el paso actual resaltado.

**Quién habla:** **Harrison**.

> "Esta ventana está en modo incógnito. **No hay sesión iniciada, no hay cuenta, no hay contraseña.** Es exactamente lo que vería Marcela desde su celular.
>
> Escribo el código del recibo —el mismo de hace tres minutos— y ahí está su moto: en reparación, con la fecha de cada paso.
>
> Y miren lo que **no** aparece: ni el nombre de Marcela, ni su teléfono, ni su correo, ni la cotización, ni la factura. Este enlace ella lo puede reenviar por WhatsApp a quien quiera y no expone a nadie.
>
> Y una cosa más: Marcela nunca lee *'en cotización'*. Lee *'la estamos revisando'*. Los ocho estados internos le llegan resumidos en cinco pasos en su idioma."

**Qué señalamos:** la línea de tiempo. Después **pasa la mano por donde NO hay datos** — ese gesto es el que vende la diapositiva.

### Opcional, si va sobrado de tiempo (15 segundos más)
Escribe un código inventado, `OT-2026-ZZZZZZ`:

> "Y un código que no existe responde lo mismo que uno equivocado: nada. No se puede ir adivinando códigos para ver órdenes ajenas."

**Cómo pasamos:** *"Cerramos el ciclo."*

---

# PASO 6 — CERRAR Y FACTURAR (25 segundos)

**Pantalla:** Pestaña A, recepción.

**Acción:** pasa la orden a **Lista** y luego a **Entregada**. Muestra la factura generada.

**Quién habla:** **Dayana**.

> "Lista para recoger, entregada, y la factura queda con el detalle de cada ítem. El ciclo completo, de la moto entrando a la factura, en una sola aplicación."

**Qué señalamos:** el detalle de la factura, un segundo. No te detengas aquí.

**Cómo pasamos:** *"Y una última cosa antes de volver."*

---

# PASO 7 — CERRAR LA DEMO (20 segundos)

**Pantalla:** vuelve a la Pestaña A y abre el **historial de la orden**.

**Quién habla:** **Harrison**.

> "Y todo lo que acaban de ver quedó registrado: cada cambio de estado, con quién lo hizo y a qué hora. Esto no se puede reescribir.
>
> Volvemos a la presentación para contarles qué hay detrás."

**Qué señalamos:** la lista del historial con los nombres y las horas.

**Acción final:** **Alt+Tab a la presentación, diapositiva 9.** Que no te vean buscando la ventana.

---

## Reloj

| Paso | Tiempo |
|---|---|
| 1 Recibir la moto | 0:50 |
| 2 El salto rechazado | 0:35 |
| 3 Diagnosticar y cotizar | 1:00 |
| 4 Reparar y foto | 0:40 |
| 5 Lo que ve el cliente | 0:55 |
| 6 Cerrar y facturar | 0:25 |
| 7 Historial y salida | 0:20 |
| **Total** | **≈ 4:05** |

**Si van retrasados**, lo primero que se recorta es el paso 6 (24 s) y lo segundo el paso 4 (40 s).
**Lo que NUNCA se recorta es el paso 2 y el paso 5.** Esos dos son la demo.

---

## Si algo falla

| Qué pasa | Qué haces |
|---|---|
| La primera pantalla tarda en cargar | Es la base de datos despertando. Di: *"la base está en la nube y se suspende sola cuando no se usa; ahorita arranca"*. Sigue hablando. Máximo 10 segundos. |
| Una pantalla no responde | **No repitas el clic.** Recarga con F5 una sola vez. |
| Falla algo a los 10 segundos | *"Esto lo tenemos grabado, vamos al video"*. Pestaña D. Sin disculpas largas. |
| Se cae la red | La aplicación necesita internet para la base de datos. Video de respaldo, directo. |
| El captcha se reinició | Pasa a la pestaña que sí tenga sesión y reordena los pasos. Por eso hay dos sesiones abiertas. |
| Sale *"Demasiados intentos"* | **Es el sistema protegiéndose, no un fallo.** Pasa si ensayaron la demo muchas veces seguidas. Se limpia reiniciando el servidor (Ctrl+C y `npm run dev`). **Hazlo antes de subir a exponer, no en vivo.** |

**La regla:** diez segundos de pantalla congelada y se pasa al video. Nadie recuerda que hubo video; todos recuerdan un minuto de silencio incómodo.

---

## Grabar el video de respaldo

Grábenlo **el día antes**, haciendo exactamente estos siete pasos, sin narración y sin cortes. Que dure lo mismo, 4 minutos. Si toca usarlo, uno de ustedes narra encima en vivo con este mismo guion.

No es pesimismo: es lo que separa una demostración que sale bien de una que sale bien **siempre**.
