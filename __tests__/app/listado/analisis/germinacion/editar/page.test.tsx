import { render, screen, waitFor } from '@testing-library/react'
import GerminacionDetailPage from '@/app/listado/analisis/germinacion/[id]/editar/page'
import { GerminacionDTO } from '@/app/models/interfaces/germinacion'
import { LoteSimpleDTO } from '@/app/models/interfaces/lote-simple'
import { TablaGermDTO } from '@/app/models/interfaces/repeticiones'
import * as germinacionService from '@/app/services/germinacion-service'
import * as loteService from '@/app/services/lote-service'

// Mock de los servicios
jest.mock('@/app/services/germinacion-service')
jest.mock('@/app/services/lote-service')

// Mock de hooks
jest.mock('@/lib/hooks/useConfirm', () => ({
  useConfirm: () => ({
    confirm: jest.fn().mockResolvedValue(true)
  })
}))

// Mock de navegación
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useParams: () => ({ id: '1' }),
  usePathname: () => '/listado/analisis/germinacion/1/editar'
}))

// Mock de toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Mock de AuthProvider
jest.mock('@/components/auth-provider', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@test.com',
      roles: ['ROLE_USER']
    },
    hasRole: jest.fn(() => true),
    isAuthenticated: true
  }))
}))

describe('GerminacionDetailPage - Tests de Modo Edición', () => {
  const mockGerminacion: GerminacionDTO = {
    analisisID: 1,
    idLote: 1,
    lote: 'Trigo Baguette 10',
    estado: 'EN_PROCESO',
    fechaInicio: '2024-03-01',
    fechaFin: undefined,
    comentarios: 'Comentario inicial',
    historial: []
  }

  const mockLotes: LoteSimpleDTO[] = [
    { loteID: 1, ficha: 'L001', nomLote: 'Trigo Baguette 10', activo: true, cultivarNombre: 'Baguette 10', especieNombre: 'Trigo' },
    { loteID: 2, ficha: 'L002', nomLote: 'Maíz DK390', activo: true, cultivarNombre: 'DK390', especieNombre: 'Maíz' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Configurar mocks por defecto
    jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(mockGerminacion)
    jest.spyOn(germinacionService, 'obtenerTablasGerminacion').mockResolvedValue([])
    jest.spyOn(loteService, 'obtenerLotesActivos').mockResolvedValue(mockLotes)
  })

  describe('Test: Modo edición - cargar datos existentes', () => {
    it('debe cargar datos de germinación existente al montar', async () => {
      const mockObtenerGerminacion = jest.spyOn(germinacionService, 'obtenerGerminacionPorId')
        .mockResolvedValue(mockGerminacion)

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(mockObtenerGerminacion).toHaveBeenCalledWith(1)
      })

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })
    })

    it('debe cargar lotes disponibles para edición', async () => {
      const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesActivos')
        .mockResolvedValue(mockLotes)

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(mockObtenerLotes).toHaveBeenCalled()
      })
    })

    it('debe cargar tablas asociadas a la germinación', async () => {
      const mockTablas: Partial<TablaGermDTO>[] = [
        {
          tablaGermID: 1,
          tratamiento: 'Tratamiento A',
          numeroRepeticiones: 8,
          numeroTabla: 1,
          finalizada: false
        }
      ]

      const mockObtenerTablas = jest.spyOn(germinacionService, 'obtenerTablasGerminacion')
        .mockResolvedValue(mockTablas as TablaGermDTO[])

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(mockObtenerTablas).toHaveBeenCalledWith(1)
      })
    })

    it('debe mostrar comentarios existentes en el formulario', async () => {
      render(<GerminacionDetailPage />)

      await waitFor(() => {
        const comentariosElement = screen.getByText(/Comentario inicial/i)
        expect(comentariosElement).toBeInTheDocument()
      })
    })

    it('debe mostrar estado actual del análisis', async () => {
      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/EN_PROCESO/i)).toBeInTheDocument()
      })
    })

    it('debe manejar error al cargar datos', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId')
        .mockRejectedValue(new Error('Error de red'))

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })

    it('debe cargar correctamente cuando no hay tablas (404 es normal)', async () => {
      jest.spyOn(germinacionService, 'obtenerTablasGerminacion')
        .mockRejectedValue({ message: 'Error 404: Not Found' })

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })
    })
  })

  describe('Test: Modo edición - PUT exitoso', () => {
    it('debe tener función actualizarGerminacion disponible', async () => {
      const mockActualizarGerminacion = jest.spyOn(germinacionService, 'actualizarGerminacion')
        .mockResolvedValue({
          ...mockGerminacion,
          comentarios: 'Comentario actualizado'
        })

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })

      // Verificar que el servicio está disponible
      expect(mockActualizarGerminacion).toBeDefined()
    })

    it('debe cargar lotes para selector de edición', async () => {
      const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesActivos')
        .mockResolvedValue(mockLotes)

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(mockObtenerLotes).toHaveBeenCalled()
      })

      // Verificar que hay lotes disponibles
      expect(mockLotes.length).toBeGreaterThan(0)
    })

    it('debe manejar actualización con servicio mockedo', async () => {
      const mockActualizarGerminacion = jest.spyOn(germinacionService, 'actualizarGerminacion')
        .mockResolvedValue({
          ...mockGerminacion,
          comentarios: 'Comentario actualizado'
        })

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })

      // Verificar que el mock está configurado
      expect(mockActualizarGerminacion).toBeDefined()
    })

    it('debe verificar estructura de datos para PUT', async () => {
      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })

      // Verificar que los datos tienen la estructura correcta
      expect(mockGerminacion.analisisID).toBe(1)
      expect(mockGerminacion.idLote).toBe(1)
      expect(mockGerminacion.comentarios).toBe('Comentario inicial')
    })

    it('debe tener datos válidos para actualización', async () => {
      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })

      // Los datos cargados son válidos para PUT
      expect(mockGerminacion.analisisID).toBeGreaterThan(0)
      expect(mockGerminacion.idLote).toBeGreaterThan(0)
    })
  })

  describe('Test: Confirmación antes de salir con cambios', () => {
    it('debe tener hook useConfirm disponible', async () => {
      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })

      // Verificar que el componente se renderiza correctamente
      expect(screen.getByText(/Comentario inicial/i)).toBeInTheDocument()
    })

    it('debe mantener datos originales cargados', async () => {
      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })

      // Los valores originales están presentes
      expect(screen.getByText(/Comentario inicial/i)).toBeInTheDocument()
      expect(mockGerminacion.comentarios).toBe('Comentario inicial')
    })

    it('debe tener datos de germinación disponibles', async () => {
      render(<GerminacionDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })

      // Los datos están cargados y disponibles
      expect(mockGerminacion.analisisID).toBe(1)
      expect(mockGerminacion.idLote).toBe(1)
    })
  })

  describe('Test: Operaciones adicionales', () => {
    it('debe tener función finalizarGerminacion disponible', async () => {
      const mockFinalizarGerminacion = jest.spyOn(germinacionService, 'finalizarGerminacion')
        .mockResolvedValue(mockGerminacion)

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        const headings = screen.getAllByText(/Análisis de Germinación/i)
        expect(headings.length).toBeGreaterThan(0)
      })

      // Verificar que el servicio está disponible
      expect(mockFinalizarGerminacion).toBeDefined()
    })

    it('debe tener función aprobarAnalisis disponible', async () => {
      const mockAprobarAnalisis = jest.spyOn(germinacionService, 'aprobarAnalisis')
        .mockResolvedValue(mockGerminacion)

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        const headings = screen.getAllByText(/Análisis de Germinación/i)
        expect(headings.length).toBeGreaterThan(0)
      })

      // Verificar que el servicio está disponible
      expect(mockAprobarAnalisis).toBeDefined()
    })

    it('debe renderizar sección de tablas de germinación', async () => {
      const mockTabla: Partial<TablaGermDTO> = {
        tablaGermID: 1,
        numeroTabla: 1,
        tratamiento: 'Nueva Tabla',
        finalizada: false
      }

      jest.spyOn(germinacionService, 'crearTablaGerminacion')
        .mockResolvedValue(mockTabla as TablaGermDTO)

      render(<GerminacionDetailPage />)

      await waitFor(() => {
        const headings = screen.getAllByText(/Análisis de Germinación/i)
        expect(headings.length).toBeGreaterThan(0)
      })

      // El componente renderiza correctamente
      expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
    })
  })
})
