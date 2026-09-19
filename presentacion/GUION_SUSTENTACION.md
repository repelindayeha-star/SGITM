# GUION DE SUSTENTACIÓN — SIGTM / Moto Nexus

**Ficha 3114227 · ADSO · Centro de Tecnología de la Manufactura Avanzada · Instructor Juan Carlos Quintero Romero**

Expositores: **Harrison Cadavid**, **Dayana Pérez**, **Yessika Gómez**.

---

## Antes de empezar — lista de cinco minutos

Esto no es parte del guion, pero si algo de esto falla, el guion no sirve.

1. El servidor corriendo (`npm run dev` en la raíz) y las pantallas corriendo (`npm run dev` en `frontend/`). Comprobar que `http://localhost:3001/api/health` responde `baseDatos: "ok"`.
2. La base de datos de Neon **despierta**. Se suspende sola: entrar una vez a la aplicación cinco minutos antes para que el primer arranque no tarde.
3. Navegador con **tres pestañas ya abiertas**:
   - Pestaña 1 — sesión iniciada como `recepcion@sigtm.com`
   - Pestaña 2 — sesión iniciada como `mecanico1@sigtm.com` (usar ventana de incógnito o segundo perfil)
   - Pestaña 3 — `localhost:5173/seguimiento`, sin sesión
4. El recuadro del captcha **ya resuelto** en las dos sesiones. No dejarlo para el momento.
5. El video de respaldo de la demo abierto en una cuarta pestaña, minimizado.
6. Zoom del navegador al **125 %**. En un auditorio, el texto al 100 % no se lee desde la cuarta fila.

**Reparto del tiempo:** 12 diapositivas más demo. Presentación ≈ 6 minutos, demo ≈ 4 minutos.

---

# DIAPOSITIVA 1 — PORTADA

### Qué se ve
Fondo casi negro. A la izquierda, **SIGTM** en grande y ámbar, y debajo la frase *"El dueño sabe dónde está su moto. Sin llamar al taller."* A la derecha, una captura de la pantalla pública de seguimiento. Abajo, los tres nombres y la ficha.

### Quién habla
**Harrison.** 10 segundos.

### Qué decimos
> "Buenas tardes. Somos Harrison, Dayana y Yessika Gómez. Traemos SIGTM, un sistema para talleres de motos. Y vamos a empezar por el problema."

### Qué señalamos
Nada. Que la miren mientras hablas.

### Transición
> "Piensen en la última vez que dejaron algo en un taller."

---

# DIAPOSITIVA 2 — EL PROBLEMA

### Qué se ve
Título **El problema**. Tres tarjetas con círculo numerado: *El cliente llama / y vuelve a llamar*, *No hay prueba / de lo que se arregló*, *Todo vive en papel / y en la memoria del dueño*. Abajo, en ámbar e itálica: *"El problema no es reparar la moto, sino que nadie pueda saber cómo va."*

### Quién habla
**Harrison.** 40 segundos.

### Qué decimos
> "Usted deja la moto un lunes. El martes quiere saber si ya la revisaron. ¿Qué hace? Llama. Y quien contesta es el mismo que está reparando otra moto.
>
> Y no es solo incómodo para el cliente. El taller también pierde: cuando el dueño no está, nadie sabe qué repuesto se usó ni en qué quedó la orden de ayer, porque eso está en una libreta o en la cabeza de alguien.
>
> El problema no es reparar la moto. Reparar la moto lo saben hacer. El problema es que nadie pueda saber cómo va."

### Qué señalamos
Al decir "llama", la primera tarjeta. Al decir "libreta", la tercera. La frase de abajo se lee mirando al jurado, no a la pantalla.

### Transición
> "Nosotros construimos una respuesta a eso."

---

# DIAPOSITIVA 3 — LA SOLUCIÓN

### Qué se ve
Título **La solución**. A la izquierda, tres pasos con círculo numerado: **Registra** / *la moto, el problema y la orden*; **Ordena** / *cada paso, sin que se pueda saltar ninguno*; **Muestra** / *el avance al dueño, desde su celular*. A la derecha, una captura grande del detalle de una orden.

### Quién habla
**Dayana.** 30 segundos.

### Qué decimos
> "SIGTM hace tres cosas. Registra: la moto, el problema y la orden de trabajo. Ordena: cada paso va en su lugar y el sistema no deja saltarse ninguno. Y muestra: el dueño de la moto ve el avance desde su celular.
>
> La tercera es la que casi ningún taller tiene, y es la que resuelve el problema de la diapositiva anterior."

