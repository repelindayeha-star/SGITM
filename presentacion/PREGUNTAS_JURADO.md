# PREGUNTAS DEL JURADO — SIGTM / Moto Nexus

Cada pregunta trae una **respuesta corta** (la que se dice de memoria, 10–20 segundos) y una **respuesta ampliada** (solo si el jurado insiste).

**Regla que no se rompe:** si algo no está hecho, se dice que no está hecho. Un jurado perdona un pendiente declarado; no perdona que lo pillen inflando.

**Quién responde qué:**
- **Harrison** — arquitectura, base de datos, seguridad, decisiones técnicas, backend
- **Dayana** — producto, frontend, experiencia de uso, funcionalidades
- **Yessika Gómez** — pruebas, calidad, estado real del proyecto, documentación

---

# PRODUCTO

### ¿Qué es SIGTM en una frase?
**Corta:** Un sistema para talleres de motos que lleva la orden de trabajo de punta a punta y deja que el dueño de la moto vea el avance desde su celular, sin llamar y sin crear cuenta.

**Ampliada:** Cubre el ciclo completo —recepción, diagnóstico, cotización por ítems, aprobación, reparación, entrega y factura— sobre una máquina de ocho estados que no permite saltos. Lo que lo diferencia de una libreta o de una hoja de cálculo es la consulta pública: cada orden nace con un código, ese código va en el recibo, y con él cualquiera consulta el avance sin iniciar sesión.

### ¿A quién va dirigido?
**Corta:** A talleres pequeños y medianos, los que hoy llevan las órdenes en libreta.

**Ampliada:** No intenta competir con un ERP. Un taller de dos o tres mecánicos que hoy anota en papel puede usarlo desde cualquier computador o celular sin cambiar de equipos.

### ¿Qué lo diferencia de un sistema de gestión cualquiera?
**Corta:** Que el cliente final es un usuario del sistema, no solo un registro adentro.

**Ampliada:** La mayoría de sistemas de taller son hacia adentro: el taller registra y el taller consulta. Aquí hay una pantalla pensada para alguien que no trabaja en el taller, que no tiene cuenta y que probablemente entra desde un celular en la calle. Eso obligó a decisiones concretas: los ocho estados internos se traducen a cinco pasos en lenguaje de cliente, y la respuesta pública devuelve una lista explícita de campos para no filtrar datos personales.

### ¿Está en producción?
**Corta:** No. Hoy corre en el computador y en Docker. Publicarlo en internet es el siguiente paso.

**Ampliada:** La aplicación está empaquetada con Docker y tiene integración continua, así que el despliegue es un trámite de plataforma, no trabajo de programación. Lo que falta es contratar el alojamiento y conectar las cuentas del correo y del servicio de imágenes.

---

# PROBLEMA

### ¿Cómo identificaron el problema?
**Corta:** Del funcionamiento normal de un taller: el cliente deja la moto y se queda sin información, y el taller pierde la trazabilidad de lo que hizo.

**Ampliada:** El problema tiene dos caras. Hacia afuera, el cliente no tiene forma de saber en qué va su moto salvo llamando, y cada llamada interrumpe a alguien que está trabajando. Hacia adentro, si la orden vive en una libreta, nadie sabe qué repuesto se usó ni quién autorizó qué, y eso solo duele cuando hay un reclamo.

### ¿Por qué es un problema que valga la pena resolver con software?
**Corta:** Porque las dos caras se resuelven con la misma pieza: si la orden está registrada y con historial, el cliente puede consultarla y el taller puede sustentarla.

---

# CLIENTE / TALLER

### ¿Qué gana el taller con esto?
**Corta:** Deja de contestar la misma llamada varias veces al día, y tiene el historial de cada trabajo con quién lo hizo y cuándo.

**Ampliada:** Y suma tres cosas concretas: el inventario avisa cuando un repuesto baja del mínimo, la cotización se calcula sola —mano de obra más cada ítem por su cantidad—, y cada cambio de estado queda firmado. Frente a un reclamo, el taller tiene con qué responder.

**⚠️ Si preguntan "¿cuánto tiempo ahorra?" o "¿en cuánto bajan las llamadas?":** *"No tenemos ese dato. El sistema no se ha usado en un taller real todavía, así que cualquier número que diéramos sería inventado. Lo que sí podemos mostrar es que la consulta funciona."* **No des un porcentaje.**

