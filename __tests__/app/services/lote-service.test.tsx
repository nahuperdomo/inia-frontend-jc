/**
 * Tests para lote-service
 * 
 * Estos tests cubren todas las funciones del servicio de lotes:
 * - obtenerLotesActivos
 * - obtenerLotesInactivos
 * - obtenerLotePorId
 * - crearLote
 * - actualizarLote
 * - eliminarLote
 * - activarLote
 * - obtenerLotesElegiblesParaTipoAnalisis
 * - puedeRemoverTipoAnalisis
 * - obtenerLotesElegibles
 * - validarLoteElegible
 * - obtenerLotesPaginadas
 * - obtenerEstadisticasLotes
 */

import {
    obtenerLotesActivos,
    obtenerLotesInactivos,
    obtenerLotePorId,
    crearLote,
    actualizarLote,
    eliminarLote,
    activarLote,
    obtenerLotesElegiblesParaTipoAnalisis,
    puedeRemoverTipoAnalisis,
    obtenerLotesElegibles,
    validarLoteElegible,
    obtenerLotesPaginadas,
    obtenerEstadisticasLotes
} from '@/app/services/lote-service'
import { apiFetch } from '@/app/services/api'
import { LoteDTO, LoteRequestDTO, LoteSimpleDTO } from '@/app/models'
import { TipoAnalisis } from '@/app/models/types/enums'

// Mock de apiFetch
jest.mock('@/app/services/api')

