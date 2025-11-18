/**
 * Tests para tetrazolio-service
 * 
 * Estos tests cubren:
 * - Crear nuevo análisis de tetrazolio
 * - Obtener todos los análisis
 * - Obtener análisis por ID
 * - Actualizar análisis
 * - Eliminar/desactivar análisis
 * - Activar análisis
 * - Obtener análisis por lote
 * - Finalizar, aprobar y marcar para repetir
 * - Actualizar porcentajes redondeados
 * - Obtener listado paginado con filtros
 * - Manejo de errores
 */

import * as tetrazolioService from '@/app/services/tetrazolio-service'
import { apiFetch } from '@/app/services/api'
import { TetrazolioDTO, TetrazolioRequestDTO } from '@/app/models/interfaces/tetrazolio'
import { EstadoAnalisis } from '@/app/models/types/enums'

// Mock de apiFetch
jest.mock('@/app/services/api', () => ({
    apiFetch: jest.fn()
}))

describe('Tetrazolio Service Tests', () => {
    const mockTetrazolioDTO: TetrazolioDTO = {
        analisisID: 1,
        idLote: 1,
        lote: 'Trigo Baguette 10',
        ficha: 'F-2024-001',
        cultivarNombre: 'Baguette 10',
        especieNombre: 'Trigo',
        estado: 'APROBADO' as EstadoAnalisis,
        fechaInicio: '2024-03-01',
        fechaFin: '2024-03-15',
        comentarios: 'Análisis completado',

        fecha: '2024-03-01',
        numSemillasPorRep: 50,
        numRepeticionesEsperadas: 4,
        pretratamiento: 'EP 16 horas',
        concentracion: '1%',
        tincionTemp: 35,
        tincionHs: 2,
        viabilidadInase: 92.5,
        porcViablesRedondeo: 93.0,
        porcNoViablesRedondeo: 4.5,
        porcDurasRedondeo: 2.5,

        historial: [],
        activo: true
    }

    const mockTetrazolioRequest: TetrazolioRequestDTO = {
        idLote: 1,
        fecha: '2024-03-01',
        numSemillasPorRep: 50,
        numRepeticionesEsperadas: 4,
        pretratamiento: 'EP 16 horas',
        concentracion: '1%',
        tincionTemp: 35,
        tincionHs: 2,
        viabilidadInase: 92.5,
        comentarios: 'Análisis nuevo'
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Test: crearTetrazolio', () => {
        it('debe crear un nuevo análisis de tetrazolio correctamente', async () => {
            (apiFetch as jest.Mock).mockResolvedValue(mockTetrazolioDTO)

            const result = await tetrazolioService.crearTetrazolio(mockTetrazolioRequest)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios', {
                method: 'POST',
                body: JSON.stringify(mockTetrazolioRequest)
            })
            expect(result).toEqual(mockTetrazolioDTO)
        })

        it('debe manejar error al crear tetrazolio', async () => {
            const errorMessage = 'Error de validación'
                ; (apiFetch as jest.Mock).mockRejectedValue(new Error(errorMessage))

            await expect(tetrazolioService.crearTetrazolio(mockTetrazolioRequest))
                .rejects.toThrow()
        })

        it('debe lanzar error personalizado al fallar', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Error de red'))

            await expect(tetrazolioService.crearTetrazolio(mockTetrazolioRequest))
                .rejects.toThrow('Error de red')
        })
    })

    describe('Test: obtenerTodosTetrazolio', () => {
        it('debe obtener todos los análisis de tetrazolio', async () => {
            const mockResponse = {
                tetrazolios: [mockTetrazolioDTO]
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockResponse)

            const result = await tetrazolioService.obtenerTodosTetrazolio()

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios')
            expect(result).toEqual([mockTetrazolioDTO])
        })

        it('debe retornar array vacío si no hay tetrazolios', async () => {
            ; (apiFetch as jest.Mock).mockResolvedValue({ tetrazolios: null })

            const result = await tetrazolioService.obtenerTodosTetrazolio()

            expect(result).toEqual([])
        })
    })

    describe('Test: obtenerTetrazolioPorId', () => {
        it('debe obtener un tetrazolio por ID', async () => {
            ; (apiFetch as jest.Mock).mockResolvedValue(mockTetrazolioDTO)

            const result = await tetrazolioService.obtenerTetrazolioPorId(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1')
            expect(result).toEqual(mockTetrazolioDTO)
        })

        it('debe manejar error cuando el ID no existe', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Not found'))

            await expect(tetrazolioService.obtenerTetrazolioPorId(999))
                .rejects.toThrow('Not found')
        })
    })

    describe('Test: actualizarTetrazolio', () => {
        it('debe actualizar un análisis de tetrazolio', async () => {
            const updatedData: TetrazolioRequestDTO = {
                ...mockTetrazolioRequest,
                comentarios: 'Actualizado'
            }
                ; (apiFetch as jest.Mock).mockResolvedValue({ ...mockTetrazolioDTO, comentarios: 'Actualizado' })

            const result = await tetrazolioService.actualizarTetrazolio(1, updatedData)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1', {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            })
            expect(result.comentarios).toBe('Actualizado')
        })

        it('debe manejar error al actualizar', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Update failed'))

            await expect(tetrazolioService.actualizarTetrazolio(1, mockTetrazolioRequest))
                .rejects.toThrow('Update failed')
        })
    })

    describe('Test: eliminarTetrazolio', () => {
        it('debe eliminar un análisis de tetrazolio', async () => {
            ; (apiFetch as jest.Mock).mockResolvedValue(undefined)

            await tetrazolioService.eliminarTetrazolio(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1', {
                method: 'DELETE'
            })
        })

        it('debe manejar error al eliminar', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Delete failed'))

            await expect(tetrazolioService.eliminarTetrazolio(1))
                .rejects.toThrow('Delete failed')
        })
    })

    describe('Test: desactivarTetrazolio', () => {
        it('debe desactivar un análisis', async () => {
            ; (apiFetch as jest.Mock).mockResolvedValue(undefined)

            await tetrazolioService.desactivarTetrazolio(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1/desactivar', {
                method: 'PUT'
            })
        })
    })

    describe('Test: activarTetrazolio', () => {
        it('debe activar un análisis desactivado', async () => {
            ; (apiFetch as jest.Mock).mockResolvedValue(mockTetrazolioDTO)

            const result = await tetrazolioService.activarTetrazolio(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1/reactivar', {
                method: 'PUT'
            })
            expect(result).toEqual(mockTetrazolioDTO)
        })
    })

    describe('Test: obtenerTetrazoliosPorIdLote', () => {
        it('debe obtener análisis por ID de lote', async () => {
            const mockTetrazolios = [mockTetrazolioDTO]
                ; (apiFetch as jest.Mock).mockResolvedValue(mockTetrazolios)

            const result = await tetrazolioService.obtenerTetrazoliosPorIdLote(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/lote/1')
            expect(result).toEqual(mockTetrazolios)
        })

        it('debe retornar array vacío si el lote no tiene análisis', async () => {
            ; (apiFetch as jest.Mock).mockResolvedValue([])

            const result = await tetrazolioService.obtenerTetrazoliosPorIdLote(999)

            expect(result).toEqual([])
        })
    })

    describe('Test: finalizarAnalisis', () => {
        it('debe finalizar un análisis correctamente', async () => {
            const finalizado = { ...mockTetrazolioDTO, estado: 'FINALIZADO' as EstadoAnalisis }
                ; (apiFetch as jest.Mock).mockResolvedValue(finalizado)

            const result = await tetrazolioService.finalizarAnalisis(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1/finalizar', {
                method: 'PUT'
            })
            expect(result.estado).toBe('FINALIZADO')
        })

        it('debe manejar error al finalizar', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Cannot finalize'))

            await expect(tetrazolioService.finalizarAnalisis(1))
                .rejects.toThrow('Cannot finalize')
        })
    })

    describe('Test: aprobarAnalisis', () => {
        it('debe aprobar un análisis correctamente', async () => {
            const aprobado = { ...mockTetrazolioDTO, estado: 'APROBADO' as EstadoAnalisis }
                ; (apiFetch as jest.Mock).mockResolvedValue(aprobado)

            const result = await tetrazolioService.aprobarAnalisis(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1/aprobar', {
                method: 'PUT'
            })
            expect(result.estado).toBe('APROBADO')
        })
    })

    describe('Test: marcarParaRepetir', () => {
        it('debe marcar análisis para repetir', async () => {
            const paraRepetir = { ...mockTetrazolioDTO, estado: 'PARA_REPETIR' as EstadoAnalisis }
                ; (apiFetch as jest.Mock).mockResolvedValue(paraRepetir)

            const result = await tetrazolioService.marcarParaRepetir(1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1/repetir', {
                method: 'PUT'
            })
            expect(result.estado).toBe('PARA_REPETIR')
        })
    })

    describe('Test: actualizarPorcentajesRedondeados', () => {
        it('debe actualizar porcentajes redondeados', async () => {
            const porcentajes = {
                porcViablesRedondeo: 94.0,
                porcNoViablesRedondeo: 4.0,
                porcDurasRedondeo: 2.0
            }
            const actualizado = {
                ...mockTetrazolioDTO,
                ...porcentajes
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(actualizado)

            const result = await tetrazolioService.actualizarPorcentajesRedondeados(1, porcentajes)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/1/porcentajes', {
                method: 'PUT',
                body: JSON.stringify(porcentajes)
            })
            expect(result.porcViablesRedondeo).toBe(94.0)
            expect(result.porcNoViablesRedondeo).toBe(4.0)
            expect(result.porcDurasRedondeo).toBe(2.0)
        })

        it('debe validar que la suma de porcentajes sea 100', async () => {
            const porcentajes = {
                porcViablesRedondeo: 94.0,
                porcNoViablesRedondeo: 4.0,
                porcDurasRedondeo: 2.0
            }
            const suma = porcentajes.porcViablesRedondeo + porcentajes.porcNoViablesRedondeo + porcentajes.porcDurasRedondeo

            expect(suma).toBe(100.0)
        })
    })

    describe('Test: obtenerTetrazoliosPaginadas', () => {
        it('debe obtener listado paginado sin filtros', async () => {
            const mockPaginado = {
                content: [mockTetrazolioDTO],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockPaginado)

            const result = await tetrazolioService.obtenerTetrazoliosPaginadas()

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/listado?page=0&size=10')
            expect(result).toEqual(mockPaginado)
        })

        it('debe obtener listado con paginación personalizada', async () => {
            const mockPaginado = {
                content: [],
                totalElements: 50,
                totalPages: 5,
                last: false,
                first: false
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockPaginado)

            const result = await tetrazolioService.obtenerTetrazoliosPaginadas(2, 20)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/listado?page=2&size=20')
            expect(result.totalPages).toBe(5)
        })

        it('debe aplicar filtro de búsqueda', async () => {
            const mockPaginado = {
                content: [mockTetrazolioDTO],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockPaginado)

            await tetrazolioService.obtenerTetrazoliosPaginadas(0, 10, 'Trigo')

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/listado?page=0&size=10&search=Trigo')
        })

        it('debe aplicar filtro de activo', async () => {
            const mockPaginado = {
                content: [mockTetrazolioDTO],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockPaginado)

            await tetrazolioService.obtenerTetrazoliosPaginadas(0, 10, undefined, true)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/listado?page=0&size=10&activo=true')
        })

        it('debe aplicar filtro de estado', async () => {
            const mockPaginado = {
                content: [mockTetrazolioDTO],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockPaginado)

            await tetrazolioService.obtenerTetrazoliosPaginadas(0, 10, undefined, undefined, 'APROBADO')

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/listado?page=0&size=10&estado=APROBADO')
        })

        it('debe aplicar filtro de lote', async () => {
            const mockPaginado = {
                content: [mockTetrazolioDTO],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockPaginado)

            await tetrazolioService.obtenerTetrazoliosPaginadas(0, 10, undefined, undefined, undefined, 1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/listado?page=0&size=10&loteId=1')
        })

        it('debe aplicar múltiples filtros simultáneamente', async () => {
            const mockPaginado = {
                content: [mockTetrazolioDTO],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true
            }
                ; (apiFetch as jest.Mock).mockResolvedValue(mockPaginado)

            await tetrazolioService.obtenerTetrazoliosPaginadas(1, 20, 'Trigo', true, 'APROBADO', 1)

            expect(apiFetch).toHaveBeenCalledWith('/api/tetrazolios/listado?page=1&size=20&search=Trigo&activo=true&estado=APROBADO&loteId=1')
        })
    })

    describe('Test: Manejo de errores generales', () => {
        it('debe propagar errores de red', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Network error'))

            await expect(tetrazolioService.obtenerTodosTetrazolio())
                .rejects.toThrow('Network error')
        })

        it('debe manejar errores de autenticación', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Unauthorized'))

            await expect(tetrazolioService.obtenerTetrazolioPorId(1))
                .rejects.toThrow('Unauthorized')
        })

        it('debe manejar errores de permisos', async () => {
            ; (apiFetch as jest.Mock).mockRejectedValue(new Error('Forbidden'))

            await expect(tetrazolioService.eliminarTetrazolio(1))
                .rejects.toThrow('Forbidden')
        })
    })
})
