import {
  // RepPms functions
  crearRepPms,
  obtenerRepeticionesPorPms,
  contarRepeticionesPorPms,
  obtenerRepPmsPorId,
  actualizarRepPms,
  eliminarRepPms,
  // RepTetrazolioViabilidad functions
  crearRepTetrazolioViabilidad,
  obtenerRepeticionesPorTetrazolio,
  obtenerRepTetrazolioViabilidadPorId,
  actualizarRepTetrazolioViabilidad,
  eliminarRepTetrazolioViabilidad,
  // TablaGerm functions
  crearTablaGerm,
  obtenerTablasPorGerminacion,
  contarTablasPorGerminacion,
  obtenerTablaGermPorId,
  actualizarTablaGerm,
  eliminarTablaGerm,
  finalizarTabla,
  puedeIngresarPorcentajes,
  actualizarPorcentajes,
} from '@/app/services/repeticiones-service'
import { apiFetch } from '@/app/services/api'
import type {
  RepPmsDTO,
  RepPmsRequestDTO,
  RepTetrazolioViabilidadDTO,
  RepTetrazolioViabilidadRequestDTO,
  TablaGermDTO,
  TablaGermRequestDTO,
  PorcentajesRedondeoRequestDTO,
} from '@/app/models/interfaces/repeticiones'

// Mock del módulo api
jest.mock('@/app/services/api', () => ({
  apiFetch: jest.fn(),
}))

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