describe('Lote Service Tests', () => {
    const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('obtenerLotesActivos', () => {
        it('debe obtener todos los lotes activos', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                {
                    loteID: 1,
                    ficha: 'F-2024-001',
                    nomLote: 'Trigo Baguette 10',
                    cultivarNombre: 'Baguette 10',
                    especieNombre: 'Trigo',
                    activo: true
                },
                {
                    loteID: 2,
                    ficha: 'F-2024-002',
                    nomLote: 'Soja DM 5.8',
                    cultivarNombre: 'DM 5.8',
                    especieNombre: 'Soja',
                    activo: true
                }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result = await obtenerLotesActivos()

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/activos')
            expect(result).toEqual(mockLotes)
            expect(result).toHaveLength(2)
        })

        it('debe retornar array vacío si no hay lotes', async () => {
            mockApiFetch.mockResolvedValue({ lotes: null })

            const result = await obtenerLotesActivos()

            expect(result).toEqual([])
        })

        it('debe retornar array vacío si la respuesta no tiene lotes', async () => {
            mockApiFetch.mockResolvedValue({})

            const result = await obtenerLotesActivos()

            expect(result).toEqual([])
        })

        it('debe propagar el error si apiFetch falla', async () => {
            mockApiFetch.mockRejectedValue(new Error('Network error'))

            await expect(obtenerLotesActivos()).rejects.toThrow('Network error')
        })
    })

    describe('obtenerLotesInactivos', () => {
        it('debe obtener todos los lotes inactivos', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                {
                    loteID: 3,
                    ficha: 'F-2023-999',
                    nomLote: 'Trigo Antiguo',
                    cultivarNombre: 'Antiguo',
                    especieNombre: 'Trigo',
                    activo: false
                }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result = await obtenerLotesInactivos()

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/inactivos')
            expect(result).toEqual(mockLotes)
            expect(result[0].activo).toBe(false)
        })

        it('debe retornar array vacío si no hay lotes inactivos', async () => {
            mockApiFetch.mockResolvedValue({ lotes: [] })

            const result = await obtenerLotesInactivos()

            expect(result).toEqual([])
        })

        it('debe manejar respuesta null', async () => {
            mockApiFetch.mockResolvedValue({ lotes: null })

            const result = await obtenerLotesInactivos()

            expect(result).toEqual([])
        })
    })

    describe('obtenerLotePorId', () => {
        it('debe obtener un lote específico por ID', async () => {
            const mockLote: LoteDTO = {
                loteID: 1,
                ficha: 'F-2024-001',
                nomLote: 'Trigo Baguette 10',
                tipo: 'INTERNO',
                cultivarID: 1,
                cultivarNombre: 'Baguette 10',
                especieNombre: 'Trigo',
                empresaID: 1,
                empresaNombre: 'Semillera del Norte',
                clienteID: 1,
                clienteNombre: 'Juan Pérez',
                codigoCC: 'CC-001',
                codigoFF: 'FF-001',
                fechaEntrega: '2024-03-01',
                fechaRecibo: '2024-03-05',
                fechaCosecha: '2024-02-15',
                depositoID: 1,
                depositoValor: 'Depósito Central',
                unidadEmbolsado: 'Bolsa 50kg',
                remitente: 'Transportes ABC',
                observaciones: 'Lote premium',
                kilosLimpios: 1000,
                numeroArticuloID: 1,
                numeroArticuloValor: 'ART-001',
                origenID: 1,
                origenValor: 'Salto',
                estadoID: 1,
                estadoValor: 'Almacenado',
                tiposAnalisisAsignados: ['PUREZA', 'GERMINACION'],
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockLote)

            const result = await obtenerLotePorId(1)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/1')
            expect(result).toEqual(mockLote)
            expect(result.loteID).toBe(1)
        })

        it('debe manejar IDs diferentes', async () => {
            const mockLote: LoteDTO = {
                loteID: 999,
                ficha: 'F-999',
                nomLote: 'Test',
                tipo: 'EXTERNO',
                cultivarID: 1,
                cultivarNombre: 'Test',
                especieNombre: 'Test',
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 100,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                tiposAnalisisAsignados: [],
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockLote)

            const result = await obtenerLotePorId(999)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/999')
            expect(result.loteID).toBe(999)
        })

        it('debe propagar error si el lote no existe', async () => {
            mockApiFetch.mockRejectedValue(new Error('Lote no encontrado'))

            await expect(obtenerLotePorId(999)).rejects.toThrow('Lote no encontrado')
        })
    })

    describe('crearLote', () => {
        it('debe crear un nuevo lote correctamente', async () => {
            const mockRequest: LoteRequestDTO = {
                ficha: 'F-2024-NEW',
                nomLote: 'Nuevo Lote',
                tipo: 'INTERNO',
                cultivarID: 1,
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 500,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                fechaEntrega: '2024-01-01',
                fechaRecibo: '2024-01-05',
                fechaCosecha: '2023-12-20',
                remitente: 'Transportes ABC',
                tiposAnalisisAsignados: ['PUREZA'],
                datosHumedad: []
            }

            const mockResponse: LoteDTO = {
                loteID: 10,
                ficha: mockRequest.ficha,
                nomLote: mockRequest.nomLote,
                tipo: mockRequest.tipo,
                cultivarID: mockRequest.cultivarID,
                cultivarNombre: 'Baguette',
                especieNombre: 'Trigo',
                empresaID: mockRequest.empresaID,
                clienteID: mockRequest.clienteID,
                depositoID: mockRequest.depositoID,
                unidadEmbolsado: mockRequest.unidadEmbolsado,
                kilosLimpios: mockRequest.kilosLimpios,
                numeroArticuloID: mockRequest.numeroArticuloID,
                origenID: mockRequest.origenID,
                estadoID: mockRequest.estadoID,
                fechaEntrega: mockRequest.fechaEntrega,
                fechaRecibo: mockRequest.fechaRecibo,
                fechaCosecha: mockRequest.fechaCosecha,
                remitente: mockRequest.remitente,
                tiposAnalisisAsignados: mockRequest.tiposAnalisisAsignados,
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockResponse)

            const result = await crearLote(mockRequest)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes', {
                method: 'POST',
                body: JSON.stringify(mockRequest)
            })
            expect(result).toEqual(mockResponse)
            expect(result.loteID).toBe(10)
        })

        it('debe enviar todos los campos requeridos', async () => {
            const mockRequest: LoteRequestDTO = {
                ficha: 'F-TEST',
                nomLote: 'Test',
                tipo: 'EXTERNO',
                cultivarID: 5,
                empresaID: 2,
                clienteID: 3,
                depositoID: 4,
                unidadEmbolsado: 'Caja',
                kilosLimpios: 1500,
                numeroArticuloID: 6,
                origenID: 7,
                estadoID: 8,
                fechaEntrega: '2024-01-01',
                fechaRecibo: '2024-01-05',
                fechaCosecha: '2023-12-20',
                remitente: 'Test Transport',
                tiposAnalisisAsignados: ['GERMINACION', 'TETRAZOLIO'],
                datosHumedad: [
                    { tipoHumedadID: 1, valor: 12.5 }
                ],
                observaciones: 'Test observations',
                codigoCC: 'CC-TEST',
                codigoFF: 'FF-TEST'
            }

            const mockResponse: LoteDTO = {
                loteID: 20,
                ficha: mockRequest.ficha,
                nomLote: mockRequest.nomLote,
                tipo: mockRequest.tipo,
                cultivarID: mockRequest.cultivarID,
                cultivarNombre: 'Test Cultivar',
                especieNombre: 'Test Especie',
                empresaID: mockRequest.empresaID,
                clienteID: mockRequest.clienteID,
                depositoID: mockRequest.depositoID,
                unidadEmbolsado: mockRequest.unidadEmbolsado,
                kilosLimpios: mockRequest.kilosLimpios,
                numeroArticuloID: mockRequest.numeroArticuloID,
                origenID: mockRequest.origenID,
                estadoID: mockRequest.estadoID,
                fechaEntrega: mockRequest.fechaEntrega,
                fechaRecibo: mockRequest.fechaRecibo,
                fechaCosecha: mockRequest.fechaCosecha,
                remitente: mockRequest.remitente,
                observaciones: mockRequest.observaciones,
                codigoCC: mockRequest.codigoCC,
                codigoFF: mockRequest.codigoFF,
                tiposAnalisisAsignados: mockRequest.tiposAnalisisAsignados,
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockResponse)

            await crearLote(mockRequest)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes', {
                method: 'POST',
                body: JSON.stringify(mockRequest)
            })
        })

        it('debe manejar error en la creación', async () => {
            const mockRequest: LoteRequestDTO = {
                ficha: 'F-DUPLICADO',
                nomLote: 'Duplicado',
                tipo: 'INTERNO',
                cultivarID: 1,
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 100,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                fechaEntrega: '2024-01-01',
                fechaRecibo: '2024-01-05',
                fechaCosecha: '2023-12-20',
                remitente: 'Transportes',
                tiposAnalisisAsignados: [],
                datosHumedad: []
            }

            mockApiFetch.mockRejectedValue(new Error('Ficha duplicada'))

            await expect(crearLote(mockRequest)).rejects.toThrow('Ficha duplicada')
        })
    })

    describe('actualizarLote', () => {
        it('debe actualizar un lote existente', async () => {
            const mockRequest: LoteRequestDTO = {
                ficha: 'F-2024-UPD',
                nomLote: 'Lote Actualizado',
                tipo: 'INTERNO',
                cultivarID: 2,
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 800,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                fechaEntrega: '2024-01-01',
                fechaRecibo: '2024-01-05',
                fechaCosecha: '2023-12-20',
                remitente: 'Transportes XYZ',
                tiposAnalisisAsignados: ['PUREZA', 'GERMINACION'],
                datosHumedad: []
            }

            const mockResponse: LoteDTO = {
                loteID: 5,
                ficha: mockRequest.ficha,
                nomLote: mockRequest.nomLote,
                tipo: mockRequest.tipo,
                cultivarID: mockRequest.cultivarID,
                cultivarNombre: 'Updated',
                especieNombre: 'Trigo',
                empresaID: mockRequest.empresaID,
                clienteID: mockRequest.clienteID,
                depositoID: mockRequest.depositoID,
                unidadEmbolsado: mockRequest.unidadEmbolsado,
                kilosLimpios: mockRequest.kilosLimpios,
                numeroArticuloID: mockRequest.numeroArticuloID,
                origenID: mockRequest.origenID,
                estadoID: mockRequest.estadoID,
                fechaEntrega: mockRequest.fechaEntrega,
                fechaRecibo: mockRequest.fechaRecibo,
                fechaCosecha: mockRequest.fechaCosecha,
                remitente: mockRequest.remitente,
                tiposAnalisisAsignados: mockRequest.tiposAnalisisAsignados,
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockResponse)

            const result = await actualizarLote(5, mockRequest)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/5', {
                method: 'PUT',
                body: JSON.stringify(mockRequest)
            })
            expect(result).toEqual(mockResponse)
        })

        it('debe actualizar lote con diferentes IDs', async () => {
            const mockRequest: LoteRequestDTO = {
                ficha: 'F-999',
                nomLote: 'Test',
                tipo: 'EXTERNO',
                cultivarID: 1,
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 100,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                fechaEntrega: '2024-01-01',
                fechaRecibo: '2024-01-05',
                fechaCosecha: '2023-12-20',
                remitente: 'Test',
                tiposAnalisisAsignados: [],
                datosHumedad: []
            }

            const mockResponse: LoteDTO = {
                loteID: 999,
                ficha: mockRequest.ficha,
                nomLote: mockRequest.nomLote,
                tipo: mockRequest.tipo,
                cultivarID: mockRequest.cultivarID,
                empresaID: mockRequest.empresaID,
                clienteID: mockRequest.clienteID,
                depositoID: mockRequest.depositoID,
                unidadEmbolsado: mockRequest.unidadEmbolsado,
                kilosLimpios: mockRequest.kilosLimpios,
                numeroArticuloID: mockRequest.numeroArticuloID,
                origenID: mockRequest.origenID,
                estadoID: mockRequest.estadoID,
                fechaEntrega: mockRequest.fechaEntrega,
                fechaRecibo: mockRequest.fechaRecibo,
                fechaCosecha: mockRequest.fechaCosecha,
                remitente: mockRequest.remitente,
                tiposAnalisisAsignados: [],
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockResponse)

            await actualizarLote(999, mockRequest)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/999', {
                method: 'PUT',
                body: JSON.stringify(mockRequest)
            })
        })

        it('debe manejar error en la actualización', async () => {
            const mockRequest: LoteRequestDTO = {
                ficha: 'F-ERROR',
                nomLote: 'Error',
                tipo: 'INTERNO',
                cultivarID: 1,
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 100,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                fechaEntrega: '2024-01-01',
                fechaRecibo: '2024-01-05',
                fechaCosecha: '2023-12-20',
                remitente: 'Error Transport',
                tiposAnalisisAsignados: [],
                datosHumedad: []
            }

            mockApiFetch.mockRejectedValue(new Error('Error al actualizar'))

            await expect(actualizarLote(1, mockRequest)).rejects.toThrow('Error al actualizar')
        })
    })

    describe('eliminarLote', () => {
        it('debe eliminar (desactivar) un lote', async () => {
            mockApiFetch.mockResolvedValue(undefined)

            await eliminarLote(1)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/1', {
                method: 'DELETE'
            })
        })

        it('debe eliminar lotes con diferentes IDs', async () => {
            mockApiFetch.mockResolvedValue(undefined)

            await eliminarLote(999)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/999', {
                method: 'DELETE'
            })
        })

        it('debe manejar error al eliminar', async () => {
            mockApiFetch.mockRejectedValue(new Error('No se puede eliminar'))

            await expect(eliminarLote(1)).rejects.toThrow('No se puede eliminar')
        })

        it('debe retornar void al eliminar correctamente', async () => {
            mockApiFetch.mockResolvedValue(undefined)

            const result = await eliminarLote(1)

            expect(result).toBeUndefined()
        })
    })

    describe('activarLote', () => {
        it('debe reactivar un lote inactivo', async () => {
            const mockLote: LoteDTO = {
                loteID: 1,
                ficha: 'F-2024-001',
                nomLote: 'Reactivado',
                tipo: 'INTERNO',
                cultivarID: 1,
                cultivarNombre: 'Test',
                especieNombre: 'Trigo',
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 100,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                tiposAnalisisAsignados: [],
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockLote)

            const result = await activarLote(1)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/1/reactivar', {
                method: 'PUT'
            })
            expect(result.activo).toBe(true)
        })

        it('debe activar lotes con diferentes IDs', async () => {
            const mockLote: LoteDTO = {
                loteID: 555,
                ficha: 'F-555',
                nomLote: 'Test',
                tipo: 'INTERNO',
                cultivarID: 1,
                cultivarNombre: 'Test',
                especieNombre: 'Test',
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 100,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                tiposAnalisisAsignados: [],
                datosHumedad: [],
                activo: true
            }

            mockApiFetch.mockResolvedValue(mockLote)

            await activarLote(555)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/555/reactivar', {
                method: 'PUT'
            })
        })

        it('debe manejar error al activar', async () => {
            mockApiFetch.mockRejectedValue(new Error('No se puede activar'))

            await expect(activarLote(1)).rejects.toThrow('No se puede activar')
        })
    })

    describe('obtenerLotesElegiblesParaTipoAnalisis', () => {
        it('debe obtener lotes elegibles para PUREZA', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                {
                    loteID: 1,
                    ficha: 'F-001',
                    nomLote: 'Lote 1',
                    cultivarNombre: 'Test',
                    especieNombre: 'Trigo',
                    activo: true
                }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result = await obtenerLotesElegiblesParaTipoAnalisis('PUREZA')

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/elegibles/PUREZA')
            expect(result).toEqual(mockLotes)
        })

        it('debe obtener lotes elegibles para GERMINACION', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                {
                    loteID: 2,
                    ficha: 'F-002',
                    nomLote: 'Lote 2',
                    cultivarNombre: 'Test',
                    especieNombre: 'Soja',
                    activo: true
                }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result = await obtenerLotesElegiblesParaTipoAnalisis('GERMINACION')

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/elegibles/GERMINACION')
            expect(result).toEqual(mockLotes)
        })

        it('debe obtener lotes elegibles para TETRAZOLIO', async () => {
            mockApiFetch.mockResolvedValue({ lotes: [] })

            const result = await obtenerLotesElegiblesParaTipoAnalisis('TETRAZOLIO')

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/elegibles/TETRAZOLIO')
            expect(result).toEqual([])
        })

        it('debe retornar array vacío si no hay lotes', async () => {
            mockApiFetch.mockResolvedValue({ lotes: null })

            const result = await obtenerLotesElegiblesParaTipoAnalisis('PUREZA')

            expect(result).toEqual([])
        })
    })

    describe('puedeRemoverTipoAnalisis', () => {
        it('debe indicar que se puede remover el tipo', async () => {
            mockApiFetch.mockResolvedValue({ puedeRemover: true })

            const result = await puedeRemoverTipoAnalisis(1, 'PUREZA')

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/1/puede-remover-tipo/PUREZA')
            expect(result.puedeRemover).toBe(true)
        })

        it('debe indicar que NO se puede remover con razón', async () => {
            mockApiFetch.mockResolvedValue({
                puedeRemover: false,
                razon: 'Tiene análisis de pureza registrados'
            })

            const result = await puedeRemoverTipoAnalisis(1, 'PUREZA')

            expect(result.puedeRemover).toBe(false)
            expect(result.razon).toBe('Tiene análisis de pureza registrados')
        })

        it('debe verificar diferentes tipos de análisis', async () => {
            mockApiFetch.mockResolvedValue({ puedeRemover: true })

            await puedeRemoverTipoAnalisis(1, 'GERMINACION')
            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/1/puede-remover-tipo/GERMINACION')

            await puedeRemoverTipoAnalisis(2, 'TETRAZOLIO')
            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/2/puede-remover-tipo/TETRAZOLIO')
        })

        it('debe manejar error y retornar false con razón', async () => {
            mockApiFetch.mockRejectedValue(new Error('Network error'))

            const result = await puedeRemoverTipoAnalisis(1, 'PUREZA')

            expect(result.puedeRemover).toBe(false)
            expect(result.razon).toBe('Error al verificar el estado del análisis')
            expect(console.error).toHaveBeenCalled()
        })

        it('debe manejar error de servidor', async () => {
            mockApiFetch.mockRejectedValue(new Error('500 Internal Server Error'))

            const result = await puedeRemoverTipoAnalisis(999, 'GERMINACION')

            expect(result.puedeRemover).toBe(false)
            expect(result.razon).toBeDefined()
        })
    })

    describe('obtenerLotesElegibles', () => {
        it('debe obtener lotes elegibles usando la función base', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                {
                    loteID: 1,
                    ficha: 'F-001',
                    nomLote: 'Elegible',
                    cultivarNombre: 'Test',
                    especieNombre: 'Trigo',
                    activo: true
                }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result = await obtenerLotesElegibles('PUREZA')

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/elegibles/PUREZA')
            expect(result).toEqual(mockLotes)
        })

        it('debe propagar errores', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error de red'))

            await expect(obtenerLotesElegibles('GERMINACION')).rejects.toThrow('Error de red')
            expect(console.error).toHaveBeenCalledWith('Error al obtener lotes elegibles:', expect.any(Error))
        })

        it('debe funcionar con diferentes tipos de análisis', async () => {
            mockApiFetch.mockResolvedValue({ lotes: [] })

            await obtenerLotesElegibles('TETRAZOLIO')
            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/elegibles/TETRAZOLIO')
        })
    })

    describe('validarLoteElegible', () => {
        it('debe validar que un lote es elegible', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                {
                    loteID: 5,
                    ficha: 'F-005',
                    nomLote: 'Lote Elegible',
                    cultivarNombre: 'Test',
                    especieNombre: 'Trigo',
                    activo: true
                },
                {
                    loteID: 10,
                    ficha: 'F-010',
                    nomLote: 'Otro Lote',
                    cultivarNombre: 'Test',
                    especieNombre: 'Soja',
                    activo: true
                }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result = await validarLoteElegible(5, 'PUREZA')

            expect(result).toBe(true)
        })

        it('debe validar que un lote NO es elegible', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                {
                    loteID: 1,
                    ficha: 'F-001',
                    nomLote: 'Lote 1',
                    cultivarNombre: 'Test',
                    especieNombre: 'Trigo',
                    activo: true
                }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result = await validarLoteElegible(999, 'PUREZA')

            expect(result).toBe(false)
        })

        it('debe retornar false si la lista está vacía', async () => {
            mockApiFetch.mockResolvedValue({ lotes: [] })

            const result = await validarLoteElegible(1, 'GERMINACION')

            expect(result).toBe(false)
        })

        it('debe manejar error y retornar false', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error de servidor'))

            const result = await validarLoteElegible(1, 'TETRAZOLIO')

            expect(result).toBe(false)
            expect(console.error).toHaveBeenCalledWith('Error al validar lote elegible:', expect.any(Error))
        })

        it('debe validar con diferentes tipos de análisis', async () => {
            const mockLotes: LoteSimpleDTO[] = [
                { loteID: 3, ficha: 'F-003', nomLote: 'Test', cultivarNombre: 'Test', especieNombre: 'Test', activo: true }
            ]

            mockApiFetch.mockResolvedValue({ lotes: mockLotes })

            const result1 = await validarLoteElegible(3, 'PUREZA')
            expect(result1).toBe(true)

            const result2 = await validarLoteElegible(3, 'GERMINACION')
            expect(result2).toBe(true)

            const result3 = await validarLoteElegible(3, 'TETRAZOLIO')
            expect(result3).toBe(true)
        })
    })

    describe('obtenerLotesPaginadas', () => {
        it('debe obtener lotes paginados con parámetros por defecto', async () => {
            const mockResponse = {
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            }

            mockApiFetch.mockResolvedValue(mockResponse)

            const result = await obtenerLotesPaginadas()

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/listado?page=0&size=10&sort=loteID%2Cdesc')
            expect(result).toEqual(mockResponse)
        })

        it('debe obtener lotes con página y tamaño específicos', async () => {
            const mockResponse = {
                content: [
                    {
                        loteID: 1,
                        ficha: 'F-001',
                        nomLote: 'Lote 1',
                        cultivarNombre: 'Test',
                        especieNombre: 'Trigo',
                        activo: true
                    }
                ],
                totalElements: 100,
                totalPages: 5,
                number: 2,
                last: false,
                first: false
            }

            mockApiFetch.mockResolvedValue(mockResponse)

            const result = await obtenerLotesPaginadas(2, 20)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/listado?page=2&size=20&sort=loteID%2Cdesc')
            expect(result.number).toBe(2)
            expect(result.content).toHaveLength(1)
        })

        it('debe filtrar por término de búsqueda', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10, 'Trigo')

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/listado?page=0&size=10&sort=loteID%2Cdesc&search=Trigo')
        })

        it('debe ignorar término de búsqueda vacío', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10, '   ')

            const url = (mockApiFetch as jest.Mock).mock.calls[0][0]
            expect(url).not.toContain('search')
        })

        it('debe filtrar por estado activo', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10, undefined, true)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/listado?page=0&size=10&sort=loteID%2Cdesc&activo=true')
        })

        it('debe filtrar por estado inactivo', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10, undefined, false)

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/listado?page=0&size=10&sort=loteID%2Cdesc&activo=false')
        })

        it('debe ignorar filtro de activo si es null', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10, undefined, null)

            const url = (mockApiFetch as jest.Mock).mock.calls[0][0]
            expect(url).not.toContain('activo')
        })

        it('debe filtrar por cultivar', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10, undefined, undefined, 'Baguette 10')

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/listado?page=0&size=10&sort=loteID%2Cdesc&cultivar=Baguette+10')
        })

        it('debe ignorar cultivar "todos"', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10, undefined, undefined, 'todos')

            const url = (mockApiFetch as jest.Mock).mock.calls[0][0]
            expect(url).not.toContain('cultivar')
        })

        it('debe combinar todos los filtros', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(3, 25, 'Trigo Baguette', true, 'Baguette 10')

            const url = (mockApiFetch as jest.Mock).mock.calls[0][0]
            expect(url).toContain('page=3')
            expect(url).toContain('size=25')
            expect(url).toContain('search=Trigo+Baguette')
            expect(url).toContain('activo=true')
            expect(url).toContain('cultivar=Baguette+10')
        })

        it('debe ordenar por loteID descendente', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true,
                first: true
            })

            await obtenerLotesPaginadas(0, 10)

            expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('sort=loteID%2Cdesc'))
        })
    })

    describe('obtenerEstadisticasLotes', () => {
        it('debe obtener estadísticas de lotes', async () => {
            const mockEstadisticas = {
                total: 150,
                activos: 120,
                inactivos: 30
            }

            mockApiFetch.mockResolvedValue(mockEstadisticas)

            const result = await obtenerEstadisticasLotes()

            expect(mockApiFetch).toHaveBeenCalledWith('/api/lotes/estadisticas')
            expect(result).toEqual(mockEstadisticas)
            expect(result.total).toBe(150)
            expect(result.activos).toBe(120)
            expect(result.inactivos).toBe(30)
        })

        it('debe manejar estadísticas con cero lotes', async () => {
            const mockEstadisticas = {
                total: 0,
                activos: 0,
                inactivos: 0
            }

            mockApiFetch.mockResolvedValue(mockEstadisticas)

            const result = await obtenerEstadisticasLotes()

            expect(result.total).toBe(0)
            expect(result.activos).toBe(0)
            expect(result.inactivos).toBe(0)
        })

        it('debe manejar error al obtener estadísticas', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error del servidor'))

            await expect(obtenerEstadisticasLotes()).rejects.toThrow('Error del servidor')
        })

        it('debe validar que activos + inactivos = total', async () => {
            const mockEstadisticas = {
                total: 100,
                activos: 75,
                inactivos: 25
            }

            mockApiFetch.mockResolvedValue(mockEstadisticas)

            const result = await obtenerEstadisticasLotes()

            expect(result.activos + result.inactivos).toBe(result.total)
        })
    })
})