### ¿Lo probaron con un taller real?
**Corta:** No. Todavía no se ha usado en un taller en operación.

**Ampliada:** Está probado con datos de demostración que cubren los ocho estados y los cuatro roles. Ponerlo en un taller real es el siguiente paso natural, y para eso hace falta antes publicarlo en internet.

### ¿El cliente necesita instalar algo?
**Corta:** No. Abre el navegador del celular, escribe el código del recibo y ya.

---

# FUNCIONALIDADES

### ¿Qué puede hacer el sistema?
**Corta:** Órdenes de trabajo, clientes y motos, agenda de citas, diagnóstico, cotización, inventario, facturación, portal del cliente y reportes en PDF y Excel.

### ¿Qué son los ocho estados?
**Corta:** Recibida, En diagnóstico, En cotización, Aprobada, En reparación, Lista, Entregada y Cancelada. El sistema no permite saltarse ninguno.

**Ampliada:** Las transiciones válidas están definidas en el servidor. Si alguien intenta pasar de Recibida a Entregada, la petición se rechaza con un mensaje que enumera los estados a los que sí puede pasar. Está en el servidor y no en la pantalla a propósito: aunque alguien llamara la API directamente, tampoco podría.

### ¿Por qué el cliente ve cinco pasos y no ocho?
**Corta:** Porque para el dueño de la moto, *Aprobada* y *En reparación* son el mismo momento: están trabajando en su moto.

**Ampliada:** Los cinco pasos son: Recibimos tu moto, La estamos revisando, En reparación, Lista para recoger, Entregada. La traducción está en un solo archivo, con su espejo en el frontend, y tiene diez pruebas automáticas. Nos importó que el correo y la pantalla digan exactamente lo mismo: si dicen cosas distintas, el cliente llama al taller a preguntar cuál de las dos es verdad, que es justo la llamada que el sistema existe para evitar.

### ¿Los roles qué pueden y qué no?
**Corta:** Cuatro roles. El administrador supervisa pero no crea órdenes; la recepcionista opera el taller; el mecánico ve solo sus órdenes; el cliente ve solo lo suyo.

**Ampliada:** Que el administrador no cree órdenes es una decisión de negocio, no una limitación técnica: quien recibe la moto es recepción. Y el aislamiento del cliente no es solo del menú: hay una comprobación de propiedad en el servidor sobre órdenes, clientes, motos y citas. Si un cliente cambia el identificador en la dirección para pedir el expediente de otro, responde 403.

### Si la recepcionista registra a un cliente, ¿cómo entra ese cliente al portal?
**Corta:** Con "Olvidé mi contraseña". La recepcionista nunca le inventa una clave ni se la pide en el mostrador: el cliente queda registrado, y cuando quiera entrar pide el enlace con su correo y se pone la suya.

**Ampliada:** En el esquema, todo cliente cuelga de un usuario, así que registrarlo ya le crea la cuenta con rol de cliente. Lo que no tiene es contraseña utilizable, a propósito. Por eso el módulo de recuperación no es un extra: es **la única puerta de entrada al portal** para un cliente registrado en el mostrador. Y de paso resuelve un problema de privacidad: nadie del taller conoce la contraseña de un cliente.

**⚠️ Si preguntan por qué los clientes de la demostración no entran:** Marcela, Andrés y Luisa son clientes del taller, creados para que las órdenes tengan dueño. La semilla les deja una contraseña no utilizable justamente porque nadie debe poder entrar con ellos. La cuenta de cliente con la que sí se entra es `cliente@sigtm.com`.

### ¿Las fotos del trabajo funcionan?
**Corta:** El módulo está construido y probado, pero sin las claves del servicio de imágenes las fotos todavía no se guardan en la nube.

**Ampliada:** Está la tabla, el servicio de almacenamiento, el middleware de subida, el controlador, las rutas y las comprobaciones de integración. Lo que falta es la cuenta del proveedor, que es un trámite de contratación.

---

# ARQUITECTURA

### ¿Cómo está organizado el proyecto?
**Corta:** En capas: rutas, validadores, controladores, servicios y repositorios. Solo los repositorios hablan con la base de datos.

**Ampliada:** Las rutas definen qué se puede pedir; los validadores rechazan lo mal formado antes de tocar la lógica; los controladores traducen HTTP a llamadas de servicio y no tienen reglas de negocio; los servicios son donde viven las reglas —transiciones, cálculo de cotización, control de stock—; y los repositorios son la única capa que consulta la base. Ninguna capa se salta a la siguiente. La ventaja práctica es que cuando algo falla, se sabe en qué capa buscar.

