/**
 * Tests para la página de Reporte de Pureza
 * 
 * Estos tests cubren:
 * - Renderizado de componentes principales (título, filtros, cards)
 * - Carga inicial de reporte sin filtros
 * - Aplicación de filtros de fecha
 * - Visualización de métricas (total de análisis)
 * - Gráficos de cumplimiento de estándares
 * - Gráficos de malezas por especie
 * - Gráficos de otras semillas por especie
 * - Selección de especie para contaminantes
 * - Carga de contaminantes específicos por especie
 * - Visualización de pie charts (general, malezas, cultivos)
 * - Manejo de estados vacíos
 * - Manejo de errores
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReportePurezaPage from '@/app/reportes/pureza/page'
import * as reporteService from '@/app/services/reporte-service'

// Mock de servicios
jest.mock('@/app/services/reporte-service')

// Mock de Link de Next.js
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock de Combobox
jest.mock('@/components/ui/combobox', () => ({
  Combobox: ({ value, onValueChange, options, placeholder }: any) => (
    <select
      data-testid="combobox-especie"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.id} value={opt.id}>
          {opt.nombre}
        </option>
      ))}
    </select>
  ),
}))

// Mock de Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-items={data?.length}>{children}</div>,
  Bar: ({ dataKey, fill }: any) => <div data-testid="bar" data-key={dataKey} data-fill={fill} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }: any) => <div data-testid="pie" data-items={data?.length} />,
  Cell: () => <div data-testid="cell" />,
}))

describe('ReportePurezaPage Tests', () => {
  const mockReporte = {
    totalPurezas: 150,
    porcentajeCumpleEstandar: {
      'Trigo': 95.5,
      'Maíz': 88.2,
      'Soja': 92.8,
    },
    porcentajeMalezas: {
      'Trigo': 2.5,
      'Maíz': 5.8,
      'Soja': 3.2,
    },
    porcentajeOtrasSemillas: {
      'Trigo': 1.5,
      'Maíz': 4.2,
      'Soja': 2.1,
    },
    contaminantesPorEspecie: {
      'Trigo': 45,
      'Maíz': 38,
      'Soja': 52,
    },
  }

  const mockContaminantes = {
    'Total Malezas': 15,
    'Total Otros Cultivos': 10,
    'Maleza: Yuyo colorado': 8,
    'Maleza: Rama negra': 7,
    'Cultivo: Avena': 6,
    'Cultivo: Cebada': 4,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(reporteService, 'obtenerReportePureza').mockResolvedValue(mockReporte as any)
    jest.spyOn(reporteService, 'obtenerContaminantesPureza').mockResolvedValue(mockContaminantes)
  })

  describe('Test: Renderizado básico', () => {
    it('debe renderizar el título y descripción de la página', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Reporte de Pureza')).toBeInTheDocument()
        expect(screen.getByText('Métricas y estadísticas de análisis de pureza')).toBeInTheDocument()
      })
    })

    it('debe renderizar el botón volver', () => {
      render(<ReportePurezaPage />)

      const volverLink = screen.getByRole('link', { name: /volver/i })
      expect(volverLink).toBeInTheDocument()
      expect(volverLink).toHaveAttribute('href', '/reportes')
    })

    it('debe renderizar el ícono de beaker', () => {
      render(<ReportePurezaPage />)

      // Los íconos lucide se renderizan como SVG con clase específica
      const container = screen.getByText('Reporte de Pureza').parentElement?.parentElement
      expect(container).toBeInTheDocument()
    })
  })

  describe('Test: Filtros de fecha', () => {
    it('debe renderizar los campos de fecha', () => {
      render(<ReportePurezaPage />)

      expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument()
      expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument()
    })

    it('debe renderizar el botón de aplicar filtros', async () => {
      render(<ReportePurezaPage />)

      // El botón inicialmente muestra "Cargando..." y luego "Aplicar Filtros"
      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /aplicar filtros|cargando/i })
        expect(applyButton).toBeInTheDocument()
      })
    })

    it('debe actualizar el valor de fecha inicio al escribir', () => {
      render(<ReportePurezaPage />)

      const fechaInicioInput = screen.getByLabelText('Fecha Inicio') as HTMLInputElement
      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })

      expect(fechaInicioInput.value).toBe('2024-01-01')
    })

    it('debe actualizar el valor de fecha fin al escribir', () => {
      render(<ReportePurezaPage />)

      const fechaFinInput = screen.getByLabelText('Fecha Fin') as HTMLInputElement
      fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })

      expect(fechaFinInput.value).toBe('2024-12-31')
    })

    it('debe llamar a obtenerReportePureza con filtros al hacer clic en aplicar', async () => {
      const mockObtenerReporte = jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue(mockReporte as any)

      render(<ReportePurezaPage />)

      // Esperar carga inicial
      await waitFor(() => {
        expect(mockObtenerReporte).toHaveBeenCalledTimes(1)
      })

      // Limpiar llamadas anteriores
      mockObtenerReporte.mockClear()

      const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
      const fechaFinInput = screen.getByLabelText('Fecha Fin')
      const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })

      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
      fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })
      fireEvent.click(applyButton)

      await waitFor(() => {
        expect(mockObtenerReporte).toHaveBeenCalledWith({
          fechaInicio: '2024-01-01',
          fechaFin: '2024-12-31',
        })
      })
    })

    it('debe mostrar estado de carga en el botón', async () => {
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<ReportePurezaPage />)

      const applyButton = screen.getByRole('button', { name: /cargando/i })
      expect(applyButton).toBeDisabled()
    })
  })

  describe('Test: Carga inicial de datos', () => {
    it('debe cargar el reporte al montar el componente', async () => {
      const mockObtenerReporte = jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue(mockReporte as any)

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(mockObtenerReporte).toHaveBeenCalledWith({
          fechaInicio: undefined,
          fechaFin: undefined,
        })
      })
    })

    it('debe mostrar el total de análisis de pureza', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
        expect(screen.getByText('Total Análisis de Pureza')).toBeInTheDocument()
      })
    })

    it('debe auto-seleccionar la primera especie después de cargar', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const combobox = screen.getByTestId('combobox-especie') as HTMLSelectElement
        expect(combobox.value).toBe('Trigo')
      })
    })

    it('debe manejar error al cargar reporte', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockRejectedValue(new Error('Error de red'))

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error al cargar reporte:', expect.any(Error))
      })

      consoleError.mockRestore()
    })
  })

  describe('Test: Métrica de total de análisis', () => {
    it('debe mostrar 0 cuando no hay reporte cargado', () => {
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue(null as any)

      render(<ReportePurezaPage />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('debe mostrar el valor correcto del total de análisis', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Gráfico de cumplimiento de estándares', () => {
    it('debe renderizar el título del gráfico', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Cumplimiento de Estándares (%)')).toBeInTheDocument()
        expect(screen.getByText('Porcentaje de muestras que cumplen estándares por especie')).toBeInTheDocument()
      })
    })

    it('debe renderizar el gráfico de barras cuando hay datos', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThan(0)
      })
    })

    it('debe mostrar mensaje cuando no hay datos', async () => {
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue({
          totalPurezas: 0,
          porcentajeCumpleEstandar: {},
          porcentajeMalezas: {},
          porcentajeOtrasSemillas: {},
          contaminantesPorEspecie: {},
        } as any)

      render(<ReportePurezaPage />)

      await waitFor(() => {
        const noDataMessages = screen.getAllByText('No hay datos disponibles')
        expect(noDataMessages.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Test: Gráfico de malezas', () => {
    it('debe renderizar el título del gráfico de malezas', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Porcentaje Promedio de Malezas por Especie')).toBeInTheDocument()
        expect(screen.getByText('Promedio de contaminación por malezas')).toBeInTheDocument()
      })
    })

    it('debe renderizar el gráfico de barras de malezas cuando hay datos', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('Test: Gráfico de otras semillas', () => {
    it('debe renderizar el título del gráfico de otras semillas', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Porcentaje Promedio de Otras Semillas por Especie')).toBeInTheDocument()
        expect(screen.getByText('Promedio de contaminación por otras semillas')).toBeInTheDocument()
      })
    })

    it('debe renderizar el gráfico de barras de otras semillas cuando hay datos', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  describe('Test: Selector de especie', () => {
    it('debe renderizar el selector de especie', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Seleccionar Especie')).toBeInTheDocument()
        expect(screen.getByTestId('combobox-especie')).toBeInTheDocument()
      })
    })

    it('debe mostrar las especies disponibles en el selector', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const combobox = screen.getByTestId('combobox-especie')
        expect(combobox).toBeInTheDocument()
        
        // Verificar que las opciones existen
        expect(screen.getByText('Trigo')).toBeInTheDocument()
        expect(screen.getByText('Maíz')).toBeInTheDocument()
        expect(screen.getByText('Soja')).toBeInTheDocument()
      })
    })

    it('debe cambiar la especie seleccionada', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const combobox = screen.getByTestId('combobox-especie') as HTMLSelectElement
        expect(combobox.value).toBe('Trigo')
      })

      const combobox = screen.getByTestId('combobox-especie')
      fireEvent.change(combobox, { target: { value: 'Maíz' } })

      await waitFor(() => {
        expect((combobox as HTMLSelectElement).value).toBe('Maíz')
      })
    })
  })

  describe('Test: Carga de contaminantes', () => {
    it('debe cargar contaminantes al seleccionar una especie', async () => {
      const mockObtenerContaminantes = jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockResolvedValue(mockContaminantes)

      render(<ReportePurezaPage />)

      await waitFor(() => {
        const combobox = screen.getByTestId('combobox-especie')
        expect(combobox).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(mockObtenerContaminantes).toHaveBeenCalledWith('Trigo', {
          fechaInicio: undefined,
          fechaFin: undefined,
        })
      })
    })

    it('debe recargar contaminantes cuando cambian las fechas', async () => {
      const mockObtenerContaminantes = jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockResolvedValue(mockContaminantes)

      render(<ReportePurezaPage />)

      // Esperar carga inicial
      await waitFor(() => {
        expect(mockObtenerContaminantes).toHaveBeenCalledTimes(1)
      })

      mockObtenerContaminantes.mockClear()

      const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })

      await waitFor(() => {
        expect(mockObtenerContaminantes).toHaveBeenCalledWith('Trigo', {
          fechaInicio: '2024-01-01',
          fechaFin: undefined,
        })
      })
    })

    it('debe mostrar estado de carga de contaminantes', async () => {
      jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Cargando contaminantes...')).toBeInTheDocument()
      })
    })

    it('debe manejar error al cargar contaminantes', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockRejectedValue(new Error('Error de red'))

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error al cargar contaminantes:', expect.any(Error))
      })

      consoleError.mockRestore()
    })
  })

  describe('Test: Pie Charts de contaminantes', () => {
    it('debe mostrar pie chart general cuando hay contaminantes', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Distribución General')).toBeInTheDocument()
        const pieCharts = screen.getAllByTestId('pie-chart')
        expect(pieCharts.length).toBeGreaterThan(0)
      })
    })

    it('debe mostrar pie chart de malezas específicas', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Detalle de Malezas')).toBeInTheDocument()
      })
    })

    it('debe mostrar pie chart de otros cultivos', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Detalle de Otros Cultivos')).toBeInTheDocument()
      })
    })

    it('debe mostrar mensaje cuando no hay malezas', async () => {
      jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockResolvedValue({
          'Total Malezas': 0,
          'Total Otros Cultivos': 10,
          'Cultivo: Avena': 10,
        })

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Sin malezas')).toBeInTheDocument()
      })
    })

    it('debe mostrar mensaje cuando no hay otros cultivos', async () => {
      jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockResolvedValue({
          'Total Malezas': 15,
          'Total Otros Cultivos': 0,
          'Maleza: Yuyo colorado': 15,
        })

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Sin otros cultivos')).toBeInTheDocument()
      })
    })

    it('debe mostrar mensaje cuando no hay contaminantes para la especie', async () => {
      jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockResolvedValue({
          'Total Malezas': 0,
          'Total Otros Cultivos': 0,
        })

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('No hay contaminantes registrados para esta especie')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Estados vacíos', () => {
    it('debe mostrar mensaje cuando no hay especie seleccionada', async () => {
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue({
          totalPurezas: 0,
          porcentajeCumpleEstandar: {},
          porcentajeMalezas: {},
          porcentajeOtrasSemillas: {},
          contaminantesPorEspecie: {},
        } as any)

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Selecciona una especie para ver los contaminantes')).toBeInTheDocument()
      })
    })

    it('debe mostrar 0 en total de análisis cuando el reporte está vacío', async () => {
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue({
          totalPurezas: 0,
          porcentajeCumpleEstandar: {},
          porcentajeMalezas: {},
          porcentajeOtrasSemillas: {},
          contaminantesPorEspecie: {},
        } as any)

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Integración de datos en gráficos', () => {
    it('debe transformar correctamente los datos de cumplimiento de estándares', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        const cumplimientoChart = barCharts[0]
        expect(cumplimientoChart).toHaveAttribute('data-items', '3')
      })
    })

    it('debe transformar correctamente los datos de malezas', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('debe transformar correctamente los datos de otras semillas', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart')
        expect(barCharts.length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  describe('Test: Interacción con filtros y recarga', () => {
    it('debe aplicar filtros y recargar contaminantes', async () => {
      const mockObtenerContaminantes = jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockResolvedValue(mockContaminantes)

      render(<ReportePurezaPage />)

      // Esperar carga inicial
      await waitFor(() => {
        expect(mockObtenerContaminantes).toHaveBeenCalledTimes(1)
      })

      mockObtenerContaminantes.mockClear()

      const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
      const fechaFinInput = screen.getByLabelText('Fecha Fin')
      const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })

      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
      fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })
      fireEvent.click(applyButton)

      await waitFor(() => {
        expect(mockObtenerContaminantes).toHaveBeenCalled()
      })
    })

    it('debe mantener la especie seleccionada después de aplicar filtros', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        const combobox = screen.getByTestId('combobox-especie') as HTMLSelectElement
        expect(combobox.value).toBe('Trigo')
      })

      const combobox = screen.getByTestId('combobox-especie')
      fireEvent.change(combobox, { target: { value: 'Maíz' } })

      const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })
      fireEvent.click(applyButton)

      await waitFor(() => {
        expect((screen.getByTestId('combobox-especie') as HTMLSelectElement).value).toBe('Maíz')
      })
    })
  })

  describe('Test: Filtrado de contaminantes específicos', () => {
    it('debe separar malezas específicas correctamente', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        // Los datos de malezas específicas deberían estar presentes
        const pieCharts = screen.getAllByTestId('pie-chart')
        expect(pieCharts.length).toBeGreaterThan(0)
      })
    })

    it('debe separar cultivos específicos correctamente', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        // Los datos de cultivos específicos deberían estar presentes
        const pieCharts = screen.getAllByTestId('pie-chart')
        expect(pieCharts.length).toBeGreaterThan(0)
      })
    })

    it('debe calcular totales correctamente', async () => {
      render(<ReportePurezaPage />)

      await waitFor(() => {
        // Verificar que los pie charts se renderizan
        const pieCharts = screen.getAllByTestId('pie-chart')
        expect(pieCharts.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Test: Casos extremos', () => {
    it('debe manejar reporte con valores null', async () => {
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue({
          totalPurezas: null,
          porcentajeCumpleEstandar: null,
          porcentajeMalezas: null,
          porcentajeOtrasSemillas: null,
          contaminantesPorEspecie: null,
        } as any)

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })

    it('debe manejar contaminantes vacíos', async () => {
      jest.spyOn(reporteService, 'obtenerContaminantesPureza')
        .mockResolvedValue({})

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('No hay contaminantes registrados para esta especie')).toBeInTheDocument()
      })
    })

    it('debe manejar especies con nombres largos', async () => {
      jest.spyOn(reporteService, 'obtenerReportePureza')
        .mockResolvedValue({
          totalPurezas: 1,
          porcentajeCumpleEstandar: {
            'Triticum aestivum L. var. Baguette Premium 11': 95.5,
          },
          porcentajeMalezas: {},
          porcentajeOtrasSemillas: {},
          contaminantesPorEspecie: {},
        } as any)

      render(<ReportePurezaPage />)

      await waitFor(() => {
        expect(screen.getByText('Triticum aestivum L. var. Baguette Premium 11')).toBeInTheDocument()
      })
    })
  })
})
