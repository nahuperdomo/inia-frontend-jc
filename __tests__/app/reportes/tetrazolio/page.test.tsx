/**
 * Tests para la página de Reporte de Tetrazolio
 * 
 * Estos tests cubren:
 * - Renderizado de componentes principales (título, filtros, cards)
 * - Carga inicial de reporte sin filtros
 * - Aplicación de filtros de fecha
 * - Visualización de métricas (total de análisis)
 * - Gráficos de viabilidad INIA por especie
 * - Gráficos de viabilidad INASE por especie
 * - Manejo de estados vacíos
 * - Manejo de errores
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReporteTetrazolioPage from '@/app/reportes/tetrazolio/page'
import * as reporteService from '@/app/services/reporte-service'

// Mock de servicios
jest.mock('@/app/services/reporte-service')

// Mock de Link de Next.js
jest.mock('next/link', () => {
    return ({ children, href }: any) => {
        return <a href={href}>{children}</a>
    }
})

// Mock de Recharts
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-items={data?.length}>{children}</div>,
    Bar: ({ dataKey, fill }: any) => <div data-testid="bar" data-key={dataKey} data-fill={fill} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
}))

describe('ReporteTetrazolioPage Tests', () => {
    const mockReporte = {
        totalTetrazolios: 85,
        viabilidadIniaPorEspecie: {
            'Trigo': 92.5,
            'Maíz': 88.3,
            'Soja': 95.1,
        },
        viabilidadInasePorEspecie: {
            'Trigo': 91.8,
            'Maíz': 87.5,
            'Soja': 94.6,
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'log').mockImplementation()
        jest.spyOn(console, 'error').mockImplementation()
        jest.spyOn(reporteService, 'obtenerReporteTetrazolio').mockResolvedValue(mockReporte as any)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Test: Renderizado básico', () => {
        it('debe renderizar el título y descripción de la página', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('Reporte de Tetrazolio')).toBeInTheDocument()
                expect(screen.getByText('Métricas y estadísticas de análisis de viabilidad')).toBeInTheDocument()
            })
        })

        it('debe renderizar el botón volver', () => {
            render(<ReporteTetrazolioPage />)

            const volverLink = screen.getByRole('link', { name: /volver/i })
            expect(volverLink).toBeInTheDocument()
            expect(volverLink).toHaveAttribute('href', '/reportes')
        })

        it('debe renderizar el ícono de TestTube', () => {
            render(<ReporteTetrazolioPage />)

            const container = screen.getByText('Reporte de Tetrazolio').parentElement?.parentElement
            expect(container).toBeInTheDocument()
        })
    })

    describe('Test: Filtros de fecha', () => {
        it('debe renderizar los campos de fecha', () => {
            render(<ReporteTetrazolioPage />)

            expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument()
            expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument()
        })

        it('debe renderizar el botón de aplicar filtros', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const applyButton = screen.getByRole('button', { name: /aplicar filtros|cargando/i })
                expect(applyButton).toBeInTheDocument()
            })
        })

        it('debe permitir cambiar la fecha de inicio', () => {
            render(<ReporteTetrazolioPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })

            expect(fechaInicioInput).toHaveValue('2024-01-01')
        })

        it('debe permitir cambiar la fecha fin', () => {
            render(<ReporteTetrazolioPage />)

            const fechaFinInput = screen.getByLabelText('Fecha Fin')
            fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })

            expect(fechaFinInput).toHaveValue('2024-12-31')
        })

        it('debe llamar al servicio al aplicar filtros', async () => {
            const mockObtener = jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue(mockReporte as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(mockObtener).toHaveBeenCalledTimes(1)
            })

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })

            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
            fireEvent.click(applyButton)

            await waitFor(() => {
                expect(mockObtener).toHaveBeenCalledWith({
                    fechaInicio: '2024-01-01',
                    fechaFin: undefined,
                })
            })
        })

        it('debe enviar ambas fechas si están completas', async () => {
            const mockObtener = jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue(mockReporte as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(mockObtener).toHaveBeenCalledTimes(1)
            })

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const fechaFinInput = screen.getByLabelText('Fecha Fin')
            const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })

            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
            fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })
            fireEvent.click(applyButton)

            await waitFor(() => {
                expect(mockObtener).toHaveBeenCalledWith({
                    fechaInicio: '2024-01-01',
                    fechaFin: '2024-12-31',
                })
            })
        })
    })

    describe('Test: Carga inicial', () => {
        it('debe cargar el reporte al montar el componente', async () => {
            const mockObtener = jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue(mockReporte as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(mockObtener).toHaveBeenCalledWith({
                    fechaInicio: undefined,
                    fechaFin: undefined,
                })
            })
        })

        it('debe mostrar el total de tetrazolios después de cargar', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('85')).toBeInTheDocument()
            })
        })

        it('debe mostrar "Cargando..." mientras carga', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockReporte as any), 100)))

            render(<ReporteTetrazolioPage />)

            expect(screen.getByText('Cargando...')).toBeInTheDocument()

            await waitFor(() => {
                expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Métricas de total', () => {
        it('debe mostrar el título del total', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('Total Análisis de Tetrazolio')).toBeInTheDocument()
            })
        })

        it('debe mostrar el valor correcto del total', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('85')).toBeInTheDocument()
            })
        })

        it('debe mostrar 0 cuando no hay datos', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({ totalTetrazolios: 0 } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('0')).toBeInTheDocument()
            })
        })

        it('debe mostrar 0 cuando el reporte es null', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue(null as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('0')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Gráfico de viabilidad INIA', () => {
        it('debe renderizar el título del gráfico INIA', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('Viabilidad INIA Promedio por Especie (%)')).toBeInTheDocument()
            })
        })

        it('debe renderizar la descripción del gráfico INIA', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('Porcentaje de viabilidad con redondeo (INIA) promedio por especie')).toBeInTheDocument()
            })
        })

        it('debe renderizar el componente BarChart para INIA', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart')
                expect(barCharts.length).toBeGreaterThanOrEqual(1)
            })
        })

        it('debe mostrar datos correctos en el gráfico INIA', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart')
                const firstChart = barCharts[0]
                expect(firstChart).toHaveAttribute('data-items', '3')
            })
        })
    })

    describe('Test: Gráfico de viabilidad INASE', () => {
        it('debe renderizar el título del gráfico INASE', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('Viabilidad INASE Promedio por Especie (%)')).toBeInTheDocument()
            })
        })

        it('debe renderizar la descripción del gráfico INASE', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('Porcentaje de viabilidad sin redondeo (INASE) promedio por especie')).toBeInTheDocument()
            })
        })

        it('debe renderizar dos gráficos de barras (INIA y INASE)', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart')
                expect(barCharts).toHaveLength(2)
            })
        })

        it('debe mostrar datos correctos en el gráfico INASE', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart')
                const secondChart = barCharts[1]
                expect(secondChart).toHaveAttribute('data-items', '3')
            })
        })
    })

    describe('Test: Estado vacío', () => {
        it('debe manejar reporte sin datos de viabilidad INIA', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 0,
                    viabilidadIniaPorEspecie: {},
                    viabilidadInasePorEspecie: {},
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('No hay datos disponibles para mostrar')).toBeInTheDocument()
            })
        })

        it('debe manejar viabilidadIniaPorEspecie null', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 5,
                    viabilidadIniaPorEspecie: null,
                    viabilidadInasePorEspecie: null,
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('No hay datos disponibles para mostrar')).toBeInTheDocument()
            })
        })

        it('debe mostrar mensaje cuando no hay datos de INASE', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 10,
                    viabilidadIniaPorEspecie: { 'Trigo': 90 },
                    viabilidadInasePorEspecie: {},
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const messages = screen.getAllByText('No hay datos disponibles para mostrar')
                expect(messages).toHaveLength(1)
            })
        })
    })

    describe('Test: Manejo de errores', () => {
        it('debe manejar error al cargar el reporte', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockRejectedValue(new Error('Error de red'))

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar reporte:', expect.any(Error))
            })
        })

        it('debe mostrar 0 en el total cuando hay error', async () => {
            jest.spyOn(console, 'error').mockImplementation()
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockRejectedValue(new Error('Error'))

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('0')).toBeInTheDocument()
            })
        })

        it('debe habilitar el botón después de un error', async () => {
            jest.spyOn(console, 'error').mockImplementation()
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockRejectedValue(new Error('Error'))

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const button = screen.getByRole('button', { name: /aplicar filtros/i })
                expect(button).not.toBeDisabled()
            })
        })
    })

    describe('Test: Conversión de datos para gráficos', () => {
        it('debe convertir viabilidadIniaPorEspecie correctamente', async () => {
            jest.spyOn(console, 'log')

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    'dataViabilidadInia procesada:',
                    expect.arrayContaining([
                        expect.objectContaining({ especie: 'Trigo', viabilidad: 92.5 }),
                        expect.objectContaining({ especie: 'Maíz', viabilidad: 88.3 }),
                        expect.objectContaining({ especie: 'Soja', viabilidad: 95.1 }),
                    ])
                )
            })
        })

        it('debe convertir viabilidadInasePorEspecie correctamente', async () => {
            jest.spyOn(console, 'log')

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    'dataViabilidadInase procesada:',
                    expect.arrayContaining([
                        expect.objectContaining({ especie: 'Trigo', viabilidad: 91.8 }),
                        expect.objectContaining({ especie: 'Maíz', viabilidad: 87.5 }),
                        expect.objectContaining({ especie: 'Soja', viabilidad: 94.6 }),
                    ])
                )
            })
        })

        it('debe manejar valores no numéricos en viabilidad', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 5,
                    viabilidadIniaPorEspecie: { 'Trigo': 'invalid' as any },
                    viabilidadInasePorEspecie: {},
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    'dataViabilidadInia procesada:',
                    expect.arrayContaining([
                        expect.objectContaining({ especie: 'Trigo', viabilidad: 0 }),
                    ])
                )
            })
        })
    })

    describe('Test: Interacción con el botón', () => {
        it('debe deshabilitar el botón mientras carga', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockReporte as any), 100)))

            render(<ReporteTetrazolioPage />)

            const button = screen.getByRole('button', { name: /cargando/i })
            expect(button).toBeDisabled()

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /aplicar filtros/i })).not.toBeDisabled()
            })
        })

        it('debe cambiar el texto del botón durante la carga', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockReporte as any), 100)))

            render(<ReporteTetrazolioPage />)

            expect(screen.getByText('Cargando...')).toBeInTheDocument()

            await waitFor(() => {
                expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Logging de datos', () => {
        it('debe hacer log de la respuesta del backend', async () => {
            jest.spyOn(console, 'log')

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith('Respuesta del backend Tetrazolio:', mockReporte)
            })
        })

        it('debe hacer log de viabilidadIniaPorEspecie', async () => {
            jest.spyOn(console, 'log')

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith('viabilidadIniaPorEspecie:', mockReporte.viabilidadIniaPorEspecie)
            })
        })

        it('debe hacer log de viabilidadInasePorEspecie', async () => {
            jest.spyOn(console, 'log')

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith('viabilidadInasePorEspecie:', mockReporte.viabilidadInasePorEspecie)
            })
        })

        it('debe hacer log del total de tetrazolios', async () => {
            jest.spyOn(console, 'log')

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith('totalTetrazolios:', mockReporte.totalTetrazolios)
            })
        })
    })

    describe('Test: Responsividad', () => {
        it('debe renderizar ResponsiveContainer para los gráficos', async () => {
            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const containers = screen.getAllByTestId('responsive-container')
                expect(containers.length).toBeGreaterThanOrEqual(2)
            })
        })

        it('debe tener estructura de grid para los filtros', () => {
            render(<ReporteTetrazolioPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            expect(fechaInicioInput.parentElement).toBeInTheDocument()
        })
    })

    describe('Test: Casos edge', () => {
        it('debe manejar especies con nombres largos', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 10,
                    viabilidadIniaPorEspecie: {
                        'Trigo pan muy resistente a la roya': 90,
                    },
                    viabilidadInasePorEspecie: {},
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getAllByTestId('bar-chart')).toHaveLength(1)
            })
        })

        it('debe manejar valores de viabilidad extremos (0%)', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 1,
                    viabilidadIniaPorEspecie: { 'Trigo': 0 },
                    viabilidadInasePorEspecie: { 'Trigo': 0 },
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
            })
        })

        it('debe manejar valores de viabilidad extremos (100%)', async () => {
            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 1,
                    viabilidadIniaPorEspecie: { 'Trigo': 100 },
                    viabilidadInasePorEspecie: { 'Trigo': 100 },
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
            })
        })

        it('debe manejar múltiples especies (más de 10)', async () => {
            const muchasEspecies: Record<string, number> = {}
            for (let i = 1; i <= 15; i++) {
                muchasEspecies[`Especie ${i}`] = 80 + i
            }

            jest.spyOn(reporteService, 'obtenerReporteTetrazolio')
                .mockResolvedValue({
                    totalTetrazolios: 150,
                    viabilidadIniaPorEspecie: muchasEspecies,
                    viabilidadInasePorEspecie: muchasEspecies,
                } as any)

            render(<ReporteTetrazolioPage />)

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart')
                expect(barCharts[0]).toHaveAttribute('data-items', '15')
            })
        })
    })
})
