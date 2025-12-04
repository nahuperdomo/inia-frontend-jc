import { obtenerTiposHumedad, obtenerNumerosArticulo, obtenerOrigenes, obtenerEstados, obtenerDepositos } from './catalogo-service';
import { obtenerTodosCultivares } from './cultivar-service';
import { obtenerClientes, obtenerEmpresas } from './contacto-service';


export async function obtenerCatalogosParaLotes() {
    const [
        cultivares,
        empresas,
        clientes,
        tiposHumedad,
        origenes,
        estados,
        depositos,
        numerosArticulo
    ] = await Promise.all([
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
        cultivares,
        empresas,
        clientes,
        tiposHumedad,
        origenes,
        estados,
        depositos,
        numerosArticulo
    };
}


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