### Qué señalamos
Los tres círculos, uno por uno, al nombrarlos. Después la captura de la derecha, con la mano abierta: "y esto es de verdad, no es un dibujo".

### Transición
> "Veamos cómo lo usa el taller por dentro."

---

# DIAPOSITIVA 4 — ASÍ LA USA UN TALLER

### Qué se ve
Cinco tarjetas en fila con flechas ámbar entre ellas: **Recibe** *la moto y abre la orden* → **Diagnostica** *y anota qué tiene* → **Cotiza** *y espera el visto bueno* → **Repara** *y sube la foto del trabajo* → **Entrega** *y factura*. Abajo, en gris: *"Mientras tanto, el dueño de la moto ve el avance con el código de su recibo. No tiene que llamar ni una vez."*

### Quién habla
**Dayana.** 40 segundos.

### Qué decimos
> "Este es el recorrido completo, y es el mismo que van a ver funcionando en un momento.
>
> Recepción recibe la moto y abre la orden. El mecánico diagnostica y anota qué tiene. Se cotiza, y ahí la orden se queda quieta hasta que el cliente diga que sí. Se repara, y el mecánico sube la foto del trabajo. Se entrega y se factura.
>
> Y lo importante: el sistema no deja saltarse pasos. Si la recepcionista intenta pasar una orden de *recibida* directo a *entregada*, la aplicación la rechaza y le dice a cuáles estados sí puede pasar. Eso no depende de que la gente se acuerde: está en el código."

### Qué señalamos
Recorre las cinco tarjetas con el dedo, de izquierda a derecha, al ritmo de las palabras. Al decir "no deja saltarse pasos", vuelve atrás desde la quinta hasta la primera con el dedo.

### Transición
> "¿Y qué puede hacer exactamente?"

---

# DIAPOSITIVA 5 — QUÉ PUEDE HACER

### Qué se ve
Nueve tarjetas en cuadrícula 3×3, cada una con una letra en círculo ámbar: Órdenes, Clientes y motos, Agenda de citas, Diagnóstico, Cotización, Inventario, Facturación, Portal del cliente, Reportes.

### Quién habla
**Yessika Gómez.** 25 segundos.

### Qué decimos
> "Estas son las nueve cosas que el sistema hace hoy. Todas funcionando, no en planes."

*(Silencio de tres segundos. Deja que el jurado la recorra con la vista.)*

> "Si quieren que profundicemos en alguna, con gusto en las preguntas."

### Qué señalamos
Nada. Esta diapositiva se mira, no se recita.

### ⚠️ Error que hay que evitar
**No leas las nueve en voz alta.** Se te van cuarenta segundos y aburres a todo el mundo. El jurado lee más rápido que tú.

### Transición
> "Y así se ve."

---

# DIAPOSITIVA 6 — ASÍ SE VE

### Qué se ve
Cuatro capturas grandes en 2×2, cada una con una etiqueta corta: *Las órdenes del taller*, *Diagnóstico y cotización*, *Lo que ve el dueño de la moto*, *Inventario y alertas*.

### Quién habla
**Dayana.** 30 segundos.

### Qué decimos
> "Esta es la recepcionista, con todas las órdenes del taller. Esta es la del mecánico, donde escribe el diagnóstico y arma la cotización. Esta es la que ve el dueño de la moto desde el celular. Y esta es la del administrador, con el inventario y las alertas de lo que se está acabando."

### Qué señalamos
Una por una, en el mismo orden en que las nombras.

### ⚠️ Condición
Si el día de la sustentación estas cuatro imágenes todavía tienen el **borde punteado**, **sáltate esta diapositiva** y ve directo a la 7. Una diapositiva con recuadros vacíos hace más daño que no tenerla.

### Transición
> "Déjenme contarles un caso de verdad."

---

# DIAPOSITIVA 7 — UN CASO REAL

### Qué se ve
A la izquierda, cuatro momentos con fecha: *4 de sept. — deja la Yamaha: la cadena salta*; *5 y 6 — el taller diagnostica y cotiza*; *7 de sept. — aprueba el trabajo*; *8 de sept. — saca el celular y consulta su código*. A la derecha, una tarjeta grande: **"En reparación desde el día 8"**, el código `OT-2026-DEMO05`, y la frase *"Sin llamar al taller, sin crear cuenta y sin instalar nada."*

### Quién habla
**Harrison.** 50 segundos. **Es la mejor diapositiva del deck.**

