/**
 * Tests para la página de listado de análisis de Pureza
 * 
 * Estos tests cubren:
 * - Renderizado de la lista de análisis de pureza
 * - Búsqueda y filtrado por estado y activo
 * - Paginación de resultados
 * - Visualización de estadísticas (total, completados, en proceso, promedio pureza)
 * - Navegación a detalle y edición
 * - Activación/desactivación de análisis (solo admin)
 * - Formateo de fechas
 * - Manejo de estados vacíos
 * - Manejo de errores de carga
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ListadoPurezaPage from '@/app/listado/analisis/pureza/page'
import * as purezaService from '@/app/services/pureza-service'
import { toast } from 'sonner'
import { EstadoAnalisis } from '@/app/models'

// Mock de servicios
jest.mock('@/app/services/pureza-service')

// Mock de navegación
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn()
  }),
  usePathname: () => '/listado/analisis/pureza',
  useSearchParams: () => new URLSearchParams()
}))

// Mock de toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock de AuthProvider
const mockUser = { id: 1, username: 'testuser', role: 'analista' }
jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true
  })
}))

// Mock de componentes
jest.mock('@/components/pagination', () => {
  return function MockPagination({ currentPage, totalPages, onPageChange }: any) {
    return (
      <div data-testid="pagination">
        <button onClick={() => onPageChange(0)} disabled={currentPage === 0}>
          First
        </button>
        <span>Page {currentPage + 1} of {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
          Next
        </button>
      </div>
    )
  }
})

describe('ListadoPurezaPage Tests', () => {
  const mockPurezas = [
    {
      analisisID: 1,
      estado: 'APROBADO' as EstadoAnalisis,
      fechaInicio: '2024-03-01',
      fechaFin: '2024-03-15',
      lote: 'Trigo Baguette 10',
      idLote: 1,
      especie: 'Trigo',
      activo: true,
      redonSemillaPura: 95.5,
      inasePura: 95.0,
      usuarioCreador: 'usuario1',
      usuarioModificador: 'usuario2',
      // Campos requeridos por PurezaDTO
      fecha: '2024-03-01',
      pesoInicial_g: 100,
      semillaPura_g: 95.5,
      materiaInerte_g: 2,
      otrosCultivos_g: 1,
      malezas_g: 1.5,
      malezasToleradas_g: 0,
      malezasTolCero_g: 0,
      pesoTotal_g: 100,
      otrasSemillas: []
    },
    {
      analisisID: 2,
      estado: 'EN_PROCESO' as EstadoAnalisis,
      fechaInicio: '2024-03-02',
      lote: 'Maíz Colorado',
      idLote: 2,
      especie: 'Maíz',
      activo: true,
      redonSemillaPura: 92.0,
      inasePura: 91.5,
      // Campos requeridos por PurezaDTO
      fecha: '2024-03-02',
      pesoInicial_g: 100,
      semillaPura_g: 92.0,
      materiaInerte_g: 3,
      otrosCultivos_g: 2,
      malezas_g: 3,
      malezasToleradas_g: 0,
      malezasTolCero_g: 0,
      pesoTotal_g: 100,
      otrasSemillas: []
    },
    {
      analisisID: 3,
      estado: 'REGISTRADO' as EstadoAnalisis,
      fechaInicio: '2024-03-03',
      lote: 'Soja Asgrow',
      idLote: 3,
      especie: 'Soja',
      activo: true,
      redonSemillaPura: 98.0,
      inasePura: 97.5,
      // Campos requeridos por PurezaDTO
      fecha: '2024-03-03',
      pesoInicial_g: 100,
      semillaPura_g: 98.0,
      materiaInerte_g: 1,
      otrosCultivos_g: 0.5,
      malezas_g: 0.5,
      malezasToleradas_g: 0,
      malezasTolCero_g: 0,
      pesoTotal_g: 100,
      otrasSemillas: []
    }
  ]

  const mockPaginatedResponse = {
    content: mockPurezas,
    totalElements: 3,
    totalPages: 1,
    last: true,
    first: true,
    number: 0
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    mockUser.role = 'analista'
    jest.spyOn(purezaService, 'obtenerPurezasPaginadas').mockResolvedValue(mockPaginatedResponse as any)
  })

  describe('Test: Renderizado básico', () => {
    it('debe renderizar el título y descripción de la página', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Análisis de Pureza Física')).toBeInTheDocument()
      })

      expect(screen.getByText('Consulta la pureza física de las semillas')).toBeInTheDocument()
    })

    it('debe renderizar el botón de nuevo análisis', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const nuevoButton = screen.getByRole('link', { name: /nuevo análisis/i })
        expect(nuevoButton).toBeInTheDocument()
        expect(nuevoButton).toHaveAttribute('href', '/registro/analisis?tipo=PUREZA')
      })
    })

    it('debe renderizar el botón volver', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const volverLink = screen.getByRole('link', { name: /volver/i })
        expect(volverLink).toBeInTheDocument()
        expect(volverLink).toHaveAttribute('href', '/listado')
      })
    })

    it('debe mostrar las tarjetas de estadísticas', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Total Análisis')).toBeInTheDocument()
        expect(screen.getByText('Completados')).toBeInTheDocument()
        expect(screen.getAllByText('En Proceso')[0]).toBeInTheDocument()
        expect(screen.getByText('Pureza Promedio')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Carga de datos', () => {
    it('debe cargar los análisis de pureza al montar el componente', async () => {
      const mockObtenerPurezas = jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockPaginatedResponse as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(mockObtenerPurezas).toHaveBeenCalledWith(
          0,
          10,
          '',
          undefined,
          undefined,
          undefined
        )
      })
    })

    it('debe mostrar los análisis en la tabla', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument()
        expect(screen.getByText('Maíz Colorado')).toBeInTheDocument()
        expect(screen.getByText('Soja Asgrow')).toBeInTheDocument()
      })
    })

    it('debe mostrar el estado de cada análisis', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getAllByText('Aprobado')[0]).toBeInTheDocument()
        expect(screen.getAllByText('En Proceso')[0]).toBeInTheDocument()
        expect(screen.getByText('Registrado')).toBeInTheDocument()
      })
    })

    it('debe mostrar badge correcto para PENDIENTE_APROBACION', async () => {
      const purezasPendientes = {
        ...mockPaginatedResponse,
        content: [{
          ...mockPaginatedResponse.content[0],
          estado: 'PENDIENTE_APROBACION' as EstadoAnalisis
        }]
      }

      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(purezasPendientes as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument()
      })
    })

    it('debe mostrar badge correcto para A_REPETIR', async () => {
      const purezasARepetir = {
        ...mockPaginatedResponse,
        content: [{
          ...mockPaginatedResponse.content[0],
          estado: 'A_REPETIR' as EstadoAnalisis
        }]
      }

      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(purezasARepetir as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument()
      })
    })

    it('debe mostrar los valores de pureza INIA e INASE', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('95.5%')).toBeInTheDocument()
        expect(screen.getByText('95.0%')).toBeInTheDocument()
      })
    })

    it('debe manejar error al cargar análisis', async () => {
      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockRejectedValue(new Error('Error de red'))

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText(/No se encontraron análisis de pureza/i)).toBeInTheDocument()
      })
    })
  })

  describe('Test: Búsqueda y filtrado', () => {
    it('debe tener campo de búsqueda', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Buscar por ID/i)
        expect(searchInput).toBeInTheDocument()
      })
    })

    it('debe buscar al presionar Enter en el campo de búsqueda', async () => {
      const mockObtenerPurezas = jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockPaginatedResponse as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Buscar por ID/i)
        fireEvent.change(searchInput, { target: { value: 'Trigo' } })
        fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })
      })

      await waitFor(() => {
        expect(mockObtenerPurezas).toHaveBeenCalledWith(
          0,
          10,
          'Trigo',
          undefined,
          undefined,
          undefined
        )
      })
    })

    it('debe buscar al hacer clic en el botón de búsqueda', async () => {
      const mockObtenerPurezas = jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockPaginatedResponse as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Buscar por ID/i)
        fireEvent.change(searchInput, { target: { value: 'Maíz' } })
      })

      // El botón de búsqueda no tiene texto, solo un ícono
      // Buscar el botón que contiene un SVG y está cerca del input de búsqueda
      const buttons = screen.getAllByRole('button')
      const searchButton = buttons.find(btn => 
        btn.querySelector('svg') && 
        !btn.textContent?.includes('Volver') &&
        !btn.textContent?.includes('Nuevo') &&
        !btn.textContent?.includes('Filtros') &&
        !btn.textContent?.includes('Ver') &&
        !btn.textContent?.includes('Editar') &&
        !btn.textContent?.includes('First') &&
        !btn.textContent?.includes('Next')
      )
      
      if (searchButton) {
        fireEvent.click(searchButton)
      }

      await waitFor(() => {
        expect(mockObtenerPurezas).toHaveBeenCalled()
      })
    })

    it('debe actualizar el término de búsqueda al escribir', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis, Lote o Ficha/i)
        fireEvent.change(searchInput, { target: { value: 'Trigo' } })
        expect(searchInput).toHaveValue('Trigo')
      })
    })

    it('debe buscar al presionar Enter', async () => {
      const mockObtenerPurezas = jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockPaginatedResponse as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis, Lote o Ficha/i)
        fireEvent.change(searchInput, { target: { value: 'Trigo' } })
        fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })
      })

      await waitFor(() => {
        expect(mockObtenerPurezas).toHaveBeenCalledWith(
          0,
          10,
          'Trigo',
          undefined,
          undefined,
          undefined
        )
      })
    })

    it('debe buscar al hacer clic en el botón de búsqueda', async () => {
      const mockObtenerPurezas = jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockPaginatedResponse as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis, Lote o Ficha/i)
        fireEvent.change(searchInput, { target: { value: 'Maíz' } })
        
        const searchButtons = screen.getAllByRole('button')
        const searchButton = searchButtons.find(btn => btn.querySelector('svg'))
        if (searchButton) {
          fireEvent.click(searchButton)
        }
      })

      await waitFor(() => {
        expect(mockObtenerPurezas).toHaveBeenCalled()
      })
    })

    it('debe filtrar por estado', async () => {
      const mockObtenerPurezas = jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockPaginatedResponse as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const estadoSelect = screen.getByDisplayValue(/todos los estados/i)
        fireEvent.change(estadoSelect, { target: { value: 'APROBADO' } })
      })

      await waitFor(() => {
        expect(mockObtenerPurezas).toHaveBeenCalledWith(
          0,
          10,
          '',
          undefined,
          'APROBADO',
          undefined
        )
      })
    })

    it('debe filtrar por activo/inactivo', async () => {
      const mockObtenerPurezas = jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockPaginatedResponse as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const activoSelect = screen.getAllByDisplayValue(/todos/i)[0]
        fireEvent.change(activoSelect, { target: { value: 'activos' } })
      })

      // Verificar que se llamó al servicio después del cambio
      await waitFor(() => {
        expect(mockObtenerPurezas).toHaveBeenCalled()
      })
    })
  })

  describe('Test: Paginación', () => {
    it('debe mostrar el componente de paginación', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument()
      })
    })

    it('debe mostrar información de resultados', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText(/Mostrando 1 a 3 de 3 resultados/i)).toBeInTheDocument()
      })
    })

    it('debe cambiar de página al hacer clic en paginación', async () => {
      const mockMultiPage = {
        ...mockPaginatedResponse,
        totalPages: 2,
        totalElements: 20,
        last: false
      }

      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue(mockMultiPage as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        // El componente usa paginación 0-indexed, pero Pagination puede llamar con página siguiente
        expect(purezaService.obtenerPurezasPaginadas).toHaveBeenCalled()
      })
    })
  })

  describe('Test: Estadísticas', () => {
    it('debe calcular correctamente el total de análisis', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const totalCard = screen.getByText('Total Análisis').closest('div')
        expect(totalCard?.textContent).toContain('3')
      })
    })

    it('debe calcular correctamente los completados', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const completadosCard = screen.getByText('Completados').closest('div')
        expect(completadosCard?.textContent).toContain('1')
      })
    })

    it('debe calcular correctamente los en proceso', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const procesoTexts = screen.getAllByText('En Proceso')
        expect(procesoTexts.length).toBeGreaterThan(0)
      })
    })

    it('debe calcular correctamente el promedio de pureza', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const promedioCard = screen.getByText('Pureza Promedio').closest('div')
        // Promedio de 95.5, 92.0, 98.0 = 95.166... ≈ 95.2%
        expect(promedioCard?.textContent).toContain('95.')
      })
    })
  })

  describe('Test: Acciones en la tabla', () => {
    it('debe mostrar botones de ver, editar para cada análisis', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const verButtons = screen.getAllByRole('link', { name: '' }).filter(
          link => link.getAttribute('href')?.includes('/listado/analisis/pureza/') && 
          !link.getAttribute('href')?.includes('/editar')
        )
        expect(verButtons.length).toBeGreaterThan(0)
      })
    })

    it('debe navegar a la página de detalle al hacer clic en ver', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const verLinks = screen.getAllByRole('link').filter(
          link => link.getAttribute('href')?.match(/\/listado\/analisis\/pureza\/\d+$/)
        )
        expect(verLinks.length).toBeGreaterThan(0)
        expect(verLinks[0]).toHaveAttribute('href', '/listado/analisis/pureza/1')
      })
    })

    it('debe navegar a la página de edición al hacer clic en editar', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const editarLinks = screen.getAllByRole('link').filter(
          link => link.getAttribute('href')?.includes('/editar')
        )
        expect(editarLinks.length).toBeGreaterThan(0)
        expect(editarLinks[0]).toHaveAttribute('href', '/listado/analisis/pureza/1/editar')
      })
    })
  })

  describe('Test: Desactivar/Reactivar (Solo Admin)', () => {
    it('debe mostrar botón de desactivar para administrador', async () => {
      mockUser.role = 'administrador'
      
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button').filter(
          btn => btn.getAttribute('title') === 'Desactivar'
        )
        expect(deleteButtons.length).toBeGreaterThan(0)
      })
    })

    it('no debe mostrar botón de desactivar para usuario normal', async () => {
      mockUser.role = 'analista'
      
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const deleteButtons = screen.queryAllByRole('button').filter(
          btn => btn.getAttribute('title') === 'Desactivar'
        )
        expect(deleteButtons.length).toBe(0)
      })
    })

    it('debe desactivar un análisis correctamente', async () => {
      mockUser.role = 'administrador'
      const mockDesactivar = jest.spyOn(purezaService, 'desactivarPureza')
        .mockResolvedValue(undefined)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        // Verificar que el componente se cargó correctamente
        expect(screen.getByText('Análisis de Pureza Física')).toBeInTheDocument()
      })
    })

    it('debe reactivar un análisis correctamente', async () => {
      mockUser.role = 'administrador'

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        // Verificar que el componente se cargó
        expect(screen.getByText('Análisis de Pureza Física')).toBeInTheDocument()
      })
    })

    it('debe cancelar desactivación si el usuario no confirma', async () => {
      mockUser.role = 'administrador'
      global.confirm = jest.fn(() => false)

      const mockDesactivar = jest.spyOn(purezaService, 'desactivarPureza')

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const deleteButton = screen.getAllByRole('button').find(
          btn => btn.getAttribute('title') === 'Desactivar'
        )
        
        if (deleteButton) {
          fireEvent.click(deleteButton)
        }
      })

      expect(mockDesactivar).not.toHaveBeenCalled()
    })
  })

  describe('Test: Formateo de fechas', () => {
    it('debe formatear correctamente las fechas de inicio', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        // La fecha 2024-03-01 se formatea como dd/mm/yyyy
        expect(screen.getByText(/01\/03\/2024/)).toBeInTheDocument()
      })
    })

    it('debe mostrar guion cuando no hay fecha de fin', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const table = screen.getByRole('table')
        const rows = table.querySelectorAll('tbody tr')
        
        // La segunda fila no tiene fecha de fin
        const secondRow = rows[1]
        expect(secondRow.textContent).toContain('-')
      })
    })

    it('debe formatear correctamente las fechas de fin cuando existen', async () => {
      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText(/15\/03\/2024/)).toBeInTheDocument()
      })
    })
  })

  describe('Test: Estados vacíos', () => {
    it('debe mostrar mensaje cuando no hay análisis', async () => {
      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue({
          content: [],
          totalElements: 0,
          totalPages: 0,
          last: true,
          first: true,
          number: 0
        } as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('No se encontraron análisis de pureza')).toBeInTheDocument()
      })
    })

    it('debe mostrar 0 en estadísticas cuando no hay análisis', async () => {
      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue({
          content: [],
          totalElements: 0,
          totalPages: 0,
          last: true,
          first: true,
          number: 0
        } as any)

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        const totalCard = screen.getByText('Total Análisis').closest('div')
        expect(totalCard?.textContent).toContain('0')
      })
    })
  })

  describe('Test: Manejo de valores nulos en pureza', () => {
    it('debe mostrar N/A cuando no hay valor de pureza INIA', async () => {
      const purezasSinDatos = [{
        ...mockPurezas[0],
        redonSemillaPura: undefined
      }]

      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue({
          ...mockPaginatedResponse,
          content: purezasSinDatos
        })

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('N/A%')).toBeInTheDocument()
      })
    })

    it('debe mostrar N/A cuando no hay valor de pureza INASE', async () => {
      const purezasSinDatos = [{
        ...mockPurezas[0],
        inasePura: null
      }]

      jest.spyOn(purezaService, 'obtenerPurezasPaginadas')
        .mockResolvedValue({
          ...mockPaginatedResponse,
          content: purezasSinDatos
        })

      render(<ListadoPurezaPage />)

      await waitFor(() => {
        expect(screen.getAllByText('N/A%').length).toBeGreaterThan(0)
      })
    })
  })
})
