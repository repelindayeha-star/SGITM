-- MotoNexus (SIGTM) - Esquema inicial
-- Proyecto ADSO-SENA, ficha 3114227
-- Convención: snake_case en BD, camelCase en Java (mapeado con JPA)

CREATE TABLE usuarios (
    id              BIGSERIAL PRIMARY KEY,
    correo          VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),                 -- NULL si el usuario solo usa Google
    google_id       VARCHAR(100) UNIQUE,
    rol             VARCHAR(20)  NOT NULL,        -- TALLER | CLIENTE  (ver enum Rol)
    correo_verificado BOOLEAN    NOT NULL DEFAULT FALSE,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP    NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT chk_usuario_login CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

CREATE TABLE codigos_verificacion (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_hash     VARCHAR(255) NOT NULL,
    expira_en       TIMESTAMP NOT NULL,
    intentos        INT NOT NULL DEFAULT 0,
    usado           BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_codigos_verificacion_usuario ON codigos_verificacion(usuario_id);

CREATE TABLE registros_sesion (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    correo_intento  VARCHAR(150),
    ip              VARCHAR(64),
    metodo          VARCHAR(20) NOT NULL,          -- LOCAL | GOOGLE
    exitoso         BOOLEAN NOT NULL,
    creado_en       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_registros_sesion_usuario ON registros_sesion(usuario_id);

CREATE TABLE clientes (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    telefono        VARCHAR(30),
    documento       VARCHAR(30) UNIQUE,
    creado_en       TIMESTAMP NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE motocicletas (
    id              BIGSERIAL PRIMARY KEY,
    cliente_id      BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    marca           VARCHAR(60) NOT NULL,
    modelo          VARCHAR(60) NOT NULL,
    placa           VARCHAR(15) NOT NULL UNIQUE,
    anio            INT,
    cilindraje      INT,
    color           VARCHAR(40),
    chasis          VARCHAR(60) UNIQUE,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_motocicletas_cliente ON motocicletas(cliente_id);

CREATE TABLE ordenes_servicio (
    id              BIGSERIAL PRIMARY KEY,
    moto_id         BIGINT NOT NULL REFERENCES motocicletas(id) ON DELETE CASCADE,
    mecanico_id     BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha           TIMESTAMP NOT NULL DEFAULT now(),
    diagnostico     TEXT,
    estado          VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',  -- ABIERTA | EN_PROCESO | CERRADA
    creado_en       TIMESTAMP NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_ordenes_moto ON ordenes_servicio(moto_id);
CREATE INDEX idx_ordenes_mecanico ON ordenes_servicio(mecanico_id);

CREATE TABLE items_orden (
    id              BIGSERIAL PRIMARY KEY,
    orden_id        BIGINT NOT NULL REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
    tipo            VARCHAR(20) NOT NULL,   -- REPUESTO | MANO_DE_OBRA | PRUEBA
    descripcion     VARCHAR(255) NOT NULL,
    cantidad        NUMERIC(10,2) NOT NULL DEFAULT 1,
    valor_unitario  NUMERIC(12,2) NOT NULL DEFAULT 0,
    creado_en       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_items_orden ON items_orden(orden_id);

CREATE TABLE facturas (
    id              BIGSERIAL PRIMARY KEY,
    cliente_id      BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    estado          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE | PAGADA | ANULADA
    fecha           TIMESTAMP NOT NULL DEFAULT now(),
    creado_en       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);

-- Tabla puente: una factura puede cubrir una o varias órdenes cerradas (N a N)
CREATE TABLE factura_ordenes (
    factura_id      BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    orden_id        BIGINT NOT NULL REFERENCES ordenes_servicio(id) ON DELETE RESTRICT,
    PRIMARY KEY (factura_id, orden_id)
);