describe('Repeticiones Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ========================
  // REPETICIONES DE PMS (RepPms)
  // ========================
  describe('RepPms Service', () => {
    const mockPmsId = 1
    const mockRepId = 10

    const mockRepPmsDTO: RepPmsDTO = {
      repPMSID: mockRepId,
      numRep: 1,
      numTanda: 1,
      peso: 45.5,
      valido: true,
      pms: {
        pmsID: mockPmsId,
      },
    }

    const mockRepPmsRequest: RepPmsRequestDTO = {
      numRep: 1,
      numTanda: 1,
      peso: 45.5,
      valido: true,
    }

    describe('crearRepPms', () => {
      it('debe crear una repetición de PMS exitosamente', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(mockRepPmsDTO)

        // Act
        const result = await crearRepPms(mockPmsId, mockRepPmsRequest)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/pms/${mockPmsId}/repeticiones`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(mockRepPmsRequest),
          })
        )
        expect(result).toEqual(mockRepPmsDTO)
      })

      it('debe manejar errores de validación al crear repetición', async () => {
        // Arrange
        const error = { status: 400, message: 'Peso inválido' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(crearRepPms(mockPmsId, mockRepPmsRequest)).rejects.toEqual(error)
      })
    })

    describe('obtenerRepeticionesPorPms', () => {
      it('debe obtener todas las repeticiones de un PMS', async () => {
        // Arrange
        const mockRepeticiones: RepPmsDTO[] = [
          mockRepPmsDTO,
          { ...mockRepPmsDTO, repPMSID: 11, numRep: 2, peso: 46.2 },
        ]
        mockApiFetch.mockResolvedValueOnce(mockRepeticiones)

        // Act
        const result = await obtenerRepeticionesPorPms(mockPmsId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(`/api/pms/${mockPmsId}/repeticiones`)
        expect(result).toEqual(mockRepeticiones)
        expect(result).toHaveLength(2)
      })

      it('debe retornar array vacío cuando no hay repeticiones', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce([])

        // Act
        const result = await obtenerRepeticionesPorPms(mockPmsId)

        // Assert
        expect(result).toEqual([])
      })
    })

    describe('contarRepeticionesPorPms', () => {
      it('debe contar las repeticiones de un PMS', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(8)

        // Act
        const result = await contarRepeticionesPorPms(mockPmsId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(`/api/pms/${mockPmsId}/repeticiones/count`)
        expect(result).toBe(8)
      })
    })

    describe('obtenerRepPmsPorId', () => {
      it('debe obtener una repetición específica de PMS', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(mockRepPmsDTO)

        // Act
        const result = await obtenerRepPmsPorId(mockPmsId, mockRepId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/pms/${mockPmsId}/repeticiones/${mockRepId}`
        )
        expect(result).toEqual(mockRepPmsDTO)
      })

      it('debe manejar error 404 cuando la repetición no existe', async () => {
        // Arrange
        const error = { status: 404, message: 'Repetición no encontrada' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(obtenerRepPmsPorId(mockPmsId, 999)).rejects.toEqual(error)
      })
    })

    describe('actualizarRepPms', () => {
      it('debe actualizar una repetición de PMS exitosamente', async () => {
        // Arrange
        const updatedData: RepPmsRequestDTO = {
          ...mockRepPmsRequest,
          peso: 47.3,
        }
        const updatedRepPms: RepPmsDTO = {
          ...mockRepPmsDTO,
          peso: 47.3,
        }
        mockApiFetch.mockResolvedValueOnce(updatedRepPms)

        // Act
        const result = await actualizarRepPms(mockPmsId, mockRepId, updatedData)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/pms/${mockPmsId}/repeticiones/${mockRepId}`,
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updatedData),
          })
        )
        expect(result.peso).toBe(47.3)
      })

      it('debe manejar errores de validación en actualización', async () => {
        // Arrange
        const invalidData: RepPmsRequestDTO = {
          ...mockRepPmsRequest,
          peso: -10, // peso negativo inválido
        }
        const error = { status: 400, message: 'Peso debe ser positivo' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(actualizarRepPms(mockPmsId, mockRepId, invalidData)).rejects.toEqual(
          error
        )
      })
    })

    describe('eliminarRepPms', () => {
      it('debe eliminar una repetición de PMS exitosamente', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(undefined)

        // Act
        await eliminarRepPms(mockPmsId, mockRepId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/pms/${mockPmsId}/repeticiones/${mockRepId}`,
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })

      it('debe manejar error al eliminar repetición inexistente', async () => {
        // Arrange
        const error = { status: 404, message: 'Repetición no encontrada' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(eliminarRepPms(mockPmsId, 999)).rejects.toEqual(error)
      })
    })
  })

  // ========================
  // REPETICIONES DE TETRAZOLIO (RepTetrazolioViabilidad)
  // ========================
  describe('RepTetrazolioViabilidad Service', () => {
    const mockTetrazolioId = 5
    const mockRepId = 20

    const mockRepTetrazolioDTO: RepTetrazolioViabilidadDTO = {
      repTetrazolioViabID: mockRepId,
      fecha: '2024-01-15',
      viablesNum: 85,
      noViablesNum: 10,
      duras: 5,
      tetrazolio: {
        tetrazolioID: mockTetrazolioId,
      },
    }

    const mockRepTetrazolioRequest: RepTetrazolioViabilidadRequestDTO = {
      fecha: '2024-01-15',
      viablesNum: 85,
      noViablesNum: 10,
      duras: 5,
    }

    describe('crearRepTetrazolioViabilidad', () => {
      it('debe crear una repetición de tetrazolio exitosamente', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(mockRepTetrazolioDTO)

        // Act
        const result = await crearRepTetrazolioViabilidad(
          mockTetrazolioId,
          mockRepTetrazolioRequest
        )

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/tetrazolios/${mockTetrazolioId}/repeticiones`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(mockRepTetrazolioRequest),
          })
        )
        expect(result).toEqual(mockRepTetrazolioDTO)
      })

      it('debe validar que la suma de semillas sea correcta', async () => {
        // Arrange
        const invalidData: RepTetrazolioViabilidadRequestDTO = {
          fecha: '2024-01-15',
          viablesNum: 85,
          noViablesNum: 10,
          duras: 100, // suma incorrecta
        }
        const error = { status: 400, message: 'La suma de semillas no coincide' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(
          crearRepTetrazolioViabilidad(mockTetrazolioId, invalidData)
        ).rejects.toEqual(error)
      })
    })

    describe('obtenerRepeticionesPorTetrazolio', () => {
      it('debe obtener todas las repeticiones de un tetrazolio', async () => {
        // Arrange
        const mockRepeticiones: RepTetrazolioViabilidadDTO[] = [
          mockRepTetrazolioDTO,
          {
            ...mockRepTetrazolioDTO,
            repTetrazolioViabID: 21,
            viablesNum: 88,
            noViablesNum: 8,
            duras: 4,
          },
        ]
        mockApiFetch.mockResolvedValueOnce(mockRepeticiones)

        // Act
        const result = await obtenerRepeticionesPorTetrazolio(mockTetrazolioId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/tetrazolios/${mockTetrazolioId}/repeticiones`
        )
        expect(result).toEqual(mockRepeticiones)
        expect(result).toHaveLength(2)
      })

      it('debe retornar array vacío cuando no hay repeticiones', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce([])

        // Act
        const result = await obtenerRepeticionesPorTetrazolio(mockTetrazolioId)

        // Assert
        expect(result).toEqual([])
      })
    })

    describe('obtenerRepTetrazolioViabilidadPorId', () => {
      it('debe obtener una repetición específica de tetrazolio', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(mockRepTetrazolioDTO)

        // Act
        const result = await obtenerRepTetrazolioViabilidadPorId(mockTetrazolioId, mockRepId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/tetrazolios/${mockTetrazolioId}/repeticiones/${mockRepId}`
        )
        expect(result).toEqual(mockRepTetrazolioDTO)
      })

      it('debe manejar error 404 cuando la repetición no existe', async () => {
        // Arrange
        const error = { status: 404, message: 'Repetición no encontrada' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(
          obtenerRepTetrazolioViabilidadPorId(mockTetrazolioId, 999)
        ).rejects.toEqual(error)
      })
    })

    describe('actualizarRepTetrazolioViabilidad', () => {
      it('debe actualizar una repetición de tetrazolio exitosamente', async () => {
        // Arrange
        const updatedData: RepTetrazolioViabilidadRequestDTO = {
          ...mockRepTetrazolioRequest,
          viablesNum: 90,
          noViablesNum: 7,
          duras: 3,
        }
        const updatedRepTetrazolio: RepTetrazolioViabilidadDTO = {
          ...mockRepTetrazolioDTO,
          viablesNum: 90,
          noViablesNum: 7,
          duras: 3,
        }
        mockApiFetch.mockResolvedValueOnce(updatedRepTetrazolio)

        // Act
        const result = await actualizarRepTetrazolioViabilidad(
          mockTetrazolioId,
          mockRepId,
          updatedData
        )

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/tetrazolios/${mockTetrazolioId}/repeticiones/${mockRepId}`,
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updatedData),
          })
        )
        expect(result.viablesNum).toBe(90)
      })

      it('debe manejar errores de validación en actualización', async () => {
        // Arrange
        const invalidData: RepTetrazolioViabilidadRequestDTO = {
          fecha: '2024-01-15',
          viablesNum: -5, // valor negativo inválido
          noViablesNum: 10,
          duras: 5,
        }
        const error = { status: 400, message: 'Los valores deben ser positivos' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(
          actualizarRepTetrazolioViabilidad(mockTetrazolioId, mockRepId, invalidData)
        ).rejects.toEqual(error)
      })
    })

    describe('eliminarRepTetrazolioViabilidad', () => {
      it('debe eliminar una repetición de tetrazolio exitosamente', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(undefined)

        // Act
        await eliminarRepTetrazolioViabilidad(mockTetrazolioId, mockRepId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/tetrazolios/${mockTetrazolioId}/repeticiones/${mockRepId}`,
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })

      it('debe manejar error al eliminar repetición inexistente', async () => {
        // Arrange
        const error = { status: 404, message: 'Repetición no encontrada' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(eliminarRepTetrazolioViabilidad(mockTetrazolioId, 999)).rejects.toEqual(
          error
        )
      })
    })
  })

  // ========================
  // TABLA DE GERMINACION (TablaGerm)
  // ========================
  describe('TablaGerm Service', () => {
    const mockGerminacionId = 3
    const mockTablaId = 15

    const mockTablaGermDTO: TablaGermDTO = {
      tablaGermID: mockTablaId,
      numeroTabla: 1,
      finalizada: false,
      tratamiento: 'Agar',
      productoYDosis: 'Sin producto',
      numSemillasPRep: 100,
      metodo: 'Entre papel',
      temperatura: 25,
      tienePrefrio: false,
      tienePretratamiento: false,
      diasPrefrio: 0,
      fechaIngreso: '2024-01-10',
      fechaGerminacion: '2024-01-15',
      fechaConteos: ['2024-01-18', '2024-01-22', '2024-01-25'],
      fechaUltConteo: '2024-01-25',
      numDias: 10,
      numeroRepeticiones: 8,
      numeroConteos: 3,
      total: 100,
      promedioSinRedondeo: [45.5, 12.3, 8.2],
      germinacion: {
        germinacionID: mockGerminacionId,
      },
    }

    const mockTablaGermRequest: TablaGermRequestDTO = {
      fechaFinal: '2024-01-25',
      tratamiento: 'Agar',
      productoYDosis: 'Sin producto',
      numSemillasPRep: 100,
      metodo: 'Entre papel',
      temperatura: 25,
      tienePrefrio: false,
      tienePretratamiento: false,
      diasPrefrio: 0,
      fechaIngreso: '2024-01-10',
      fechaGerminacion: '2024-01-15',
      fechaConteos: ['2024-01-18', '2024-01-22', '2024-01-25'],
      fechaUltConteo: '2024-01-25',
      numDias: 10,
      numeroRepeticiones: 8,
      numeroConteos: 3,
    }

    describe('crearTablaGerm', () => {
      it('debe crear una tabla de germinación exitosamente', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(mockTablaGermDTO)

        // Act
        const result = await crearTablaGerm(mockGerminacionId, mockTablaGermRequest)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(mockTablaGermRequest),
          })
        )
        expect(result).toEqual(mockTablaGermDTO)
      })

      it('debe validar fechas correctamente', async () => {
        // Arrange
        const invalidData: TablaGermRequestDTO = {
          ...mockTablaGermRequest,
          fechaGerminacion: '2024-01-20',
          fechaIngreso: '2024-01-25', // fecha ingreso posterior a germinación
        }
        const error = { status: 400, message: 'Fechas inválidas' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(crearTablaGerm(mockGerminacionId, invalidData)).rejects.toEqual(error)
      })

      it('debe validar que el número de conteos coincida con fechas', async () => {
        // Arrange
        const invalidData: TablaGermRequestDTO = {
          ...mockTablaGermRequest,
          numeroConteos: 5,
          fechaConteos: ['2024-01-18', '2024-01-22'], // solo 2 fechas
        }
        const error = { status: 400, message: 'Número de conteos no coincide con fechas' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(crearTablaGerm(mockGerminacionId, invalidData)).rejects.toEqual(error)
      })
    })

    describe('obtenerTablasPorGerminacion', () => {
      it('debe obtener todas las tablas de una germinación', async () => {
        // Arrange
        const mockTablas: TablaGermDTO[] = [
          mockTablaGermDTO,
          { ...mockTablaGermDTO, tablaGermID: 16, numeroTabla: 2 },
        ]
        mockApiFetch.mockResolvedValueOnce(mockTablas)

        // Act
        const result = await obtenerTablasPorGerminacion(mockGerminacionId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla`
        )
        expect(result).toEqual(mockTablas)
        expect(result).toHaveLength(2)
      })

      it('debe retornar array vacío cuando no hay tablas', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce([])

        // Act
        const result = await obtenerTablasPorGerminacion(mockGerminacionId)

        // Assert
        expect(result).toEqual([])
      })
    })

    describe('contarTablasPorGerminacion', () => {
      it('debe contar las tablas de una germinación', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(2)

        // Act
        const result = await contarTablasPorGerminacion(mockGerminacionId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla/contar`
        )
        expect(result).toBe(2)
      })
    })

    describe('obtenerTablaGermPorId', () => {
      it('debe obtener una tabla específica de germinación', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(mockTablaGermDTO)

        // Act
        const result = await obtenerTablaGermPorId(mockGerminacionId, mockTablaId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla/${mockTablaId}`
        )
        expect(result).toEqual(mockTablaGermDTO)
      })

      it('debe manejar error 404 cuando la tabla no existe', async () => {
        // Arrange
        const error = { status: 404, message: 'Tabla no encontrada' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(obtenerTablaGermPorId(mockGerminacionId, 999)).rejects.toEqual(error)
      })
    })

    describe('actualizarTablaGerm', () => {
      it('debe actualizar una tabla de germinación exitosamente', async () => {
        // Arrange
        const updatedData: TablaGermRequestDTO = {
          ...mockTablaGermRequest,
          temperatura: 28,
        }
        const updatedTabla: TablaGermDTO = {
          ...mockTablaGermDTO,
          temperatura: 28,
        }
        mockApiFetch.mockResolvedValueOnce(updatedTabla)

        // Act
        const result = await actualizarTablaGerm(mockGerminacionId, mockTablaId, updatedData)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla/${mockTablaId}`,
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updatedData),
          })
        )
        expect(result.temperatura).toBe(28)
      })

      it('debe validar temperatura dentro del rango permitido', async () => {
        // Arrange
        const invalidData: TablaGermRequestDTO = {
          ...mockTablaGermRequest,
          temperatura: -5, // temperatura inválida
        }
        const error = { status: 400, message: 'Temperatura fuera de rango' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(
          actualizarTablaGerm(mockGerminacionId, mockTablaId, invalidData)
        ).rejects.toEqual(error)
      })
    })

    describe('eliminarTablaGerm', () => {
      it('debe eliminar una tabla de germinación exitosamente', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(undefined)

        // Act
        await eliminarTablaGerm(mockGerminacionId, mockTablaId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla/${mockTablaId}`,
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })

      it('debe manejar error al eliminar tabla inexistente', async () => {
        // Arrange
        const error = { status: 404, message: 'Tabla no encontrada' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(eliminarTablaGerm(mockGerminacionId, 999)).rejects.toEqual(error)
      })

      it('debe manejar error al eliminar tabla finalizada', async () => {
        // Arrange
        const error = { status: 400, message: 'No se puede eliminar tabla finalizada' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(eliminarTablaGerm(mockGerminacionId, mockTablaId)).rejects.toEqual(error)
      })
    })

    describe('finalizarTabla', () => {
      it('debe finalizar una tabla de germinación exitosamente', async () => {
        // Arrange
        const finalizadaTabla: TablaGermDTO = {
          ...mockTablaGermDTO,
          finalizada: true,
          fechaFinal: '2024-01-25',
        }
        mockApiFetch.mockResolvedValueOnce(finalizadaTabla)

        // Act
        const result = await finalizarTabla(mockGerminacionId, mockTablaId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla/${mockTablaId}/finalizar`,
          expect.objectContaining({
            method: 'PUT',
          })
        )
        expect(result.finalizada).toBe(true)
        expect(result.fechaFinal).toBeDefined()
      })

      it('debe manejar error al finalizar tabla sin repeticiones completas', async () => {
        // Arrange
        const error = {
          status: 400,
          message: 'No se puede finalizar sin completar todas las repeticiones',
        }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(finalizarTabla(mockGerminacionId, mockTablaId)).rejects.toEqual(error)
      })
    })

    describe('puedeIngresarPorcentajes', () => {
      it('debe retornar true cuando puede ingresar porcentajes', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(true)

        // Act
        const result = await puedeIngresarPorcentajes(mockGerminacionId, mockTablaId)

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla/${mockTablaId}/puede-ingresar-porcentajes`
        )
        expect(result).toBe(true)
      })

      it('debe retornar false cuando no puede ingresar porcentajes', async () => {
        // Arrange
        mockApiFetch.mockResolvedValueOnce(false)

        // Act
        const result = await puedeIngresarPorcentajes(mockGerminacionId, mockTablaId)

        // Assert
        expect(result).toBe(false)
      })
    })

    describe('actualizarPorcentajes', () => {
      it('debe actualizar porcentajes de redondeo exitosamente', async () => {
        // Arrange
        const porcentajesRequest: PorcentajesRedondeoRequestDTO = {
          porcentajeNormalesConRedondeo: 85.5,
          porcentajeAnormalesConRedondeo: 8.2,
          porcentajeDurasConRedondeo: 3.1,
          porcentajeFrescasConRedondeo: 2.0,
          porcentajeMuertasConRedondeo: 1.2,
        }
        const tablaConPorcentajes: TablaGermDTO = {
          ...mockTablaGermDTO,
          porcentajeNormalesConRedondeo: 85.5,
          porcentajeAnormalesConRedondeo: 8.2,
          porcentajeDurasConRedondeo: 3.1,
          porcentajeFrescasConRedondeo: 2.0,
          porcentajeMuertasConRedondeo: 1.2,
        }
        mockApiFetch.mockResolvedValueOnce(tablaConPorcentajes)

        // Act
        const result = await actualizarPorcentajes(
          mockGerminacionId,
          mockTablaId,
          porcentajesRequest
        )

        // Assert
        expect(mockApiFetch).toHaveBeenCalledWith(
          `/api/germinacion/${mockGerminacionId}/tabla/${mockTablaId}/porcentajes`,
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(porcentajesRequest),
          })
        )
        expect(result.porcentajeNormalesConRedondeo).toBe(85.5)
      })

      it('debe validar que la suma de porcentajes sea 100', async () => {
        // Arrange
        const invalidPorcentajes: PorcentajesRedondeoRequestDTO = {
          porcentajeNormalesConRedondeo: 90.0,
          porcentajeAnormalesConRedondeo: 8.0,
          porcentajeDurasConRedondeo: 3.0,
          porcentajeFrescasConRedondeo: 2.0,
          porcentajeMuertasConRedondeo: 1.0,
          // suma = 104, no 100
        }
        const error = { status: 400, message: 'La suma de porcentajes debe ser 100' }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(
          actualizarPorcentajes(mockGerminacionId, mockTablaId, invalidPorcentajes)
        ).rejects.toEqual(error)
      })

      it('debe manejar error si la tabla no está finalizada', async () => {
        // Arrange
        const porcentajesRequest: PorcentajesRedondeoRequestDTO = {
          porcentajeNormalesConRedondeo: 85.5,
          porcentajeAnormalesConRedondeo: 8.2,
          porcentajeDurasConRedondeo: 3.1,
          porcentajeFrescasConRedondeo: 2.0,
          porcentajeMuertasConRedondeo: 1.2,
        }
        const error = {
          status: 400,
          message: 'No se pueden actualizar porcentajes en tabla no finalizada',
        }
        mockApiFetch.mockRejectedValueOnce(error)

        // Act & Assert
        await expect(
          actualizarPorcentajes(mockGerminacionId, mockTablaId, porcentajesRequest)
        ).rejects.toEqual(error)
      })
    })
  })
})
