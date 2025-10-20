import { useQuery } from '@tanstack/react-query'
import {
  obtenerDepositos,
  obtenerTiposHumedad,
  obtenerOrigenes,
  obtenerEstados,
  obtenerUnidadesEmbolsado,
  obtenerNumerosArticulo as obtenerArticulos
} from '@/app/services/catalogo-service'
import { obtenerTodosCultivares } from '@/app/services/cultivar-service'
import { obtenerTodasEspecies } from '@/app/services/especie-service'
import { 
  obtenerEmpresas as obtenerEmpresasBase, 
  obtenerClientes as obtenerClientesBase 
} from '@/app/services/contacto-service'

// Adaptar datos para formularios - SOLO ACTIVOS para registros
const obtenerCultivares = async () => {
  const cultivares = await obtenerTodosCultivares(true) // Solo activos
  return cultivares.map(c => ({ id: c.cultivarID, nombre: c.nombre }))
}

const obtenerEspecies = async () => {
  const especies = await obtenerTodasEspecies(true) // Solo activos
  return especies.map(e => ({ id: e.especieID, nombre: e.nombreComun }))
}

const obtenerEmpresas = async () => {
  const empresas = await obtenerEmpresasBase(true) // Solo activos
  return empresas.map(e => ({ id: e.contactoID, nombre: e.nombre }))
}

const obtenerClientes = async () => {
  const clientes = await obtenerClientesBase(true) // Solo activos
  return clientes.map(c => ({ id: c.contactoID, nombre: c.nombre }))
}

// Query keys for consistent caching
export const CATALOG_KEYS = {
  cultivares: ['catalogs', 'cultivares'] as const,
  empresas: ['catalogs', 'empresas'] as const,
  clientes: ['catalogs', 'clientes'] as const,
  depositos: ['catalogs', 'depositos'] as const,
  tiposHumedad: ['catalogs', 'tiposHumedad'] as const,
  origenes: ['catalogs', 'origenes'] as const,
  estados: ['catalogs', 'estados'] as const,
  especies: ['catalogs', 'especies'] as const,
  unidadesEmbolsado: ['catalogs', 'unidadesEmbolsado'] as const,
  articulos: ['catalogs', 'articulos'] as const,
}

export const useCultivares = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.cultivares,
    queryFn: obtenerCultivares,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useEmpresas = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.empresas,
    queryFn: obtenerEmpresas,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useClientes = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.clientes,
    queryFn: obtenerClientes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useDepositos = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.depositos,
    queryFn: obtenerDepositos,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useTiposHumedad = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.tiposHumedad,
    queryFn: obtenerTiposHumedad,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useOrigenes = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.origenes,
    queryFn: obtenerOrigenes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useEstados = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.estados,
    queryFn: obtenerEstados,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useEspecies = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.especies,
    queryFn: obtenerEspecies,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useUnidadesEmbolsado = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.unidadesEmbolsado,
    queryFn: obtenerUnidadesEmbolsado,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useArticulos = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.articulos,
    queryFn: obtenerArticulos,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Combined hook for all catalogs - most efficient for forms that need all data
export const useAllCatalogs = () => {
  const cultivares = useCultivares()
  const empresas = useEmpresas()
  const clientes = useClientes()
  const depositos = useDepositos()
  const tiposHumedad = useTiposHumedad()
  const origenes = useOrigenes()
  const estados = useEstados()
  const especies = useEspecies()
  const unidadesEmbolsado = useUnidadesEmbolsado()
  const articulos = useArticulos()

  const isLoading = [
    cultivares,
    empresas,
    clientes,
    depositos,
    tiposHumedad,
    origenes,
    estados,
    especies,
    unidadesEmbolsado,
    articulos,
  ].some(query => query.isLoading)

  const isError = [
    cultivares,
    empresas,
    clientes,
    depositos,
    tiposHumedad,
    origenes,
    estados,
    especies,
    unidadesEmbolsado,
    articulos,
  ].some(query => query.isError)

  return {
    data: {
      cultivares: cultivares.data || [],
      empresas: empresas.data || [],
      clientes: clientes.data || [],
      depositos: depositos.data || [],
      tiposHumedad: tiposHumedad.data || [],
      origenes: origenes.data || [],
      estados: estados.data || [],
      especies: especies.data || [],
      unidadesEmbolsado: unidadesEmbolsado.data || [],
      articulos: articulos.data || [],
    },
    isLoading,
    isError,
    refetch: () => {
      Promise.all([
        cultivares.refetch(),
        empresas.refetch(),
        clientes.refetch(),
        depositos.refetch(),
        tiposHumedad.refetch(),
        origenes.refetch(),
        estados.refetch(),
        especies.refetch(),
        unidadesEmbolsado.refetch(),
        articulos.refetch(),
      ])
    }
  }
}