### ¿Por qué esa separación y no todo junto?
**Corta:** Porque las reglas del taller tienen que poder probarse sin levantar una base de datos, y así se puede.

**Ampliada:** Las 41 pruebas de unidad corren en dos décimas de segundo sin tocar la base, precisamente porque la lógica de estados, la traducción a pasos de cliente y los cálculos están en módulos que no saben nada de Prisma.

### ¿Cuántas operaciones expone el servidor?
**Corta:** 67 operaciones repartidas en once áreas.

**Ampliada:** Y ese número está verificado contra el código, no contado a mano: hay un guion en `herramientas/listar-endpoints.js` que carga los routers y lista lo que el servidor monta de verdad. Lo construimos porque al contrastar la documentación con el código encontramos cuatro endpoints que figuraban documentados y no existían.

---

# FRONTEND

### ¿Con qué están hechas las pantallas?
**Corta:** React con Vite, y Tailwind para los estilos. Veinte pantallas.

### ¿Es responsive?
**Corta:** Sí. La pantalla pública de seguimiento está pensada para celular, que es donde la va a abrir el cliente.

### ¿Cómo manejan los permisos en la pantalla?
**Corta:** El menú cambia según el rol, pero el permiso real lo impone el servidor.

**Ampliada:** Ocultar un botón es comodidad, no seguridad. Cada operación se vuelve a comprobar en el servidor. Hay una pantalla de "no autorizado" para cuando alguien llega a una ruta que no le corresponde.

---

# BACKEND

### ¿Con qué está hecho el servidor?
**Corta:** Node.js con Express, y Prisma para hablar con PostgreSQL.

### ¿Por qué Node y no otro lenguaje?
**Corta:** Porque el equipo ya trabajaba en JavaScript en el frontend, y usar el mismo lenguaje en los dos lados nos dejó compartir la lógica de traducción de estados.

**Ampliada:** El archivo que traduce los ocho estados a los cinco pasos del cliente existe en los dos lados y dice lo mismo. Con lenguajes distintos habría que mantener dos versiones y arriesgarse a que se desincronicen.

### ¿Qué pasa si el servidor de correo está caído?
**Corta:** La orden se guarda igual. El envío de correo nunca tumba la operación que lo disparó.

**Ampliada:** Es deliberado: la función de envío captura sus propios errores, los registra en consola y devuelve si logró enviar o no. Si no se puede avisar a un cliente de que su moto está lista, la moto igual está lista y la orden igual tiene que quedar guardada.

---

# BASE DE DATOS

### ¿Qué base de datos usan?
**Corta:** PostgreSQL, alojada en la nube. Trece tablas.

### ¿Por qué PostgreSQL?
**Corta:** Porque los datos de un taller son claramente relacionales: un cliente tiene motos, una moto tiene órdenes, una orden tiene ítems.

**Ampliada:** Y porque necesitábamos transacciones de verdad. El cambio de estado de una orden y su registro en el historial se escriben en la misma transacción: o pasan los dos, o no pasa ninguno. Si se hicieran sueltas y fallara la segunda, quedaría un cambio de estado sin rastro de quién lo hizo.

### ¿Cómo manejan los cambios de esquema?
**Corta:** Con migraciones versionadas de Prisma, que quedan en el repositorio.

**Ampliada:** Cualquiera puede clonar el proyecto y reconstruir el esquema desde cero ejecutando las migraciones en orden, más una semilla que carga datos de demostración con los ocho estados cubiertos.

### ¿Qué es la tabla de historial?
**Corta:** Guarda cada cambio de estado de cada orden, con quién lo hizo y a qué hora. No se reescribe.

**⚠️ Dato honesto si preguntan:** Esa tabla faltaba en una versión anterior y el registro de auditoría fallaba en tiempo de ejecución. Lo detectamos, creamos la migración y lo corregimos. Si preguntan, se cuenta; queda mejor que ocultarlo.

---

# SEGURIDAD

### ¿Cómo guardan las contraseñas?
**Corta:** Cifradas con bcrypt. Nunca en texto plano, ni siquiera en los registros del sistema.

### ¿Cómo funciona la sesión?
**Corta:** Con un token firmado que lleva el identificador y el rol del usuario.

