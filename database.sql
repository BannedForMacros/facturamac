-- =============================================================================
-- FACTURAMAC - Script SQL Completo para pgAdmin
-- Base de datos: facturamac
-- Generado para: MACSOFT E.I.R.L. - RUC: 20614911051
-- =============================================================================

-- Crear base de datos (ejecutar como superusuario si no existe)
-- CREATE DATABASE facturamac ENCODING 'UTF8';

-- Conectar a la base de datos facturamac antes de continuar

-- =============================================================================
-- EXTENSIONES
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLA: tenants
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    direccion VARCHAR(500) NOT NULL,
    ubigeo VARCHAR(6),
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    email VARCHAR(255),
    telefono VARCHAR(20),
    clave_sol_usuario TEXT,
    clave_sol_password TEXT,
    certificado_pfx VARCHAR(500),
    certificado_password TEXT,
    sunat_beta BOOLEAN NOT NULL DEFAULT TRUE,
    logo VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

COMMENT ON TABLE tenants IS 'Empresas / Tenants del sistema SaaS';
COMMENT ON COLUMN tenants.sunat_beta IS 'TRUE = ambiente de pruebas SUNAT, FALSE = producción';
COMMENT ON COLUMN tenants.clave_sol_usuario IS 'Usuario SOL encriptado con AES-256 (Laravel Crypt)';
COMMENT ON COLUMN tenants.clave_sol_password IS 'Password SOL encriptado';
COMMENT ON COLUMN tenants.certificado_password IS 'Contraseña del .pfx encriptada';

-- =============================================================================
-- TABLA: users
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP(0) WITHOUT TIME ZONE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'operador',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    remember_token VARCHAR(100),
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

COMMENT ON COLUMN users.rol IS 'admin | operador';

-- =============================================================================
-- TABLA: password_reset_tokens
-- =============================================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE
);

-- =============================================================================
-- TABLA: sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);

-- =============================================================================
-- TABLA: cache
-- =============================================================================
CREATE TABLE IF NOT EXISTS cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

-- =============================================================================
-- TABLA: jobs (Queue)
-- =============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    reserved_at INTEGER,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_jobs_queue ON jobs(queue);

CREATE TABLE IF NOT EXISTS job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INTEGER NOT NULL,
    pending_jobs INTEGER NOT NULL,
    failed_jobs INTEGER NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options TEXT,
    cancelled_at INTEGER,
    created_at INTEGER NOT NULL,
    finished_at INTEGER
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABLA: clientes
-- =============================================================================
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(2) NOT NULL DEFAULT '6',
    numero_documento VARCHAR(20) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    direccion VARCHAR(500),
    email VARCHAR(255),
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    UNIQUE(tenant_id, tipo_documento, numero_documento)
);

COMMENT ON COLUMN clientes.tipo_documento IS '6=RUC, 1=DNI, 4=CE, 7=Pasaporte';

-- =============================================================================
-- TABLA: productos
-- =============================================================================
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    unidad_medida VARCHAR(10) NOT NULL DEFAULT 'NIU',
    precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    afecto_igv BOOLEAN NOT NULL DEFAULT TRUE,
    codigo_producto_sunat VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    UNIQUE(tenant_id, codigo)
);

COMMENT ON COLUMN productos.unidad_medida IS 'Catálogo SUNAT: NIU=Unidad bienes, ZZ=Servicios, HUR=Hora, etc.';

-- =============================================================================
-- TABLA: series
-- =============================================================================
CREATE TABLE IF NOT EXISTS series (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tipo_comprobante VARCHAR(2) NOT NULL,
    serie VARCHAR(4) NOT NULL,
    correlativo_actual INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    UNIQUE(tenant_id, tipo_comprobante, serie)
);

COMMENT ON COLUMN series.tipo_comprobante IS '01=Factura, 03=Boleta, 07=NC, 08=ND';
COMMENT ON COLUMN series.correlativo_actual IS 'El siguiente número será correlativo_actual + 1';

-- =============================================================================
-- TABLA: comprobantes
-- =============================================================================
CREATE TABLE IF NOT EXISTS comprobantes (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tipo_comprobante VARCHAR(2) NOT NULL,
    serie VARCHAR(4) NOT NULL,
    correlativo INTEGER NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,

    -- Datos del cliente (snapshot al momento de emisión)
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    cliente_tipo_doc VARCHAR(2) NOT NULL,
    cliente_num_doc VARCHAR(20) NOT NULL,
    cliente_razon_social VARCHAR(500) NOT NULL,
    cliente_direccion VARCHAR(500),

    -- Moneda
    moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
    tipo_cambio DECIMAL(8,3) NOT NULL DEFAULT 1.000,

    -- Totales
    op_gravadas DECIMAL(12,2) NOT NULL DEFAULT 0,
    op_exoneradas DECIMAL(12,2) NOT NULL DEFAULT 0,
    op_inafectas DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento_global DECIMAL(12,2) NOT NULL DEFAULT 0,
    igv DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Estado: borrador, enviado, aceptado, rechazado, anulado
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador',

    -- Datos SUNAT
    xml_firmado TEXT,
    cdr_respuesta TEXT,
    hash_cpe VARCHAR(255),
    sunat_codigo VARCHAR(10),
    sunat_descripcion TEXT,

    -- Archivos generados
    enlace_pdf VARCHAR(500),
    enlace_xml VARCHAR(500),

    -- Metadatos
    observaciones TEXT,
    comprobante_ref_id BIGINT REFERENCES comprobantes(id) ON DELETE SET NULL,
    motivo_nota VARCHAR(500),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    UNIQUE(tenant_id, tipo_comprobante, serie, correlativo)
);

