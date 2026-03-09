export interface User {
    id: number;
    tenant_id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    rol: 'admin' | 'operador';
}

export interface Tenant {
    id: number;
    razon_social: string;
    ruc: string;
    sunat_beta: boolean;
}

export interface Cliente {
    id: number;
    tenant_id: number;
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    direccion?: string;
    email?: string;
    telefono?: string;
    activo: boolean;
}

export interface Producto {
    id: number;
    tenant_id: number;
    codigo: string;
    descripcion: string;
    unidad_medida: string;
    precio_unitario: number;
    afecto_igv: boolean;
    activo: boolean;
}

export interface DetalleComprobante {
    id?: number;
    producto_id?: number;
    codigo_producto?: string;
    descripcion: string;
    unidad_medida: string;
    cantidad: number;
    precio_unitario: number;
    precio_unitario_con_igv?: number;
    descuento: number;
    subtotal: number;
    igv_item: number;
    total_item: number;
    tipo_afectacion_igv: string;
}

export interface Comprobante {
    id: number;
    tipo_comprobante: string;
    tipo_label: string;
    serie: string;
    correlativo: number;
    numero: string;
    fecha_emision: string;
    fecha_emision_fmt?: string;
    cliente_id: number;
    cliente_tipo_doc: string;
    cliente_num_doc: string;
    cliente_razon_social: string;
    cliente_direccion?: string;
    moneda: string;
    tipo_cambio: number;
    op_gravadas: number;
    op_exoneradas: number;
    op_inafectas: number;
    igv: number;
    total: number;
    estado: 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'anulado';
    forma_pago?: string;
    condicion_pago?: string;
    estado_color: string;
    sunat_codigo?: string;
    sunat_descripcion?: string;
    hash_cpe?: string;
    detalles?: DetalleComprobante[];
}

export interface Serie {
    id: number;
    tipo_comprobante: string;
    serie: string;
    correlativo_actual: number;
    activo: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
};