**Ampliada:** Y hay una defensa extra: se guarda la fecha del último cambio de contraseña y se compara con la fecha de emisión del token. Si alguien cambia su contraseña, las sesiones abiertas de antes dejan de valer automáticamente.

### ¿Cómo funciona la recuperación de contraseña?
**Corta:** Se envía un enlace que sirve una sola vez y caduca. En la base no se guarda el enlace, se guarda su huella.

**Ampliada:** El token se genera con un generador criptográfico, no con `Math.random`. En la base se almacena solo su hash SHA-256, así que aunque alguien leyera la tabla no podría reconstruir enlaces válidos. Al usarse queda marcado como gastado, se invalidan los anteriores del mismo usuario, y al cambiar la contraseña se cierran las sesiones abiertas. Además, pedir recuperación no revela si un correo existe o no: la respuesta es la misma en ambos casos.

### ¿Qué protege la consulta pública?
**Corta:** Devuelve una lista explícita de campos: estado, avance y datos de la moto. Nada más.

**Ampliada:** No es que se filtre lo que sobra: es que se enumera lo que se entrega. Ni nombre, ni teléfono, ni correo, ni cotización, ni factura. Y un código que no existe responde igual que uno equivocado, para que no se puedan ir adivinando códigos.

### ¿Encontraron vulnerabilidades?
**Corta:** Sí, tres, y nos las encontramos nosotros mismos auditando el código. Las tres están corregidas.

**Ampliada:**
1. **Escalada de privilegios** — el registro público tomaba el rol del cuerpo de la petición, así que una llamada podía crear un administrador. Ahora el rol se fuerza a cliente en el servidor y el validador rechaza cualquier otro.
2. **Acceso cruzado entre clientes** — cambiando un identificador en la dirección, un cliente veía los datos de otro. Ahora hay una comprobación de propiedad sobre órdenes, clientes, motos y citas, que responde 403.
3. **Fuga en la consulta pública** — devolvía el expediente completo, con nombre, correo, cotización y factura. Ahora devuelve la proyección explícita.

### ¿Y contra intentos automatizados?
**Corta:** Hay captcha en el ingreso y límites de intentos por ruta.

**Ampliada:** Los límites están separados por operación —envío de correo, registro, comprobación y restablecimiento tienen contadores distintos— porque compartir un contador hace que una operación agote el cupo de otra. Eso lo descubrimos, precisamente, cuando una prueba de integración empezó a fallar por esa razón.

**⚠️ Limitación honesta si profundizan:** los límites de intentos viven en la memoria del proceso. Con un solo servidor funcionan bien; si mañana se despliegan varios servidores en paralelo, habría que moverlos a un almacén compartido.

---

# PRUEBAS

### ¿Cómo probaron el sistema?
**Corta:** 41 pruebas automáticas que corren sin base de datos, más cuatro guiones de integración que recorren el sistema contra la base real. Las 41 están en verde.

**Ampliada:** Las de unidad cubren la máquina de estados, los tokens de seguridad, el límite de intentos, la traducción a los cinco pasos del cliente y el cálculo de los resúmenes. Las de integración recorren recuperación de contraseña, avisos de cambio de estado, reportes y evidencias fotográficas.

### ¿Se ejecutan solas?
**Corta:** Sí, hay integración continua: cada cambio pasa por las pruebas antes de entrar.

### ¿Encontraron errores con las pruebas?
**Corta:** Sí. El más claro fue un `NaN` en el reporte de Excel.

**Ampliada:** La consulta devolvía un arreglo y el código lo leía como si fuera un objeto, así que el resumen salía con un valor vacío. Lo aislamos en un módulo propio, le escribimos nueve pruebas que cubren las dos formas del dato, y quedó corregido.

**⚠️ Lo que NO tenemos, si preguntan:** no hay pruebas automatizadas de interfaz —del tipo que manejan el navegador solo—. El frontend se probó a mano siguiendo un recorrido documentado de ocho pasos.

---

# DEPLOYMENT

### ¿Está desplegado?
**Corta:** No. Corre en el computador y en Docker. Publicarlo en internet es el siguiente paso.

### ¿Qué tienen listo para desplegarlo?
**Corta:** Docker con sus dos imágenes, la configuración de entorno separada del código, y las migraciones versionadas.

