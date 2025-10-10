import { CatalogoDTO, ContactoDTO, CultivarDTO } from "../models";
import { obtenerTiposHumedad, obtenerNumerosArticulo, obtenerOrigenes, obtenerEstados, obtenerDepositos } from './catalogo-service';
import { obtenerTodosCultivares } from './cultivar-service';
import { obtenerClientes, obtenerEmpresas } from './contacto-service';

// Datos de demostración para cuando la API no devuelve resultados
const cultivaresDemo: CultivarDTO[] = [
    { cultivarID: 1, nombre: "Maíz Híbrido P1570", descripcion: "Híbrido de alto rendimiento", especieID: 1, activo: true, fechaCreacion: new Date().toISOString() },
    { cultivarID: 2, nombre: "Trigo RHS120", descripcion: "Variedad de ciclo corto", especieID: 2, activo: true, fechaCreacion: new Date().toISOString() },
    { cultivarID: 3, nombre: "Arroz INIA Tacuarí", descripcion: "Resistente a plagas", especieID: 3, activo: true, fechaCreacion: new Date().toISOString() }
];

const empresasDemo: ContactoDTO[] = [
    { contactoID: 1, nombre: "Agroinsumos S.A.", telefono: "099123456", email: "contacto@agroinsumos.com", direccion: "Ruta 5 Km 12, Canelones", tipoContacto: "EMPRESA", activo: true, fechaCreacion: new Date().toISOString() },
    { contactoID: 2, nombre: "Semillas Del Este", telefono: "099789123", email: "ventas@semillasdeleste.com", direccion: "Av. Italia 1234, Maldonado", tipoContacto: "EMPRESA", activo: true, fechaCreacion: new Date().toISOString() }
];

const clientesDemo: ContactoDTO[] = [
    { contactoID: 3, nombre: "Juan Pérez", telefono: "098765432", email: "jperez@gmail.com", direccion: "Av. 18 de Julio 1234, Montevideo", tipoContacto: "CLIENTE", activo: true, fechaCreacion: new Date().toISOString() },
    { contactoID: 4, nombre: "Establecimiento El Trigal", telefono: "098123456", email: "contacto@eltrigal.com.uy", direccion: "Ruta 7 Km 140, Cerro Largo", tipoContacto: "CLIENTE", activo: true, fechaCreacion: new Date().toISOString() }
];

const tiposHumedadDemo: any[] = [
    { id: 1, tipo: "TIPO_HUMEDAD", valor: "Humedad Base Húmeda", activo: true },
    { id: 2, tipo: "TIPO_HUMEDAD", valor: "Humedad Base Seca", activo: true }
];

const origenesDemo: any[] = [
    { id: 3, tipo: "ORIGEN", valor: "Nacional", activo: true },
    { id: 4, tipo: "ORIGEN", valor: "Importado - Argentina", activo: true }
];

const estadosDemo: any[] = [
    { id: 5, tipo: "ESTADO", valor: "Ingresado", activo: true },
    { id: 6, tipo: "ESTADO", valor: "En Proceso", activo: true }
];

const depositosDemo: any[] = [
    { id: 7, tipo: "DEPOSITO", valor: "Depósito A - Principal", activo: true },
    { id: 8, tipo: "DEPOSITO", valor: "Depósito B - Secundario", activo: true }
];

const numerosArticuloDemo: any[] = [
    { id: 9, tipo: "NUMERO_ARTICULO", valor: "Artículo 001", activo: true },
    { id: 10, tipo: "NUMERO_ARTICULO", valor: "Artículo 002", activo: true }
];

/**
 * Servicio para obtener todos los catálogos necesarios para el formulario de lotes.
 */
export async function obtenerCatalogosParaLotes() {
    try {
        const [
            cultivares,
            empresas,
            clientes,
            tiposHumedad,
            origenes,
            estados,
            depositos,
            numerosArticulo
        ] = await Promise.allSettled([
            obtenerTodosCultivares(),
            obtenerEmpresas(),
            obtenerClientes(),
            obtenerTiposHumedad(),
            obtenerOrigenes(),
            obtenerEstados(),
            obtenerDepositos(),
            obtenerNumerosArticulo()
        ]);

        return {
            cultivares: cultivares.status === 'fulfilled' ? cultivares.value : cultivaresDemo,
            empresas: empresas.status === 'fulfilled' ? empresas.value : empresasDemo,
            clientes: clientes.status === 'fulfilled' ? clientes.value : clientesDemo,
            tiposHumedad: tiposHumedad.status === 'fulfilled' ? tiposHumedad.value : tiposHumedadDemo,
            origenes: origenes.status === 'fulfilled' ? origenes.value : origenesDemo,
            estados: estados.status === 'fulfilled' ? estados.value : estadosDemo,
            depositos: depositos.status === 'fulfilled' ? depositos.value : depositosDemo,
            numerosArticulo: numerosArticulo.status === 'fulfilled' ? numerosArticulo.value : numerosArticuloDemo
        };
    } catch (error) {
        console.error("Error al obtener los catálogos para lotes:", error);
        // Si hay un error general, devolver datos de demostración
        return {
            cultivares: cultivaresDemo,
            empresas: empresasDemo,
            clientes: clientesDemo,
            tiposHumedad: tiposHumedadDemo,
            origenes: origenesDemo,
            estados: estadosDemo,
            depositos: depositosDemo,
            numerosArticulo: numerosArticuloDemo
        };
    }
}

/**
 * Opciones fijas que no vienen del backend
 */
export const tipoOptions = [
    { id: "INTERNO", nombre: "Interno" },
    { id: "OTROS_CENTROS_COSTOS", nombre: "Otros Centros de Costos" },
    { id: "EXTERNOS", nombre: "Externos" }
];

export const unidadesEmbolsadoOptions = [
    { id: "Bolsas", nombre: "Bolsas" },
    { id: "Granel", nombre: "Granel" },
    { id: "Big Bags", nombre: "Big Bags" },
    { id: "Contenedores", nombre: "Contenedores" }
];