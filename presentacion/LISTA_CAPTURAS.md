# LISTA DE CAPTURAS — SIGTM / Moto Nexus

Ocho capturas. Ni una más. Son los ocho recuadros con **borde punteado** que hoy tiene la presentación.

---

## Cómo tomarlas — léelo antes de la primera

**Preparación (una sola vez):**

1. Servidor y pantallas corriendo. Entra a `localhost:5173` y navega una pantalla para despertar la base de datos.
2. **Zoom del navegador al 100 %** (Ctrl+0). Ni más ni menos: al 125 % se corta el contenido, al 80 % no se lee.
3. **Pantalla completa (F11).** Sin barra de direcciones, sin pestañas, sin marcadores. Una captura con tus quince pestañas abiertas se ve amateur.
4. Ventana maximizada. Si tu monitor es pequeño, hazlas en el más grande que tengas.

**Cómo capturar:** `Win + Shift + S` → rectángulo → guarda como **PNG**, nunca JPG.

**Antes de guardar cada una, revisa:**

- [ ] No aparece ningún dato personal real de ustedes ni de sus familias
- [ ] No hay campos vacíos ni tablas sin filas — la aplicación tiene que verse **con datos**
- [ ] No hay mensajes de error visibles (salvo la 05, donde el error es el protagonista)
- [ ] Se lee el texto sin forzar la vista

**Nombre del archivo:** `captura-01.png`, `captura-02.png`, … en una carpeta `presentacion/capturas/` dentro del proyecto.

---

# Captura 01 — Seguimiento público con resultado

| | |
|---|---|
| **Pantalla** | `localhost:5173/seguimiento`, ventana de **incógnito** |
| **Qué debe aparecer** | La línea de tiempo de cinco pasos ya consultada, con el paso actual resaltado y las fechas visibles |
| **Cómo llegar** | Incógnito → `/seguimiento` → escribe `OT-2026-DEMO05` → Consultar |
| **Se usa en** | **Diapositiva 1 (portada)** |
| **¿En la demo?** | Sí — es el paso 5, el momento más importante |

> Es la captura más importante de todas: es la primera cara del producto. Tómala con calma y repítela hasta que quede bien.

---

# Captura 02 — Detalle de una orden con su recorrido

| | |
|---|---|
| **Pantalla** | `Órdenes` → abrir una orden (`OrdenDetalle`) |
| **Qué debe aparecer** | El código de la orden, la moto, el estado actual y el recorrido de estados por el que ya pasó |
| **Cómo llegar** | Sesión de recepción → Órdenes → abre `OT-2026-DEMO05` (está en reparación y ya tiene cinco estados en su historial) |
| **Se usa en** | **Diapositiva 3 (La solución)** — es la captura grande de la derecha |
| **¿En la demo?** | Sí — pasos 1, 2 y 6 |

> Elige una orden que **ya tenga historial**. Una orden recién creada se ve vacía y no cuenta nada.

---

# Captura 03 — Lista de órdenes del taller

| | |
|---|---|
| **Pantalla** | `Órdenes` (`Ordenes.jsx`) |
| **Qué debe aparecer** | Varias órdenes en distintos estados, para que se vea la variedad |
| **Cómo llegar** | Sesión de **recepción** → Órdenes. Las ocho órdenes de demostración cubren los ocho estados |
| **Se usa en** | **Diapositiva 6 (Así se ve)** — etiqueta *"Las órdenes del taller"* |
| **¿En la demo?** | Sí — es la pantalla de arranque |

---

# Captura 04 — Diagnóstico y cotización

| | |
|---|---|
| **Pantalla** | Detalle de orden, con el diagnóstico escrito y la cotización armada |
| **Qué debe aparecer** | El diagnóstico, la mano de obra, al menos un repuesto con cantidad, y **el total calculado** |
| **Cómo llegar** | Sesión de **mecánico1** → su orden asignada → parte de diagnóstico y cotización |
| **Se usa en** | **Diapositiva 6** — etiqueta *"Diagnóstico y cotización"* |
| **¿En la demo?** | Sí — paso 3 |

> El total tiene que estar **visible** en la captura. Es lo que demuestra que el sistema calcula y no solo almacena.