**Ampliada:** Todos los secretos están en variables de entorno y el repositorio ignora cualquier variante de `.env`, así que no hay credenciales en el código. La base ya está en la nube, así que no hay que migrar datos.

### ¿Por qué no lo desplegaron todavía?
**Corta:** Porque priorizamos que la aplicación estuviera completa y probada antes que publicada.

**Ampliada:** Preferimos llegar con el sistema funcionando y con sus fallas de seguridad corregidas, que con una dirección en internet apuntando a algo a medias.

### ¿Los correos llegan de verdad?
**Corta:** El sistema los genera y los envía correctamente. Para que lleguen a una bandeja real hace falta la cuenta de un proveedor de correo, que es lo que estamos conectando.

**Ampliada:** Sin proveedor configurado usa una bandeja de prueba que imprime un enlace para ver el correo tal como habría llegado. El código de envío no cambia: cambia una variable de entorno.

---

# DECISIONES TÉCNICAS

### ¿Cuál fue la decisión más importante?
**Corta:** Poner las transiciones de estado en el servidor y no en la pantalla.

**Ampliada:** Es lo que convierte al sistema en algo distinto de un formulario bonito. La pantalla puede mentir o alguien puede llamar la API directamente; la regla sigue ahí. Y de ahí se derivan otras dos: el historial que no se reescribe, y la traducción a cinco pasos que mantiene al cliente informado sin exponer el vocabulario interno del taller.

### ¿Por qué la consulta pública no pide cuenta?
**Corta:** Porque pedirle a un motociclista que cree una cuenta para saber si su moto está lista es pedirle demasiado. No la crearía, y volvería a llamar.

**Ampliada:** La decisión obligó a un diseño cuidadoso: como el enlace circula sin control, la respuesta tiene que ser inofensiva aunque la lea un desconocido. De ahí la proyección explícita de campos y la respuesta idéntica para códigos inexistentes.

### ¿Se arrepienten de algo?
**Corta:** De no haber escrito las pruebas desde el principio. Llegaron después, y varias fallas se habrían encontrado antes.

**Ampliada:** También aprendimos a no confiar en la documentación escrita a mano: cuando contrastamos el catálogo de la API contra el código con un guion, encontramos cuatro endpoints documentados que no existían. Desde entonces los números del proyecto salen de leer el código, no de contar a mano.

### Si tuvieran un mes más, ¿qué harían?
**Corta:** Publicarlo en internet, ponerlo en un taller real y volver con lo que ese taller nos diga.

**Ampliada:** Y técnicamente: descontar el inventario automáticamente al pasar a reparación, y pruebas automatizadas de interfaz.

---

# LAS INCÓMODAS

### "Esto ya existe, ¿por qué hacerlo de nuevo?"
**Corta:** Existen sistemas de taller, sí. Casi ninguno tiene una pantalla pensada para el dueño de la moto, sin cuenta y desde el celular. Ahí está nuestro aporte.

### "¿Cuánto de esto lo hizo una inteligencia artificial?"
**Corta:** Usamos herramientas de apoyo, como se usan en la industria. Lo que respondemos hoy lo entendemos: podemos explicar por qué cada decisión está donde está, y las tres fallas de seguridad las encontramos, entendimos y corregimos nosotros.

> **Digan esto solo si es cierto.** Y si se lo preguntan, la mejor prueba no es la respuesta: es que puedan contestar cualquier otra pregunta de esta lista sin leer.

### "¿Quién hizo qué?"
**Corta:** Harrison el servidor, la base y la seguridad. Dayana las pantallas y el portal del cliente. Yessika Gómez las pruebas, el correo, los reportes y la documentación.

### "¿Qué es lo que peor quedó?"
**Corta:** Que no está desplegado, y que faltan las capturas del manual de usuario. Lo primero es un trámite; lo segundo es trabajo nuestro que no alcanzamos a terminar.

> Responder esto con calma, sin ponerse a la defensiva, vale más que cualquier otra respuesta de esta lista. Un equipo que sabe exactamente qué le falta demuestra que conoce su proyecto.

---

## Las cinco que más probablemente les hagan

Si van cortos de tiempo para estudiar, aprendan estas cinco de memoria:

1. **¿Qué es SIGTM en una frase?**
2. **¿Por qué el cliente ve cinco pasos y no ocho?**
3. **¿Encontraron vulnerabilidades?**
4. **¿Está desplegado?**
5. **¿Cuál fue la decisión técnica más importante?**
