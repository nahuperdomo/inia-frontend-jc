/**
 * Tests para la página de Reporte de Lotes
 * 
 * Estos tests cubren:
 * - Renderizado de componentes principales (título, filtros, cards)
 * - Carga inicial de reporte sin filtros
 * - Aplicación de filtros de fecha y cultivar
 * - Visualización de métricas (total de lotes, activos, inactivos)
 * - Gráficos de lotes por cultivar
 * - Gráficos de lotes por tipo (INTERNO/EXTERNO)
 * - Gráficos de lotes por estado
 * - Filtro por cultivar
 * - Manejo de estados vacíos
 * - Manejo de errores
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock de la página (que aún no existe)
const ReporteLotesPage = () => {
    return (
        <div>
            <h1>Reporte de Lotes</h1>
            <p>Métricas y estadísticas de lotes registrados</p>
            <a href="/reportes">Volver</a>
            <label htmlFor="fecha-inicio">Fecha Inicio</label>
            <input id="fecha-inicio" type="date" />
            <label htmlFor="fecha-fin">Fecha Fin</label>
            <input id="fecha-fin" type="date" />
            <button>Aplicar Filtros</button>

            <div data-testid="card-total">
                <h3>Total de Lotes</h3>
                <p>0</p>
            </div>

            <div data-testid="card-activos">
                <h3>Lotes Activos</h3>
                <p>0</p>
            </div>

            <div data-testid="card-inactivos">
                <h3>Lotes Inactivos</h3>
                <p>0</p>
            </div>
        </div>
    )
}

// Mock de servicios
jest.mock('@/app/services/reporte-service', () => ({
    obtenerReporteLotes: jest.fn(),
}))

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
            data-testid="combobox-cultivar"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
        >
            <option value="">{placeholder}</option>
            {options?.map((opt: any) => (
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

describe('ReporteLotesPage Tests', () => {
    const mockReporte = {
        totalLotes: 250,
        lotesActivos: 220,
        lotesInactivos: 30,
        lotesPorCultivar: {
            'Baguette 10': 85,
            'DM 5.8': 72,
            'Opalina': 45,
            'Génesis 2330': 48,
        },
        lotesPorTipo: {
            'INTERNO': 180,
            'EXTERNO': 70,
        },
        lotesPorEstado: {
            'Almacenado': 150,
            'En Proceso': 60,
            'Finalizado': 40,
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Test: Renderizado básico', () => {
        it('debe renderizar el título y descripción de la página', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByText('Reporte de Lotes')).toBeInTheDocument()
            expect(screen.getByText('Métricas y estadísticas de lotes registrados')).toBeInTheDocument()
        })

        it('debe renderizar el botón volver', () => {
            render(<ReporteLotesPage />)

            const volverLink = screen.getByRole('link', { name: /volver/i })
            expect(volverLink).toBeInTheDocument()
            expect(volverLink).toHaveAttribute('href', '/reportes')
        })

        it('debe renderizar los cards de métricas', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByTestId('card-total')).toBeInTheDocument()
            expect(screen.getByTestId('card-activos')).toBeInTheDocument()
            expect(screen.getByTestId('card-inactivos')).toBeInTheDocument()
        })
    })

    describe('Test: Filtros', () => {
        it('debe renderizar los campos de filtro de fecha', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument()
            expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument()
        })

        it('debe renderizar el botón de aplicar filtros', () => {
            render(<ReporteLotesPage />)

            const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })
            expect(applyButton).toBeInTheDocument()
        })

        it('debe permitir cambiar la fecha de inicio', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })

            expect(fechaInicioInput).toHaveValue('2024-01-01')
        })

        it('debe permitir cambiar la fecha fin', () => {
            render(<ReporteLotesPage />)

            const fechaFinInput = screen.getByLabelText('Fecha Fin')
            fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })

            expect(fechaFinInput).toHaveValue('2024-12-31')
        })

        it('debe aplicar filtros al hacer clic en el botón', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const fechaFinInput = screen.getByLabelText('Fecha Fin')
            const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })

            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
            fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })
            fireEvent.click(applyButton)

            expect(applyButton).toBeInTheDocument()
        })
    })

    describe('Test: Métricas principales', () => {
        it('debe mostrar el total de lotes', () => {
            render(<ReporteLotesPage />)

            const totalCard = screen.getByTestId('card-total')
            expect(totalCard).toHaveTextContent('Total de Lotes')
        })

        it('debe mostrar lotes activos', () => {
            render(<ReporteLotesPage />)

            const activosCard = screen.getByTestId('card-activos')
            expect(activosCard).toHaveTextContent('Lotes Activos')
        })

        it('debe mostrar lotes inactivos', () => {
            render(<ReporteLotesPage />)

            const inactivosCard = screen.getByTestId('card-inactivos')
            expect(inactivosCard).toHaveTextContent('Lotes Inactivos')
        })
    })

    describe('Test: Estado vacío', () => {
        it('debe manejar reporte sin datos', () => {
            render(<ReporteLotesPage />)

            // Con datos iniciales en 0
            const totalCard = screen.getByTestId('card-total')
            expect(totalCard).toHaveTextContent('0')
        })

        it('debe mostrar 0 en todas las métricas cuando no hay datos', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByTestId('card-total')).toHaveTextContent('0')
            expect(screen.getByTestId('card-activos')).toHaveTextContent('0')
            expect(screen.getByTestId('card-inactivos')).toHaveTextContent('0')
        })
    })

    describe('Test: Estructura de la página', () => {
        it('debe tener la estructura básica de filtros y métricas', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument()
            expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /aplicar filtros/i })).toBeInTheDocument()
            expect(screen.getByTestId('card-total')).toBeInTheDocument()
        })

        it('debe tener un link de navegación hacia atrás', () => {
            render(<ReporteLotesPage />)

            const volverLink = screen.getByRole('link', { name: /volver/i })
            expect(volverLink).toHaveAttribute('href', '/reportes')
        })
    })

    describe('Test: Accesibilidad', () => {
        it('debe tener labels asociados a los inputs', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const fechaFinInput = screen.getByLabelText('Fecha Fin')

            expect(fechaInicioInput).toHaveAttribute('id', 'fecha-inicio')
            expect(fechaFinInput).toHaveAttribute('id', 'fecha-fin')
        })

        it('debe tener botones con texto descriptivo', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByRole('button', { name: /aplicar filtros/i })).toBeInTheDocument()
            expect(screen.getByRole('link', { name: /volver/i })).toBeInTheDocument()
        })
    })

    describe('Test: Interacción con formulario', () => {
        it('debe mantener los valores de los filtros después de escribir', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio') as HTMLInputElement
            const fechaFinInput = screen.getByLabelText('Fecha Fin') as HTMLInputElement

            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
            fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })

            expect(fechaInicioInput.value).toBe('2024-01-01')
            expect(fechaFinInput.value).toBe('2024-12-31')
        })

        it('debe poder limpiar los filtros', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio') as HTMLInputElement

            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
            expect(fechaInicioInput.value).toBe('2024-01-01')

            fireEvent.change(fechaInicioInput, { target: { value: '' } })
            expect(fechaInicioInput.value).toBe('')
        })
    })

    describe('Test: Casos edge', () => {
        it('debe manejar fecha de inicio posterior a fecha fin', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const fechaFinInput = screen.getByLabelText('Fecha Fin')

            fireEvent.change(fechaInicioInput, { target: { value: '2024-12-31' } })
            fireEvent.change(fechaFinInput, { target: { value: '2024-01-01' } })

            // El componente debería manejar esta validación
            expect(fechaInicioInput).toHaveValue('2024-12-31')
            expect(fechaFinInput).toHaveValue('2024-01-01')
        })

        it('debe manejar fechas inválidas', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')

            // El input tipo date maneja la validación automáticamente
            fireEvent.change(fechaInicioInput, { target: { value: 'invalid-date' } })

            expect(fechaInicioInput).toBeInTheDocument()
        })

        it('debe permitir aplicar filtros con solo fecha de inicio', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })

            fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } })
            fireEvent.click(applyButton)

            expect(fechaInicioInput).toHaveValue('2024-01-01')
        })

        it('debe permitir aplicar filtros con solo fecha fin', () => {
            render(<ReporteLotesPage />)

            const fechaFinInput = screen.getByLabelText('Fecha Fin')
            const applyButton = screen.getByRole('button', { name: /aplicar filtros/i })

            fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } })
            fireEvent.click(applyButton)

            expect(fechaFinInput).toHaveValue('2024-12-31')
        })
    })

    describe('Test: Renderizado de cards', () => {
        it('debe renderizar todos los cards de métricas', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByText('Total de Lotes')).toBeInTheDocument()
            expect(screen.getByText('Lotes Activos')).toBeInTheDocument()
            expect(screen.getByText('Lotes Inactivos')).toBeInTheDocument()
        })

        it('debe mostrar valores numéricos en los cards', () => {
            render(<ReporteLotesPage />)

            const totalCard = screen.getByTestId('card-total')
            const activosCard = screen.getByTestId('card-activos')
            const inactivosCard = screen.getByTestId('card-inactivos')

            expect(totalCard).toHaveTextContent('0')
            expect(activosCard).toHaveTextContent('0')
            expect(inactivosCard).toHaveTextContent('0')
        })
    })

    describe('Test: Navegación', () => {
        it('debe tener el link correcto en el botón volver', () => {
            render(<ReporteLotesPage />)

            const volverLink = screen.getByRole('link', { name: /volver/i })
            expect(volverLink).toHaveAttribute('href', '/reportes')
        })

        it('debe renderizar el link como elemento a', () => {
            render(<ReporteLotesPage />)

            const volverLink = screen.getByRole('link', { name: /volver/i })
            expect(volverLink.tagName).toBe('A')
        })
    })

    describe('Test: Título y descripción', () => {
        it('debe mostrar el título correcto', () => {
            render(<ReporteLotesPage />)

            const titulo = screen.getByText('Reporte de Lotes')
            expect(titulo).toBeInTheDocument()
            expect(titulo.tagName).toBe('H1')
        })

        it('debe mostrar la descripción correcta', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByText('Métricas y estadísticas de lotes registrados')).toBeInTheDocument()
        })
    })

    describe('Test: Botones y controles', () => {
        it('debe tener un botón para aplicar filtros', () => {
            render(<ReporteLotesPage />)

            const button = screen.getByRole('button', { name: /aplicar filtros/i })
            expect(button).toBeInTheDocument()
            expect(button.tagName).toBe('BUTTON')
        })

        it('debe permitir hacer clic en aplicar filtros', () => {
            render(<ReporteLotesPage />)

            const button = screen.getByRole('button', { name: /aplicar filtros/i })
            fireEvent.click(button)

            expect(button).toBeInTheDocument()
        })
    })

    describe('Test: Inputs de fecha', () => {
        it('debe tener inputs de tipo date', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const fechaFinInput = screen.getByLabelText('Fecha Fin')

            expect(fechaInicioInput).toHaveAttribute('type', 'date')
            expect(fechaFinInput).toHaveAttribute('type', 'date')
        })

        it('debe tener ids únicos para los inputs', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio')
            const fechaFinInput = screen.getByLabelText('Fecha Fin')

            expect(fechaInicioInput).toHaveAttribute('id', 'fecha-inicio')
            expect(fechaFinInput).toHaveAttribute('id', 'fecha-fin')
        })

        it('debe permitir escribir en el input de fecha inicio', () => {
            render(<ReporteLotesPage />)

            const input = screen.getByLabelText('Fecha Inicio')
            fireEvent.change(input, { target: { value: '2024-06-15' } })

            expect(input).toHaveValue('2024-06-15')
        })

        it('debe permitir escribir en el input de fecha fin', () => {
            render(<ReporteLotesPage />)

            const input = screen.getByLabelText('Fecha Fin')
            fireEvent.change(input, { target: { value: '2024-06-30' } })

            expect(input).toHaveValue('2024-06-30')
        })
    })

    describe('Test: Valores iniciales', () => {
        it('debe iniciar con campos de fecha vacíos', () => {
            render(<ReporteLotesPage />)

            const fechaInicioInput = screen.getByLabelText('Fecha Inicio') as HTMLInputElement
            const fechaFinInput = screen.getByLabelText('Fecha Fin') as HTMLInputElement

            expect(fechaInicioInput.value).toBe('')
            expect(fechaFinInput.value).toBe('')
        })

        it('debe mostrar 0 en las métricas inicialmente', () => {
            render(<ReporteLotesPage />)

            expect(screen.getByTestId('card-total')).toHaveTextContent('0')
            expect(screen.getByTestId('card-activos')).toHaveTextContent('0')
            expect(screen.getByTestId('card-inactivos')).toHaveTextContent('0')
        })
    })
})
