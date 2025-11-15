import {
  crearPureza,
  obtenerPurezaPorId,
  actualizarPureza,
  desactivarPureza,
  activarPureza,
  obtenerPurezasPorIdLote,
  obtenerPurezasPaginadas,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir,
} from '@/app/services/pureza-service'
import { apiFetch } from '@/app/services/api'
import type { PurezaDTO, PurezaRequestDTO } from '@/app/models'
import type { EstadoAnalisis } from '@/app/models/types/enums'

// Mock del módulo api
jest.mock('@/app/services/api', () => ({
  apiFetch: jest.fn(),
}))

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

describe('Pureza Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockPurezaId = 1
  const mockLoteId = 5

  const mockPurezaDTO: PurezaDTO = {
    analisisID: mockPurezaId,
    idLote: mockLoteId,
    lote: 'LOTE-001',
    ficha: 'FICHA-001',
    cultivarNombre: 'Cultivar Test',
    especieNombre: 'Especie Test',
    estado: 'EN_PROCESO',
    fechaInicio: '2024-01-10',
    fecha: '2024-01-10',
    pesoInicial_g: 100.0,
    pesoTotal_g: 100.0,
    semillaPura_g: 95.0,
    materiaInerte_g: 3.0,
    otrosCultivos_g: 0.0,
    malezas_g: 2.0,
    malezasToleradas_g: 0.0,
    malezasTolCero_g: 0.0,
    otrasSemillas: [],
    historial: [],
    activo: true,
  }

  const mockPurezaRequest: PurezaRequestDTO = {
    idLote: mockLoteId,
    fecha: '2024-01-10',
    pesoInicial_g: 100.0,
    pesoTotal_g: 100.0,
    semillaPura_g: 95.0,
    materiaInerte_g: 3.0,
    otrosCultivos_g: 0.0,
    malezas_g: 2.0,
    malezasToleradas_g: 0.0,
    malezasTolCero_g: 0.0,
    otrasSemillas: [],
  }

  describe('crearPureza', () => {
    it('debe crear un análisis de pureza exitosamente', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPurezaDTO)

      // Act
      const result = await crearPureza(mockPurezaRequest)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/purezas',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockPurezaRequest),
        })
      )
      expect(result).toEqual(mockPurezaDTO)
      expect(result.estado).toBe('EN_PROCESO')
    })

    it('debe manejar errores de validación al crear pureza', async () => {
      // Arrange
      const error = { status: 400, message: 'Peso total no puede ser menor que peso inicial' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(crearPureza(mockPurezaRequest)).rejects.toEqual(error)
    })

    it('debe manejar error cuando el lote no existe', async () => {
      // Arrange
      const error = { status: 404, message: 'Lote no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      const invalidRequest = { ...mockPurezaRequest, idLote: 999 }

      // Act & Assert
      await expect(crearPureza(invalidRequest)).rejects.toEqual(error)
    })

    it('debe validar pesos negativos', async () => {
      // Arrange
      const error = { status: 400, message: 'Los pesos deben ser valores positivos' }
      mockApiFetch.mockRejectedValueOnce(error)

      const invalidRequest = { ...mockPurezaRequest, pesoInicial_g: -10.0 }

      // Act & Assert
      await expect(crearPureza(invalidRequest)).rejects.toEqual(error)
    })
  })

  describe('obtenerPurezaPorId', () => {
    it('debe obtener un análisis de pureza por ID', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPurezaDTO)

      // Act
      const result = await obtenerPurezaPorId(mockPurezaId)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(`/api/purezas/${mockPurezaId}`)
      expect(result).toEqual(mockPurezaDTO)
      expect(result.analisisID).toBe(mockPurezaId)
    })

    it('debe manejar error 404 cuando el análisis no existe', async () => {
      // Arrange
      const error = { status: 404, message: 'Análisis de pureza no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(obtenerPurezaPorId(999)).rejects.toEqual(error)
    })

    it('debe incluir información del lote en el resultado', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPurezaDTO)

      // Act
      const result = await obtenerPurezaPorId(mockPurezaId)

      // Assert
      expect(result.lote).toBeDefined()
      expect(result.idLote).toBe(mockLoteId)
      expect(result.lote).toBe('LOTE-001')
    })
  })

  describe('actualizarPureza', () => {
    it('debe actualizar un análisis de pureza exitosamente', async () => {
      // Arrange
      const updatedData: PurezaRequestDTO = {
        ...mockPurezaRequest,
        semillaPura_g: 96.0,
        materiaInerte_g: 2.5,
      }
      const updatedPureza: PurezaDTO = {
        ...mockPurezaDTO,
        semillaPura_g: 96.0,
        materiaInerte_g: 2.5,
      }
      mockApiFetch.mockResolvedValueOnce(updatedPureza)

      // Act
      const result = await actualizarPureza(mockPurezaId, updatedData)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/api/purezas/${mockPurezaId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updatedData),
        })
      )
      expect(result.semillaPura_g).toBe(96.0)
      expect(result.materiaInerte_g).toBe(2.5)
    })

    it('debe manejar errores de validación en actualización', async () => {
      // Arrange
      const invalidData: PurezaRequestDTO = {
        ...mockPurezaRequest,
        pesoTotal_g: 95.0, // menor que pesoInicial
      }
      const error = { status: 400, message: 'Peso total no puede ser menor que peso inicial' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(actualizarPureza(mockPurezaId, invalidData)).rejects.toEqual(error)
    })

    it('debe permitir actualizar otros campos opcionales', async () => {
      // Arrange
      const updatedData: PurezaRequestDTO = {
        ...mockPurezaRequest,
        comentarios: 'Análisis revisado',
        cumpleEstandar: true,
      }
      const updatedPureza: PurezaDTO = {
        ...mockPurezaDTO,
        comentarios: 'Análisis revisado',
        cumpleEstandar: true,
      }
      mockApiFetch.mockResolvedValueOnce(updatedPureza)

      // Act
      const result = await actualizarPureza(mockPurezaId, updatedData)

      // Assert
      expect(result.comentarios).toBe('Análisis revisado')
      expect(result.cumpleEstandar).toBe(true)
    })

    it('debe manejar error al actualizar análisis inexistente', async () => {
      // Arrange
      const error = { status: 404, message: 'Análisis no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(actualizarPureza(999, mockPurezaRequest)).rejects.toEqual(error)
    })
  })

  describe('desactivarPureza', () => {
    it('debe desactivar un análisis de pureza exitosamente', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(undefined)

      // Act
      await desactivarPureza(mockPurezaId)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/api/purezas/${mockPurezaId}/desactivar`,
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })

    it('debe manejar error al desactivar análisis inexistente', async () => {
      // Arrange
      const error = { status: 404, message: 'Análisis no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(desactivarPureza(999)).rejects.toEqual(error)
    })

    it('debe manejar error al desactivar análisis ya desactivado', async () => {
      // Arrange
      const error = { status: 400, message: 'El análisis ya está desactivado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(desactivarPureza(mockPurezaId)).rejects.toEqual(error)
    })
  })

  describe('activarPureza', () => {
    it('debe reactivar un análisis de pureza exitosamente', async () => {
      // Arrange
      const reactivatedPureza: PurezaDTO = {
        ...mockPurezaDTO,
        activo: true,
      }
      mockApiFetch.mockResolvedValueOnce(reactivatedPureza)

      // Act
      const result = await activarPureza(mockPurezaId)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/api/purezas/${mockPurezaId}/reactivar`,
        expect.objectContaining({
          method: 'PUT',
        })
      )
      expect(result.activo).toBe(true)
    })

    it('debe manejar error al reactivar análisis inexistente', async () => {
      // Arrange
      const error = { status: 404, message: 'Análisis no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(activarPureza(999)).rejects.toEqual(error)
    })

    it('debe manejar error al reactivar análisis ya activo', async () => {
      // Arrange
      const error = { status: 400, message: 'El análisis ya está activo' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(activarPureza(mockPurezaId)).rejects.toEqual(error)
    })
  })

  describe('obtenerPurezasPorIdLote', () => {
    it('debe obtener todos los análisis de pureza de un lote', async () => {
      // Arrange
      const mockPurezas: PurezaDTO[] = [
        mockPurezaDTO,
        { ...mockPurezaDTO, analisisID: 2, semillaPura_g: 94.5 },
        { ...mockPurezaDTO, analisisID: 3, semillaPura_g: 95.5 },
      ]
      mockApiFetch.mockResolvedValueOnce(mockPurezas)

      // Act
      const result = await obtenerPurezasPorIdLote(mockLoteId)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(`/api/purezas/lote/${mockLoteId}`)
      expect(result).toEqual(mockPurezas)
      expect(result).toHaveLength(3)
    })

    it('debe retornar array vacío cuando el lote no tiene análisis', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce([])

      // Act
      const result = await obtenerPurezasPorIdLote(mockLoteId)

      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('debe manejar error cuando el lote no existe', async () => {
      // Arrange
      const error = { status: 404, message: 'Lote no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(obtenerPurezasPorIdLote(999)).rejects.toEqual(error)
    })
  })

  describe('obtenerPurezasPaginadas', () => {
    const mockPaginatedResponse = {
      content: [mockPurezaDTO],
      totalElements: 1,
      totalPages: 1,
      last: true,
      first: true,
    }

    it('debe obtener análisis de pureza con paginación por defecto', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPaginatedResponse)

      // Act
      const result = await obtenerPurezasPaginadas()

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith('/api/purezas/listado?page=0&size=10')
      expect(result).toEqual(mockPaginatedResponse)
      expect(result.content).toHaveLength(1)
    })

    it('debe obtener análisis con página y tamaño personalizados', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPaginatedResponse)

      // Act
      const result = await obtenerPurezasPaginadas(2, 20)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith('/api/purezas/listado?page=2&size=20')
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('debe filtrar por texto de búsqueda', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPaginatedResponse)

      // Act
      const result = await obtenerPurezasPaginadas(0, 10, 'LOTE-001')

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/purezas/listado?page=0&size=10&search=LOTE-001'
      )
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('debe filtrar por estado activo', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPaginatedResponse)

      // Act
      const result = await obtenerPurezasPaginadas(0, 10, undefined, true)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith('/api/purezas/listado?page=0&size=10&activo=true')
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('debe filtrar por estado del análisis', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPaginatedResponse)

      // Act
      const result = await obtenerPurezasPaginadas(0, 10, undefined, undefined, 'EN_PROCESO')

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/purezas/listado?page=0&size=10&estado=EN_PROCESO'
      )
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('debe filtrar por ID de lote', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPaginatedResponse)

      // Act
      const result = await obtenerPurezasPaginadas(0, 10, undefined, undefined, undefined, 5)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith('/api/purezas/listado?page=0&size=10&loteId=5')
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('debe combinar múltiples filtros', async () => {
      // Arrange
      mockApiFetch.mockResolvedValueOnce(mockPaginatedResponse)

      // Act
      const result = await obtenerPurezasPaginadas(1, 15, 'LOTE', true, 'APROBADO', 5)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/purezas/listado?page=1&size=15&search=LOTE&activo=true&estado=APROBADO&loteId=5'
      )
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('debe retornar página vacía cuando no hay resultados', async () => {
      // Arrange
      const emptyResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
      }
      mockApiFetch.mockResolvedValueOnce(emptyResponse)

      // Act
      const result = await obtenerPurezasPaginadas()

      // Assert
      expect(result.content).toEqual([])
      expect(result.totalElements).toBe(0)
    })
  })

  describe('finalizarAnalisis', () => {
    it('debe finalizar un análisis de pureza exitosamente', async () => {
      // Arrange
      const finalizadoPureza: PurezaDTO = {
        ...mockPurezaDTO,
        estado: 'PENDIENTE_APROBACION',
        fechaFin: '2024-01-15',
      }
      mockApiFetch.mockResolvedValueOnce(finalizadoPureza)

      // Act
      const result = await finalizarAnalisis(mockPurezaId)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/api/purezas/${mockPurezaId}/finalizar`,
        expect.objectContaining({
          method: 'PUT',
        })
      )
      expect(result.estado).toBe('PENDIENTE_APROBACION')
      expect(result.fechaFin).toBeDefined()
    })

    it('debe manejar error al finalizar análisis sin datos completos', async () => {
      // Arrange
      const error = { status: 400, message: 'No se puede finalizar: faltan datos obligatorios' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(finalizarAnalisis(mockPurezaId)).rejects.toEqual(error)
    })

    it('debe manejar error al finalizar análisis inexistente', async () => {
      // Arrange
      const error = { status: 404, message: 'Análisis no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(finalizarAnalisis(999)).rejects.toEqual(error)
    })

    it('debe manejar error al finalizar análisis ya finalizado', async () => {
      // Arrange
      const error = { status: 400, message: 'El análisis ya está finalizado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(finalizarAnalisis(mockPurezaId)).rejects.toEqual(error)
    })
  })

  describe('aprobarAnalisis', () => {
    it('debe aprobar un análisis de pureza exitosamente', async () => {
      // Arrange
      const aprobadoPureza: PurezaDTO = {
        ...mockPurezaDTO,
        estado: 'APROBADO',
        fechaFin: '2024-01-20',
      }
      mockApiFetch.mockResolvedValueOnce(aprobadoPureza)

      // Act
      const result = await aprobarAnalisis(mockPurezaId)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/api/purezas/${mockPurezaId}/aprobar`,
        expect.objectContaining({
          method: 'PUT',
        })
      )
      expect(result.estado).toBe('APROBADO')
      expect(result.fechaFin).toBeDefined()
    })

    it('debe manejar error al aprobar análisis no finalizado', async () => {
      // Arrange
      const error = { status: 400, message: 'Solo se pueden aprobar análisis finalizados' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(aprobarAnalisis(mockPurezaId)).rejects.toEqual(error)
    })

    it('debe manejar error al aprobar análisis inexistente', async () => {
      // Arrange
      const error = { status: 404, message: 'Análisis no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(aprobarAnalisis(999)).rejects.toEqual(error)
    })

    it('debe manejar error al aprobar sin permisos', async () => {
      // Arrange
      const error = { status: 403, message: 'No tiene permisos para aprobar análisis' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(aprobarAnalisis(mockPurezaId)).rejects.toEqual(error)
    })
  })

  describe('marcarParaRepetir', () => {
    it('debe marcar un análisis para repetir exitosamente', async () => {
      // Arrange
      const repetirPureza: PurezaDTO = {
        ...mockPurezaDTO,
        estado: 'A_REPETIR',
      }
      mockApiFetch.mockResolvedValueOnce(repetirPureza)

      // Act
      const result = await marcarParaRepetir(mockPurezaId)

      // Assert
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/api/purezas/${mockPurezaId}/repetir`,
        expect.objectContaining({
          method: 'PUT',
        })
      )
      expect(result.estado).toBe('A_REPETIR')
    })

    it('debe manejar error al marcar análisis inexistente', async () => {
      // Arrange
      const error = { status: 404, message: 'Análisis no encontrado' }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(marcarParaRepetir(999)).rejects.toEqual(error)
    })

    it('debe manejar error al marcar análisis no finalizado', async () => {
      // Arrange
      const error = {
        status: 400,
        message: 'Solo se pueden marcar para repetir análisis finalizados',
      }
      mockApiFetch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(marcarParaRepetir(mockPurezaId)).rejects.toEqual(error)
    })

    it('debe permitir marcar para repetir análisis aprobado', async () => {
      // Arrange
      const repetirPureza: PurezaDTO = {
        ...mockPurezaDTO,
        estado: 'A_REPETIR',
      }
      mockApiFetch.mockResolvedValueOnce(repetirPureza)

      // Act
      const result = await marcarParaRepetir(mockPurezaId)

      // Assert
      expect(result.estado).toBe('A_REPETIR')
    })
  })

  // Tests de integración
  describe('Flujo completo de análisis de pureza', () => {
    it('debe completar el flujo: crear -> actualizar -> finalizar -> aprobar', async () => {
      // Crear
      const creado = { ...mockPurezaDTO, estado: 'EN_PROCESO' }
      mockApiFetch.mockResolvedValueOnce(creado)
      const resultCrear = await crearPureza(mockPurezaRequest)
      expect(resultCrear.estado).toBe('EN_PROCESO')

      // Actualizar
      const actualizado = { ...creado, semillaPura_g: 96.0 }
      mockApiFetch.mockResolvedValueOnce(actualizado)
      const resultActualizar = await actualizarPureza(mockPurezaId, {
        ...mockPurezaRequest,
        semillaPura_g: 96.0,
      })
      expect(resultActualizar.semillaPura_g).toBe(96.0)

      // Finalizar
      const finalizado = { ...actualizado, estado: 'PENDIENTE_APROBACION' as EstadoAnalisis, fechaFin: '2024-01-15' }
      mockApiFetch.mockResolvedValueOnce(finalizado)
      const resultFinalizar = await finalizarAnalisis(mockPurezaId)
      expect(resultFinalizar.estado).toBe('PENDIENTE_APROBACION')

      // Aprobar
      const aprobado = { ...finalizado, estado: 'APROBADO' as EstadoAnalisis, fechaFin: '2024-01-20' }
      mockApiFetch.mockResolvedValueOnce(aprobado)
      const resultAprobar = await aprobarAnalisis(mockPurezaId)
      expect(resultAprobar.estado).toBe('APROBADO')
    })

    it('debe manejar desactivación y reactivación', async () => {
      // Desactivar
      mockApiFetch.mockResolvedValueOnce(undefined)
      await desactivarPureza(mockPurezaId)

      // Reactivar
      const reactivado = { ...mockPurezaDTO, activo: true }
      mockApiFetch.mockResolvedValueOnce(reactivado)
      const result = await activarPureza(mockPurezaId)
      expect(result.activo).toBe(true)
    })
  })
})