COMMENT ON COLUMN comprobantes.estado IS 'borrador | enviado | aceptado | rechazado | anulado';
COMMENT ON COLUMN comprobantes.xml_firmado IS 'XML UBL 2.1 firmado digitalmente con XMLDSig';
COMMENT ON COLUMN comprobantes.cdr_respuesta IS 'Constancia de Recepción (ZIP base64) de SUNAT';

-- Índices de comprobantes
CREATE INDEX IF NOT EXISTS idx_comprobantes_tenant ON comprobantes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comprobantes_estado ON comprobantes(estado);
CREATE INDEX IF NOT EXISTS idx_comprobantes_fecha ON comprobantes(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_comprobantes_cliente ON comprobantes(cliente_id);

-- =============================================================================
-- TABLA: detalle_comprobantes
-- =============================================================================
CREATE TABLE IF NOT EXISTS detalle_comprobantes (
    id BIGSERIAL PRIMARY KEY,
    comprobante_id BIGINT NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id) ON DELETE SET NULL,

    -- Snapshot del producto al emitir
    codigo_producto VARCHAR(50),
    codigo_producto_sunat VARCHAR(50),
    descripcion VARCHAR(500) NOT NULL,
    unidad_medida VARCHAR(10) NOT NULL DEFAULT 'NIU',
    cantidad DECIMAL(12,3) NOT NULL,
    precio_unitario DECIMAL(12,4) NOT NULL,
    precio_unitario_con_igv DECIMAL(12,4),
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Importes calculados
    subtotal DECIMAL(12,2) NOT NULL,         -- Valor de venta (base imponible)
    igv_item DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_item DECIMAL(12,2) NOT NULL,

    -- Tipo de afectación IGV (Catálogo 7 SUNAT)
    tipo_afectacion_igv VARCHAR(2) NOT NULL DEFAULT '10',
    porcentaje_igv DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    orden INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

COMMENT ON COLUMN detalle_comprobantes.tipo_afectacion_igv IS '10=Gravado, 20=Exonerado, 30=Inafecto, 40=Exportación';
COMMENT ON COLUMN detalle_comprobantes.subtotal IS 'Valor de venta = cantidad * precio_unitario - descuento';

-- =============================================================================
-- DATOS INICIALES: Tenant MacSoft
-- =============================================================================
INSERT INTO tenants (razon_social, ruc, direccion, ubigeo, departamento, provincia, distrito, email, sunat_beta, activo, created_at, updated_at)
VALUES (
    'MACSOFT E.I.R.L.',
    '20614911051',
    'Cal. Juan Buendia Nro. 341, La Primavera',
    '140101',
    'LAMBAYEQUE',
    'CHICLAYO',
    'CHICLAYO',
    'info@macsoft.pe',
    TRUE,
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (ruc) DO NOTHING;

-- =============================================================================
-- NOTA IMPORTANTE:
-- Las contraseñas (clave_sol, certificado) deben ser encriptadas por Laravel
-- antes de insertarlas. NO insertes valores en texto plano en estos campos.
-- Usa el seeder de Laravel: php artisan db:seed
-- =============================================================================

-- =============================================================================
-- VISTA ÚTIL: Comprobantes con totales formateados
-- =============================================================================
CREATE OR REPLACE VIEW v_comprobantes AS
SELECT
    c.id,
    t.ruc AS empresa_ruc,
    t.razon_social AS empresa,
    c.tipo_comprobante,
    CASE c.tipo_comprobante
        WHEN '01' THEN 'Factura'
        WHEN '03' THEN 'Boleta de Venta'
        WHEN '07' THEN 'Nota de Crédito'
        WHEN '08' THEN 'Nota de Débito'
        ELSE c.tipo_comprobante
    END AS tipo_label,
    c.serie || '-' || LPAD(c.correlativo::TEXT, 8, '0') AS numero,
    c.fecha_emision,
    c.cliente_num_doc,
    c.cliente_razon_social,
    c.moneda,
    c.op_gravadas,
    c.igv,
    c.total,
    c.estado,
    c.sunat_codigo,
    c.created_at
FROM comprobantes c
JOIN tenants t ON c.tenant_id = t.id
ORDER BY c.fecha_emision DESC, c.id DESC;

COMMENT ON VIEW v_comprobantes IS 'Vista de comprobantes con datos desnormalizados para reportes';

-- =============================================================================
-- FUNCIÓN: Siguiente correlativo de serie
-- =============================================================================
CREATE OR REPLACE FUNCTION next_correlativo(p_tenant_id BIGINT, p_tipo VARCHAR, p_serie VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_correlativo INTEGER;
BEGIN
    UPDATE series
    SET correlativo_actual = correlativo_actual + 1,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id
      AND tipo_comprobante = p_tipo
      AND serie = p_serie
    RETURNING correlativo_actual INTO v_correlativo;

    RETURN v_correlativo;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION next_correlativo IS 'Incrementa y retorna el correlativo de una serie de forma atómica';

-- =============================================================================
-- FIN DEL SCRIPT
-- Para poblar con datos de prueba ejecutar desde Laravel:
--   php artisan migrate:fresh --seed
-- =============================================================================