### Qué decimos
> "Esto no es un ejemplo inventado. Es una orden que está en nuestra base de datos ahora mismo, y es la que vamos a consultar en vivo en un minuto.
>
> El 4 de septiembre entra una Yamaha FZ. El problema: la cadena salta y el piñón está gastado. El cliente se va con un recibo que tiene un código.
>
> El 5 y el 6 el taller diagnostica y cotiza. El 7 el cliente aprueba. Y el 8, en lugar de llamar, saca el celular, escribe el código, y ve esto: **en reparación desde el día 8.**
>
> Sin llamar. Sin crear cuenta. Sin instalar nada."

### Qué señalamos
Los cuatro momentos de izquierda con el dedo, al ritmo de las fechas. Al final, la mano abierta sobre la tarjeta de la derecha y **quédate ahí en silencio un segundo**.

### Transición
> "Y ahora lo vamos a ver funcionando de verdad."

---

# DIAPOSITIVA 8 — DEMOSTRACIÓN EN VIVO

### Qué se ve
Título gigante **DEMOSTRACIÓN EN VIVO** en ámbar. Debajo, cinco círculos con flechas: Recibir → Diagnosticar → Cotizar → Reparar → Consultar.

### Quién habla
**Harrison.** 5 segundos, ni uno más.

### Qué decimos
> "Vamos a recibir una moto, diagnosticarla, cotizarla, repararla y entregarla. Y al final la vamos a consultar como lo haría su dueño."

### Qué señalamos
Nada. **Cambia de ventana inmediatamente.**

### ⚠️ Regla
Esta diapositiva se ve cinco segundos. Si te quedas explicándola pierdes el impulso. El protagonista de los próximos cuatro minutos es la aplicación.

### Transición
Ninguna. Se pasa a **GUION_DEMO.md**.

---

# — AQUÍ VA LA DEMOSTRACIÓN (≈ 4 minutos) —

---

# DIAPOSITIVA 9 — CÓMO ESTÁ CONSTRUIDA

### Qué se ve
A la izquierda, una pila con flechas hacia abajo: **Usuario** *(navegador, en computador o celular)* ▾ **Pantallas** *(React con Vite — veinte pantallas)* ▾ **Servidor** *(Node.js con Express — once áreas, 67 operaciones)* ▾ **Base de datos** *(PostgreSQL en la nube — trece tablas con historial)*. A la derecha, una tarjeta: **Lo que sostiene la confianza**, con cuatro puntos.

### Quién habla
**Harrison.** 40 segundos.

### Qué decimos
> "Por dentro está organizada en capas, y cada capa hace una sola cosa. Es como un taller: quien recibe en el mostrador no es el mismo que abre el motor, y quien abre el motor no es el que cobra. Por eso, cuando algo falla, se sabe dónde buscar.
>
> Corre en la nube o en el computador del taller, y se entra desde cualquier equipo o celular. No hay que comprar servidores.
>
> Y cuatro cosas sostienen la confianza: las contraseñas nunca se guardan en texto; cada usuario ve solo lo suyo aunque cambie la dirección en el navegador; la consulta pública no revela ni un dato personal; y cada cambio queda firmado con quién lo hizo y a qué hora."

### Qué señalamos
La pila de izquierda, de arriba abajo, con el dedo. Después los cuatro puntos de la tarjeta derecha.

### ⚠️ Error que hay que evitar
**No recites los nombres de las tecnologías.** Están en pantalla para el jurado técnico. Si alguien pregunta, respondes; si no, no los menciones.

### Transición
> "Y lo probamos."

---

# DIAPOSITIVA 10 — LO PROBAMOS

### Qué se ve
A la izquierda, seis marcas de verificación ámbar: *Los ocho estados y sus saltos*, *Los enlaces de recuperación*, *El límite de intentos*, *Los cinco pasos del cliente*, *El cálculo de los resúmenes*, *Avisos, reportes y fotos*. A la derecha, una tarjeta con tres números grandes: **41** *pruebas automáticas*, **0** *en rojo*, **3** *fallas de seguridad que nos encontramos a nosotros mismos, y corregimos*. Abajo, en itálica: *"Encontrar una falla propia y dejarla documentada vale más que no haberla tenido."*

### Quién habla
**Yessika Gómez.** 40 segundos. **Es la diapositiva que más respeto gana.**

### Qué decimos
> "Nos revisamos el código a nosotros mismos buscando fallas, y encontramos tres graves.
>
> La más fácil de entender es esta: un cliente podía cambiar un número en la dirección del navegador y ver los datos de otra persona. Nombre, teléfono, cotización. Eso ya está corregido: ahora el servidor responde que no está autorizado.
>
> Y sobre eso hay cuarenta y un pruebas automáticas que corren solas cada vez que cambiamos algo. Las cuarenta y uno están en verde.
>
> Encontrar una falla propia y dejarla documentada vale más que no haberla tenido."