---

# Captura 05 — Seguimiento público, sin datos personales

| | |
|---|---|
| **Pantalla** | La misma de la captura 01, pero encuadrada distinto |
| **Qué debe aparecer** | La línea de cinco pasos **completa**, de forma que se note que NO hay nombre, teléfono, correo, cotización ni factura |
| **Cómo llegar** | Igual que la 01 |
| **Se usa en** | **Diapositiva 6** — etiqueta *"Lo que ve el dueño de la moto"* |
| **¿En la demo?** | Sí — paso 5 |

> Esta y la 01 son de la misma pantalla, pero **no son la misma imagen**. La 01 busca que se vea bonita; esta busca que se vea **lo que falta**. Encuádrala amplia, con aire alrededor.

---

# Captura 06 — Inventario con alerta de mínimos

| | |
|---|---|
| **Pantalla** | `Inventario` (`Inventario.jsx`) |
| **Qué debe aparecer** | La lista de repuestos **con al menos uno marcado por debajo del mínimo** |
| **Cómo llegar** | Sesión de recepción o admin → Inventario. Los datos de demostración incluyen dos repuestos por debajo del mínimo |
| **Se usa en** | **Diapositiva 6** — etiqueta *"Inventario y alertas"* |
| **¿En la demo?** | No |

> Si no se ve ninguna alerta, baja a mano la existencia de un repuesto antes de capturar. La alerta es el punto entero de esta captura.

---

# Captura 07 — Panel principal

| | |
|---|---|
| **Pantalla** | `Dashboard` (`Dashboard.jsx`) |
| **Qué debe aparecer** | El resumen del taller: órdenes por estado, con números reales, no en cero |
| **Cómo llegar** | Sesión de **admin** → es la pantalla de entrada |
| **Se usa en** | **Diapositiva 11 (Esto es lo que construimos)** — es la captura grande |
| **¿En la demo?** | No |

> Esta es la captura del cierre: es la que tiene que verse **llena y ordenada**. Si el panel se ve vacío, la diapositiva final pierde toda su fuerza. Comprueba antes que los datos de demostración estén cargados.

---

# Captura 08 — La aplicación en su mejor cara

| | |
|---|---|
| **Pantalla** | A elección: el panel principal, o el seguimiento público en vista de celular |
| **Qué debe aparecer** | Lo que más orgullo les dé de cómo quedó |
| **Cómo llegar** | — |
| **Se usa en** | **Diapositiva 12 (Cierre)** |
| **¿En la demo?** | No |

> **Sugerencia:** el seguimiento público en formato celular (F12 → modo dispositivo → iPhone). Es lo que hace único al proyecto, y en vertical se ve distinto a todo lo demás del deck. Cierra el círculo con la portada.

---

## Resumen

| Nº | Nombre | Diapositiva | En la demo |
|---|---|---|---|
| 01 | Seguimiento público con resultado | 1 | Sí |
| 02 | Detalle de orden con recorrido | 3 | Sí |
| 03 | Lista de órdenes | 6 | Sí |
| 04 | Diagnóstico y cotización | 6 | Sí |
| 05 | Seguimiento público, sin datos personales | 6 | Sí |
| 06 | Inventario con alerta | 6 | No |
| 07 | Panel principal | 11 | No |
| 08 | La aplicación en su mejor cara | 12 | No |

**Cuatro de las ocho (01, 02, 03, 04) son pantallas que de todos modos van a mostrar en vivo.** Tomarlas sirve doble: quedan en el deck y les obliga a ensayar el recorrido de la demo.

---

## Cuando las tengan

Pásenmelas y yo las meto en la presentación reemplazando los recuadros punteados. No hay que rehacer nada del deck: el espacio ya está reservado con el tamaño y la proporción correctos.

**Si el día de la sustentación falta alguna:**

- Faltan la 03, 04, 05 o 06 → **sáltense la diapositiva 6** completa. Una diapositiva con recuadros vacíos hace más daño que no tenerla.
- Falta la 07 → la diapositiva 11 funciona igual, solo se ve más sobria.
- Faltan la 01 o la 08 → portada y cierre aguantan sin imagen; son las menos graves.
