import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import ListadoGerminacionPage from '@/app/listado/analisis/germinacion/page'
import * as germinacionService from '@/app/services/germinacion-service'

jest.mock('@/components/auth-provider')
jest.mock('sonner')
jest.mock('@/app/services/germinacion-service')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockObtenerGerminacionesPaginadas = germinacionService.obtenerGerminacionesPaginadas as jest.MockedFunction<typeof germinacionService.obtenerGerminacionesPaginadas>
const mockDesactivarGerminacion = germinacionService.desactivarGerminacion as jest.MockedFunction<typeof germinacionService.desactivarGerminacion>
const mockActivarGerminacion = germinacionService.activarGerminacion as jest.MockedFunction<typeof germinacionService.activarGerminacion>

describe('ListadoGerminacionPage', () => {
  const mockGerminaciones = {
    content: [
      {
        analisisID: 1,
        idLote: 100,
        lote: 'LOTE-001',
        especie: 'Trigo',
        estado: 'APROBADO',
        fechaInicio: '2024-01-10',
        valorGerminacionINIA: 95.5,
        valorGerminacionINASE: 94.0,
        fechaInicioGerm: '2024-01-15',
        fechaFinal: '2024-01-22',
        tienePrefrio: true,
        tienePretratamiento: false,
        cumpleNorma: true,
        activo: true
      },
      {
        analisisID: 2,
        idLote: 101,
        lote: 'LOTE-002',
        especie: 'Maíz',
        estado: 'EN_PROCESO',
        fechaInicio: '2024-01-18',
        valorGerminacionINIA: undefined,
        valorGerminacionINASE: undefined,
        fechaInicioGerm: '2024-01-20',
        fechaFinal: undefined,
        tienePrefrio: false,
        tienePretratamiento: true,
        cumpleNorma: false,
        activo: false
      }
    ],
    totalPages: 2,
    totalElements: 15,
    first: true,
    last: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'test@test.com',
        name: 'Test User', 
        role: 'administrador',
        permissions: [] 
      },
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn(),
      isRole: jest.fn(),
      refresh: jest.fn()
    })
    mockObtenerGerminacionesPaginadas.mockResolvedValue(mockGerminaciones)
  })

  it('debe renderizar el título y descripción', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Análisis de Germinación')).toBeInTheDocument()
      expect(screen.getByText('Consulta los análisis de germinación de semillas')).toBeInTheDocument()
    })
  })

  it('debe cargar y mostrar germinaciones al montar', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(0, 10, '', undefined, undefined, undefined)
    })

    await waitFor(() => {
      expect(screen.getByText('LOTE-001')).toBeInTheDocument()
      expect(screen.getByText('LOTE-002')).toBeInTheDocument()
    })
  })

  it('debe mostrar las estadísticas correctas', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument() // Total
      const onesElements = screen.getAllByText('1')
      expect(onesElements.length).toBeGreaterThan(0) // Completados (APROBADO) + otros
      expect(screen.getByText('50%')).toBeInTheDocument() // Cumplen norma
    })
  })

  it('debe permitir buscar por texto con Enter', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText('Buscar por ID análisis, Lote o Ficha...')
    fireEvent.change(searchInput, { target: { value: 'LOTE-001' } })
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(0, 10, 'LOTE-001', undefined, undefined, undefined)
    })
  })

  it('debe permitir buscar con botón de búsqueda', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText('Buscar por ID análisis, Lote o Ficha...')
    fireEvent.change(searchInput, { target: { value: 'Trigo' } })
    
    const searchButtons = screen.getAllByRole('button')
    const searchButton = searchButtons.find(btn => btn.querySelector('.lucide-search'))
    fireEvent.click(searchButton!)

    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(0, 10, 'Trigo', undefined, undefined, undefined)
    })
  })

  it('debe filtrar por estado', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const estadoSelect = screen.getByDisplayValue('Todos los estados')
    fireEvent.change(estadoSelect, { target: { value: 'APROBADO' } })

    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(0, 10, '', undefined, 'APROBADO', undefined)
    })
  })

  it('debe filtrar por activo/inactivo', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const filtroActivoSelect = screen.getByDisplayValue('Todos')
    fireEvent.change(filtroActivoSelect, { target: { value: 'activos' } })

    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(0, 10, '', true, undefined, undefined)
    })
  })

  it('debe mostrar valores de germinación formateados', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText('95.5%')).toBeInTheDocument()
      expect(screen.getByText('94.0%')).toBeInTheDocument()
    })
  })

  it('debe mostrar guiones cuando no hay valores de germinación', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      const cells = screen.getAllByText('-')
      expect(cells.length).toBeGreaterThan(0)
    })
  })

  it('debe formatear fechas correctamente', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument()
      expect(screen.getByText(/22\/01\/2024/)).toBeInTheDocument()
    })
  })

  it('debe mostrar badges de prefrío y pretratamiento', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      const badges = screen.getAllByText(/Sí|No/)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('debe desactivar germinación cuando es admin', async () => {
    global.confirm = jest.fn(() => true)
    mockDesactivarGerminacion.mockResolvedValue({} as never)
    
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const deleteButtons = screen.getAllByTitle('Desactivar')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDesactivarGerminacion).toHaveBeenCalledWith(1)
      expect(toast.success).toHaveBeenCalledWith('Análisis de Germinación desactivado exitosamente')
    })
  })

  it('debe no desactivar si se cancela el confirm', async () => {
    global.confirm = jest.fn(() => false)
    
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const deleteButtons = screen.getAllByTitle('Desactivar')
    fireEvent.click(deleteButtons[0])

    expect(mockDesactivarGerminacion).not.toHaveBeenCalled()
  })

  it('debe reactivar germinación inactiva', async () => {
    mockActivarGerminacion.mockResolvedValue({} as never)
    
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-002')).toBeInTheDocument())

    const reactivateButton = screen.getByTitle('Reactivar')
    fireEvent.click(reactivateButton)

    await waitFor(() => {
      expect(mockActivarGerminacion).toHaveBeenCalledWith(2)
      expect(toast.success).toHaveBeenCalledWith('Análisis de Germinación reactivado exitosamente')
    })
  })

  it('debe manejar error al desactivar', async () => {
    global.confirm = jest.fn(() => true)
    mockDesactivarGerminacion.mockRejectedValue(new Error('Error de red'))
    
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const deleteButtons = screen.getAllByTitle('Desactivar')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al desactivar el análisis')
    })
  })

  it('debe manejar error al reactivar', async () => {
    mockActivarGerminacion.mockRejectedValue(new Error('Error de red'))
    
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-002')).toBeInTheDocument())

    const reactivateButton = screen.getByTitle('Reactivar')
    fireEvent.click(reactivateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al reactivar el análisis')
    })
  })

  it('debe navegar a página de detalle al hacer clic en Ver', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const viewButtons = screen.getAllByTitle('Ver detalles')
    expect(viewButtons[0].closest('a')).toHaveAttribute('href', '/listado/analisis/germinacion/1')
  })

  it('debe navegar a página de edición al hacer clic en Editar', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const editButtons = screen.getAllByTitle('Editar')
    expect(editButtons[0].closest('a')).toHaveAttribute('href', '/listado/analisis/germinacion/1/editar')
  })

  it('debe cambiar de página correctamente', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    const nextPageButton = screen.getByRole('button', { name: /2/i })
    fireEvent.click(nextPageButton)

    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(1, 10, '', undefined, undefined, undefined)
    })
  })

  it('debe mostrar mensaje cuando no hay resultados', async () => {
    mockObtenerGerminacionesPaginadas.mockResolvedValue({
      content: [],
      totalPages: 0,
      totalElements: 0,
      first: true,
      last: true
    })

    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No se encontraron análisis de germinación')).toBeInTheDocument()
    })
  })

  it('debe manejar error al cargar datos', async () => {
    mockObtenerGerminacionesPaginadas.mockRejectedValue(new Error('Error de red'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching germinaciones:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('debe mostrar información de paginación correcta', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Mostrando 1 a 10 de 15 resultados/)).toBeInTheDocument()
    })
  })

  it('debe mostrar "0 de 0" cuando no hay resultados', async () => {
    mockObtenerGerminacionesPaginadas.mockResolvedValue({
      content: [],
      totalPages: 0,
      totalElements: 0,
      first: true,
      last: true
    })

    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Mostrando 0 de 0 resultados')).toBeInTheDocument()
    })
  })

  it('debe mostrar badges de estado correctos', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      const aprobadoElements = screen.getAllByText('Aprobado')
      expect(aprobadoElements.length).toBeGreaterThan(0)
      const enProcesoElements = screen.getAllByText('En Proceso')
      expect(enProcesoElements.length).toBeGreaterThan(0)
    })
  })

  it('debe formatear estados correctamente', async () => {
    const mockData = {
      ...mockGerminaciones,
      content: [
        { ...mockGerminaciones.content[0], estado: 'PENDIENTE_APROBACION' },
        { ...mockGerminaciones.content[1], estado: 'A_REPETIR' }
      ]
    }
    mockObtenerGerminacionesPaginadas.mockResolvedValue(mockData)

    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Pend. Aprobación')).toBeInTheDocument()
      expect(screen.getByText('A Repetir')).toBeInTheDocument()
    })
  })

  it('no debe mostrar botones de desactivar/reactivar si no es admin', async () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'test@test.com',
        name: 'Test User', 
        role: 'analista',
        permissions: [] 
      },
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn(),
      isRole: jest.fn(),
      refresh: jest.fn()
    })

    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    expect(screen.queryByTitle('Desactivar')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Reactivar')).not.toBeInTheDocument()
  })

  it('debe tener link al botón Nuevo Análisis', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      const newButton = screen.getByText('Nuevo Análisis').closest('a')
      expect(newButton).toHaveAttribute('href', '/registro/analisis?tipo=GERMINACION')
    })
  })

  it('debe tener link al botón Volver', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      const backButtons = screen.getAllByText(/Volver/)
      const backButton = backButtons[0].closest('a')
      expect(backButton).toHaveAttribute('href', '/listado')
    })
  })

  it('debe mostrar ID de lote cuando existe', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => {
      expect(screen.getByText('ID: 100')).toBeInTheDocument()
      expect(screen.getByText('ID: 101')).toBeInTheDocument()
    })
  })

  it('debe resetear página al cambiar filtros', async () => {
    render(<ListadoGerminacionPage />)
    
    await waitFor(() => expect(screen.getByText('LOTE-001')).toBeInTheDocument())

    // Cambiar a página 2
    mockObtenerGerminacionesPaginadas.mockClear()
    const nextButton = screen.getByRole('button', { name: /2/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(1, 10, '', undefined, undefined, undefined)
    })

    // Cambiar filtro (debe volver a página 0)
    mockObtenerGerminacionesPaginadas.mockClear()
    const estadoSelect = screen.getByDisplayValue('Todos los estados')
    fireEvent.change(estadoSelect, { target: { value: 'APROBADO' } })

    await waitFor(() => {
      expect(mockObtenerGerminacionesPaginadas).toHaveBeenCalledWith(0, 10, '', undefined, 'APROBADO', undefined)
    })
  })
})
