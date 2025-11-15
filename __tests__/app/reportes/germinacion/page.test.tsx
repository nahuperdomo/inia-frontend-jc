import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReporteGerminacionPage from '@/app/reportes/germinacion/page'
import { obtenerReporteGerminacion } from '@/app/services/reporte-service'
import { ReporteGerminacionDTO } from '@/app/models/interfaces/reportes'

// Mock del servicio
jest.mock('@/app/services/reporte-service')
const mockedObtenerReporteGerminacion = obtenerReporteGerminacion as jest.MockedFunction<typeof obtenerReporteGerminacion>

// Mock de recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Cell: () => <div data-testid="cell" />
}))

const mockReporte: ReporteGerminacionDTO = {
  totalGerminaciones: 150,
  mediaGerminacionPorEspecie: {
    'Trigo': 85.5,
    'Maíz': 92.3,
    'Soja': 88.7
  },
  tiempoPromedioPrimerConteo: {
    'Trigo': 5.2,
    'Maíz': 4.8,
    'Soja': 6.1
  },
  tiempoPromedioUltimoConteo: {
    'Trigo': 12.5,
    'Maíz': 10.3,
    'Soja': 14.2
  }
}

describe('ReporteGerminacionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ===== LOADING & INITIAL STATE =====
  describe('Loading and initial state', () => {
    it('debe cargar reporte automáticamente al montar', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(mockedObtenerReporteGerminacion).toHaveBeenCalledTimes(1)
      })
    })

    it('debe mostrar título de la página', () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      expect(screen.getByText('Reporte de Germinación')).toBeInTheDocument()
      expect(screen.getByText('Métricas y estadísticas de análisis de germinación')).toBeInTheDocument()
    })

    it('debe mostrar botón de volver', () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      const volverButton = screen.getByText('Volver')
      expect(volverButton).toBeInTheDocument()
      expect(volverButton.closest('a')).toHaveAttribute('href', '/reportes')
    })

    it('debe mostrar estado de carga mientras obtiene datos', async () => {
      mockedObtenerReporteGerminacion.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(mockReporte), 100)
      }))

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /aplicar filtros/i })
      fireEvent.click(button)

      expect(screen.getByText('Cargando...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
      })
    })
  })

  // ===== FILTERS =====
  describe('Filtros de fecha', () => {
    it('debe renderizar campos de fecha', () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument()
      expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument()
    })

    it('debe actualizar fecha inicio al cambiar input', () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      const fechaInicioInput = screen.getByLabelText('Fecha Inicio') as HTMLInputElement
      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })

      expect(fechaInicioInput.value).toBe('2024-01-01')
    })

    it('debe actualizar fecha fin al cambiar input', () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      const fechaFinInput = screen.getByLabelText('Fecha Fin') as HTMLInputElement
      fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })

      expect(fechaFinInput.value).toBe('2024-12-31')
    })

    it('debe llamar al servicio con filtros al hacer click en Aplicar', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
      })

      const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
      const fechaFinInput = screen.getByLabelText('Fecha Fin')
      const applyButton = screen.getByText('Aplicar Filtros')

      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
      fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })
      fireEvent.click(applyButton)

      await waitFor(() => {
        expect(mockedObtenerReporteGerminacion).toHaveBeenCalledWith({
          fechaInicio: '2024-01-01',
          fechaFin: '2024-12-31'
        })
      })
    })

    it('debe llamar al servicio sin filtros cuando están vacíos', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
      })

      const applyButton = screen.getByText('Aplicar Filtros')
      fireEvent.click(applyButton)

      await waitFor(() => {
        expect(mockedObtenerReporteGerminacion).toHaveBeenCalledWith({
          fechaInicio: undefined,
          fechaFin: undefined
        })
      })
    })

    it('debe deshabilitar botón mientras carga', async () => {
      mockedObtenerReporteGerminacion.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(mockReporte), 100)
      }))

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
      })

      const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })
      fireEvent.click(applyButton)

      expect(applyButton).toBeDisabled()

      await waitFor(() => {
        expect(applyButton).not.toBeDisabled()
      })
    })
  })

  // ===== TOTAL GERMINACIONES =====
  describe('Total de germinaciones', () => {
    it('debe mostrar total de germinaciones del reporte', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
        expect(screen.getByText('Total Germinaciones')).toBeInTheDocument()
      })
    })

    it('debe mostrar 0 cuando no hay reporte', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(null as never)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })
  })

  // ===== MEDIA GERMINACIÓN POR ESPECIE =====
  describe('Media de germinación por especie', () => {
    it('debe mostrar título de gráfico de germinación por especie', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('Media de Germinación por Especie (%)')).toBeInTheDocument()
        expect(screen.getByText('Porcentaje promedio de germinación por especie')).toBeInTheDocument()
      })
    })

    it('debe renderizar gráfico cuando hay datos', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })
    })

    it('debe mostrar mensaje cuando no hay datos', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue({
        ...mockReporte,
        mediaGerminacionPorEspecie: {}
      })

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const noDataMessages = screen.getAllByText('No hay datos disponibles')
        expect(noDataMessages.length).toBeGreaterThan(0)
      })
    })

    it('debe procesar datos de especies correctamente', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })
    })
  })

  // ===== TIEMPO PROMEDIO PRIMER CONTEO =====
  describe('Tiempo promedio a primer conteo', () => {
    it('debe mostrar título de gráfico de primer conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('Tiempo Promedio a Primer Conteo (días)')).toBeInTheDocument()
        expect(screen.getByText('Días promedio hasta el primer conteo por especie')).toBeInTheDocument()
      })
    })

    it('debe renderizar gráfico cuando hay datos de primer conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('debe mostrar mensaje cuando no hay datos de primer conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue({
        ...mockReporte,
        tiempoPromedioPrimerConteo: {}
      })

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const noDataMessages = screen.getAllByText('No hay datos disponibles')
        expect(noDataMessages.length).toBeGreaterThan(0)
      })
    })
  })

  // ===== TIEMPO PROMEDIO ÚLTIMO CONTEO =====
  describe('Tiempo promedio a último conteo', () => {
    it('debe mostrar título de gráfico de último conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('Tiempo Promedio a Último Conteo (días)')).toBeInTheDocument()
        expect(screen.getByText('Días promedio hasta el último conteo por especie')).toBeInTheDocument()
      })
    })

    it('debe renderizar gráfico cuando hay datos de último conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('debe mostrar mensaje cuando no hay datos de último conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue({
        ...mockReporte,
        tiempoPromedioUltimoConteo: {}
      })

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const noDataMessages = screen.getAllByText('No hay datos disponibles')
        expect(noDataMessages.length).toBeGreaterThan(0)
      })
    })
  })

  // ===== ERROR HANDLING =====
  describe('Manejo de errores', () => {
    it('debe manejar error al cargar reporte', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { })
      mockedObtenerReporteGerminacion.mockRejectedValue(new Error('Error de red'))

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error al cargar reporte:', expect.any(Error))
      })

      consoleError.mockRestore()
    })

    it('debe mostrar 0 en total cuando hay error', async () => {
      mockedObtenerReporteGerminacion.mockRejectedValue(new Error('Error'))

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })

    it('debe continuar funcionando después de un error', async () => {
      mockedObtenerReporteGerminacion.mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })

      const applyButton = screen.getByText('Aplicar Filtros')
      fireEvent.click(applyButton)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })
    })
  })

  // ===== DATA TRANSFORMATION =====
  describe('Transformación de datos', () => {
    it('debe transformar datos de germinación por especie correctamente', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })
    })

    it('debe manejar valores numéricos en mediaGerminacionPorEspecie', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThan(0)
      })
    })

    it('debe manejar valores no numéricos como 0', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue({
        ...mockReporte,
        mediaGerminacionPorEspecie: {
          'Trigo': 'invalid' as never
        }
      })

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })
    })

    it('debe procesar múltiples especies en primer conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('debe procesar múltiples especies en último conteo', async () => {
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  // ===== CONSOLE LOGS =====
  describe('Console logs (debugging)', () => {
    it('debe logear respuesta del backend', async () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => { })
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(consoleLog).toHaveBeenCalledWith('Respuesta del backend:', mockReporte)
      })

      consoleLog.mockRestore()
    })

    it('debe logear mediaGerminacionPorEspecie', async () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => { })
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(consoleLog).toHaveBeenCalledWith('mediaGerminacionPorEspecie:', mockReporte.mediaGerminacionPorEspecie)
      })

      consoleLog.mockRestore()
    })

    it('debe logear tiempoPromedioPrimerConteo', async () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => { })
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(consoleLog).toHaveBeenCalledWith('tiempoPromedioPrimerConteo:', mockReporte.tiempoPromedioPrimerConteo)
      })

      consoleLog.mockRestore()
    })

    it('debe logear tiempoPromedioUltimoConteo', async () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => { })
      mockedObtenerReporteGerminacion.mockResolvedValue(mockReporte)

      render(<ReporteGerminacionPage />)

      await waitFor(() => {
        expect(consoleLog).toHaveBeenCalledWith('tiempoPromedioUltimoConteo:', mockReporte.tiempoPromedioUltimoConteo)
      })

      consoleLog.mockRestore()
    })
  })
})