### Qué señalamos
Al contar la falla, el número **3** de la tarjeta. La frase final se dice mirando al jurado.

### ⚠️ Cómo NO presentarla
No la presentes como una lista de errores que cometieron. Preséntala como **una auditoría que ustedes mismos se hicieron**. Es lo mismo, y suena completamente distinto.

### Transición
> "Y esto es lo que queda construido."

---

# DIAPOSITIVA 11 — ESTO ES LO QUE CONSTRUIMOS

### Qué se ve
Una captura grande del panel principal a la izquierda. A la derecha, tres ideas: **Nueve capacidades** *completas y funcionando*, **Una pantalla pública** *que responde sin pedir cuenta*, **Fotos del trabajo** *que el dueño de la moto puede ver*. Abajo, en gris pequeño, lo que queda pendiente.

### Quién habla
**Yessika Gómez.** 30 segundos.

### Qué decimos
> "Nueve capacidades completas y funcionando. Una pantalla pública que responde sin pedir cuenta. Y fotos del trabajo que el dueño de la moto puede ver.
>
> Y para ser claros con lo que falta: la aplicación hoy corre en el computador y en Docker, todavía no está publicada en internet. Eso, y conectar las cuentas del correo y del servicio de fotos, es el siguiente paso. Son trámites de contratación, no programación."

### Qué señalamos
Los tres puntos de la derecha. La línea de abajo se dice **de frente y sin pedir disculpas**.

### ⚠️ Por qué decimos lo que falta
Porque el jurado lo va a preguntar de todos modos, y adelantarse lo convierte en honestidad en vez de en un hueco que te encontraron.

### Transición
> "Para terminar."

---

# DIAPOSITIVA 12 — CIERRE

### Qué se ve
**SIGTM** en grande y ámbar. Debajo: *"No busca controlar el taller. Busca que el dueño de la moto no quede a ciegas."* Y **Gracias.** A la derecha, una captura de la aplicación. Abajo, los tres nombres.

### Quién habla
**Harrison**, con **los tres de pie**. 15 segundos.

### Qué decimos
> "SIGTM no busca controlar el taller. Busca que el dueño de la moto no quede a ciegas.
>
> Gracias. Quedamos atentos a sus preguntas."

### Qué señalamos
Nada.

### ⚠️ Lo más importante del cierre
**Di "gracias" y quédate en silencio.** No resumas otra vez. No agradezcas dos veces. No te disculpes por nada. El silencio esperando la primera pregunta se ve seguro; llenarlo con palabras de más, no.

---

## Resumen del reparto

| Diapositiva | Quién | Tiempo |
|---|---|---|
| 1 Portada | Harrison | 0:10 |
| 2 El problema | Harrison | 0:40 |
| 3 La solución | Dayana | 0:30 |
| 4 Así la usa un taller | Dayana | 0:40 |
| 5 Qué puede hacer | Yessika Gómez | 0:25 |
| 6 Así se ve | Dayana | 0:30 |
| 7 Un caso real | Harrison | 0:50 |
| 8 Demostración | Harrison | 0:05 |
| **DEMO** | **los tres** | **4:00** |
| 9 Cómo está construida | Harrison | 0:40 |
| 10 Lo probamos | Yessika Gómez | 0:40 |
| 11 Lo que construimos | Yessika Gómez | 0:30 |
| 12 Cierre | Harrison (los tres de pie) | 0:15 |

**Total ≈ 10 minutos.** Si les dieron menos tiempo, lo primero que se recorta es la diapositiva 5 y lo segundo la 9. Lo que **nunca** se recorta es la 7 y la demo.

---

## Lo que cada uno tiene que saber de memoria

**Harrison** — el problema, el caso real, la arquitectura en capas, y qué hacen los ocho estados. Es quien responde si preguntan por base de datos, seguridad o decisiones técnicas.

**Dayana** — el recorrido de los cinco pasos del taller, qué ve el cliente y qué NO ve, y para qué sirve cada una de las cuatro pantallas. Es quien maneja el computador durante la demo.

**Yessika Gómez** — las nueve capacidades, las tres fallas corregidas y cómo se corrigieron, qué cubren las pruebas, y qué está pendiente y por qué. Es quien responde si preguntan por calidad o por el estado real del proyecto.
