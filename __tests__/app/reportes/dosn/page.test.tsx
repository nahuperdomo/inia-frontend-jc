import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReporteDosnPage from '@/app/reportes/dosn/page';
import { obtenerReporteDosn, obtenerContaminantesDosn } from '@/app/services/reporte-service';
import type { ReportePurezaDTO } from '@/app/models/interfaces/reportes';

// Mocks
jest.mock('@/app/services/reporte-service');

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

jest.mock('@/components/ui/combobox', () => ({
    Combobox: ({ value, onValueChange, options, placeholder }: any) => (
        <select
            data-testid="combobox-selector"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            aria-label="Seleccionar Especie"
        >
            <option value="">{placeholder}</option>
            {options?.map((option: any) => (
                <option key={option.id} value={option.id}>
                    {option.nombre}
                </option>
            ))}
        </select>
    ),
}));

// Mock recharts
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-length={data?.length}>{children}</div>,
    Bar: ({ dataKey, fill }: any) => <div data-testid="bar" data-key={dataKey} data-fill={fill} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ data, dataKey }: any) => <div data-testid="pie" data-length={data?.length} data-key={dataKey} />,
    Cell: () => <div data-testid="cell" />,
}));

const mockObtenerReporteDosn = obtenerReporteDosn as jest.MockedFunction<typeof obtenerReporteDosn>;
const mockObtenerContaminantesDosn = obtenerContaminantesDosn as jest.MockedFunction<typeof obtenerContaminantesDosn>;

const mockReporteData: ReportePurezaDTO = {
    totalPurezas: 50,
    porcentajeCumpleEstandar: {
        'Trigo': 85.5,
        'Maíz': 92.3,
        'Soja': 78.0,
    },
    porcentajeMalezas: {
        'Trigo': 2.5,
        'Maíz': 1.8,
        'Soja': 3.2,
    },
    porcentajeOtrasSemillas: {
        'Trigo': 1.5,
        'Maíz': 0.8,
        'Soja': 2.1,
    },
    contaminantesPorEspecie: {
        'Trigo': 10,
        'Maíz': 5,
        'Soja': 8,
    },
}; const mockContaminantesData = {
    'Total Malezas': 15,
    'Total Otros Cultivos': 8,
    'Total Contaminantes en Listados': 23,
    'Total Registros de Cuscuta': 3,
    'Maleza: Avena fatua': 5,
    'Maleza: Lolium multiflorum': 10,
    'Cultivo: Cebada': 4,
    'Cultivo: Centeno': 4,
};

describe('ReporteDosnPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockObtenerReporteDosn.mockResolvedValue(mockReporteData);
        mockObtenerContaminantesDosn.mockResolvedValue(mockContaminantesData);
    });

    describe('Renderizado inicial', () => {
        it('debe renderizar el título de la página', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Reporte de DOSN')).toBeInTheDocument();
            });
        });

        it('debe renderizar la descripción', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Métricas y estadísticas de análisis de DOSN')).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de volver', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Volver')).toBeInTheDocument();
            });
        });

        it('debe cargar reporte automáticamente al iniciar', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(mockObtenerReporteDosn).toHaveBeenCalled();
            });
        });

        it('debe tener icono de TestTubes', async () => {
            const { container } = render(<ReporteDosnPage />);

            await waitFor(() => {
                const icons = container.querySelectorAll('.lucide-test-tubes');
                expect(icons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Filtros de fecha', () => {
        it('debe mostrar sección de filtros de fecha', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Filtros de Fecha')).toBeInTheDocument();
            });
        });

        it('debe mostrar campo de fecha inicio', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument();
            });
        });

        it('debe mostrar campo de fecha fin', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument();
            });
        });

        it('debe permitir cambiar fecha inicio', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Fecha Inicio') as HTMLInputElement;
                fireEvent.change(input, { target: { value: '2024-01-01' } });
                expect(input.value).toBe('2024-01-01');
            });
        });

        it('debe permitir cambiar fecha fin', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Fecha Fin') as HTMLInputElement;
                fireEvent.change(input, { target: { value: '2024-12-31' } });
                expect(input.value).toBe('2024-12-31');
            });
        });

        it('debe tener botón de aplicar filtros', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument();
            });
        });

        it('debe llamar a obtenerReporteDosn al hacer clic en aplicar filtros', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const button = screen.getByText('Aplicar Filtros');
                fireEvent.click(button);
            });

            await waitFor(() => {
                expect(mockObtenerReporteDosn).toHaveBeenCalledTimes(2); // 1 inicial + 1 del botón
            });
        });

        it('debe pasar fechas al servicio cuando se aplican filtros', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const inputInicio = screen.getByLabelText('Fecha Inicio');
                const inputFin = screen.getByLabelText('Fecha Fin');
                fireEvent.change(inputInicio, { target: { value: '2024-01-01' } });
                fireEvent.change(inputFin, { target: { value: '2024-12-31' } });
            });

            await waitFor(() => {
                const button = screen.getByText('Aplicar Filtros');
                fireEvent.click(button);
            });

            await waitFor(() => {
                expect(mockObtenerReporteDosn).toHaveBeenCalledWith({
                    fechaInicio: '2024-01-01',
                    fechaFin: '2024-12-31',
                });
            });
        });

        it('debe mostrar "Cargando..." mientras carga', async () => {
            mockObtenerReporteDosn.mockImplementation(() => new Promise(() => { }));
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const button = screen.getByText('Aplicar Filtros');
                fireEvent.click(button);
            });

            await waitFor(() => {
                expect(screen.getByText('Cargando...')).toBeInTheDocument();
            });
        });

        it('debe deshabilitar botón mientras carga', async () => {
            mockObtenerReporteDosn.mockImplementation(() => new Promise(() => { }));
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const button = screen.getByText('Aplicar Filtros');
                fireEvent.click(button);
            });

            await waitFor(() => {
                const button = screen.getByText('Cargando...') as HTMLButtonElement;
                expect(button.disabled).toBe(true);
            });
        });
    });

    describe('Total de análisis', () => {
        it('debe mostrar título de total análisis', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Total Análisis de DOSN')).toBeInTheDocument();
            });
        });

        it('debe mostrar el total de análisis', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('50')).toBeInTheDocument();
            });
        });

        it('debe mostrar 0 cuando no hay reporte', async () => {
            mockObtenerReporteDosn.mockResolvedValue({
                totalPurezas: 0,
            } as ReportePurezaDTO);

            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('0')).toBeInTheDocument();
            });
        });
    });

    describe('Selector de especies', () => {
        it('debe mostrar selector de especies', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByTestId('combobox-selector')).toBeInTheDocument();
            });
        });

        it('debe auto-seleccionar primera especie', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const selector = screen.getByTestId('combobox-selector') as HTMLSelectElement;
                expect(selector.value).toBe('Trigo');
            });
        });

        it('debe permitir cambiar especie seleccionada', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const selector = screen.getByTestId('combobox-selector');
                fireEvent.change(selector, { target: { value: 'Maíz' } });
            });

            await waitFor(() => {
                const selector = screen.getByTestId('combobox-selector') as HTMLSelectElement;
                expect(selector.value).toBe('Maíz');
            });
        });

        it('debe cargar contaminantes al cambiar especie', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const selector = screen.getByTestId('combobox-selector');
                fireEvent.change(selector, { target: { value: 'Soja' } });
            });

            await waitFor(() => {
                expect(mockObtenerContaminantesDosn).toHaveBeenCalledWith('Soja', expect.any(Object));
            });
        });

        it('debe mostrar opciones de especies', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Trigo')).toBeInTheDocument();
                expect(screen.getByText('Maíz')).toBeInTheDocument();
                expect(screen.getByText('Soja')).toBeInTheDocument();
            });
        });
    });

    describe('Contaminantes por especie', () => {
        it('debe mostrar título de contaminantes', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Contaminantes por Especie')).toBeInTheDocument();
            });
        });

        it('debe mostrar descripción de contaminantes', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Detalle de malezas, otros cultivos y cuscuta encontrados')).toBeInTheDocument();
            });
        });

        it('debe cargar contaminantes de la primera especie', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(mockObtenerContaminantesDosn).toHaveBeenCalledWith('Trigo', expect.any(Object));
            });
        });

        it('debe mostrar mensaje de carga mientras obtiene contaminantes', async () => {
            mockObtenerContaminantesDosn.mockImplementation(() => new Promise(() => { }));
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Cargando contaminantes...')).toBeInTheDocument();
            });
        });

        it('debe mostrar gráficos cuando hay contaminantes', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Distribución General')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando no hay especie seleccionada', async () => {
            mockObtenerReporteDosn.mockResolvedValue({
                totalPurezas: 0,
                contaminantesPorEspecie: {},
            } as ReportePurezaDTO);

            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Selecciona una especie para ver los contaminantes')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando no hay contaminantes', async () => {
            mockObtenerContaminantesDosn.mockResolvedValue({});
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('No hay contaminantes registrados para esta especie')).toBeInTheDocument();
            });
        });
    });

    describe('Gráficos de contaminantes', () => {
        it('debe mostrar gráfico de distribución general', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Distribución General')).toBeInTheDocument();
            });
        });

        it('debe mostrar gráfico de detalle de malezas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Detalle de Malezas')).toBeInTheDocument();
            });
        });

        it('debe mostrar gráfico de detalle de otros cultivos', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Detalle de Otros Cultivos')).toBeInTheDocument();
            });
        });

        it('debe mostrar PieCharts cuando hay datos', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const pieCharts = screen.getAllByTestId('pie-chart');
                expect(pieCharts.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar mensaje cuando no hay malezas específicas', async () => {
            mockObtenerContaminantesDosn.mockResolvedValue({
                'Total Malezas': 0,
                'Total Otros Cultivos': 5,
            });

            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Sin malezas')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando no hay otros cultivos', async () => {
            mockObtenerContaminantesDosn.mockResolvedValue({
                'Total Malezas': 5,
                'Total Otros Cultivos': 0,
            });

            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Sin otros cultivos')).toBeInTheDocument();
            });
        });
    });

    describe('Gráfico de cumplimiento de estándares', () => {
        it('debe mostrar título del gráfico', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Cumplimiento de Estándares (%)')).toBeInTheDocument();
            });
        });

        it('debe mostrar descripción del gráfico', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Porcentaje de muestras que cumplen estándares por especie')).toBeInTheDocument();
            });
        });

        it('debe renderizar BarChart cuando hay datos', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart');
                expect(barCharts.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar mensaje cuando no hay datos', async () => {
            mockObtenerReporteDosn.mockResolvedValue({
                totalPurezas: 0,
                porcentajeCumpleEstandar: {},
            } as ReportePurezaDTO);

            render(<ReporteDosnPage />);

            await waitFor(() => {
                const noDataMessages = screen.getAllByText('No hay datos disponibles');
                expect(noDataMessages.length).toBeGreaterThan(0);
            });
        });

        it('debe tener datos correctos en el gráfico', async () => {
            const { container } = render(<ReporteDosnPage />);

            await waitFor(() => {
                const barChart = container.querySelector('[data-testid="bar-chart"]');
                expect(barChart).toHaveAttribute('data-length', '3');
            });
        });
    });

    describe('Gráfico de malezas', () => {
        it('debe mostrar título del gráfico de malezas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Porcentaje Promedio de Malezas por Especie')).toBeInTheDocument();
            });
        });

        it('debe mostrar descripción del gráfico de malezas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Promedio de contaminación por malezas')).toBeInTheDocument();
            });
        });

        it('debe renderizar gráfico de barras para malezas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart');
                expect(barCharts.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar mensaje cuando no hay datos de malezas', async () => {
            mockObtenerReporteDosn.mockResolvedValue({
                totalPurezas: 50,
                porcentajeMalezas: {},
            } as ReportePurezaDTO);

            render(<ReporteDosnPage />);

            await waitFor(() => {
                const noDataMessages = screen.getAllByText('No hay datos disponibles');
                expect(noDataMessages.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Gráfico de otras semillas', () => {
        it('debe mostrar título del gráfico de otras semillas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Porcentaje Promedio de Otras Semillas por Especie')).toBeInTheDocument();
            });
        });

        it('debe mostrar descripción del gráfico de otras semillas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Promedio de contaminación por otras semillas')).toBeInTheDocument();
            });
        });

        it('debe renderizar gráfico de barras para otras semillas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const barCharts = screen.getAllByTestId('bar-chart');
                expect(barCharts.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar mensaje cuando no hay datos de otras semillas', async () => {
            mockObtenerReporteDosn.mockResolvedValue({
                totalPurezas: 50,
                porcentajeOtrasSemillas: {},
            } as ReportePurezaDTO);

            render(<ReporteDosnPage />);

            await waitFor(() => {
                const noDataMessages = screen.getAllByText('No hay datos disponibles');
                expect(noDataMessages.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Manejo de errores', () => {
        it('debe manejar error al cargar reporte', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation();
            mockObtenerReporteDosn.mockRejectedValue(new Error('Error de red'));

            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalledWith('Error al cargar reporte:', expect.any(Error));
            });

            consoleError.mockRestore();
        });

        it('debe manejar error al cargar contaminantes', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation();
            mockObtenerContaminantesDosn.mockRejectedValue(new Error('Error de red'));

            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalledWith('Error al cargar contaminantes:', expect.any(Error));
            });

            consoleError.mockRestore();
        });

        it('debe mostrar total 0 cuando hay error', async () => {
            mockObtenerReporteDosn.mockRejectedValue(new Error('Error'));

            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('0')).toBeInTheDocument();
            });
        });
    });

    describe('Navegación', () => {
        it('debe tener enlace correcto para volver', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const volverLink = links.find(link => link.getAttribute('href') === '/reportes');
                expect(volverLink).toBeInTheDocument();
            });
        });
    });

    describe('Actualización de contaminantes con filtros', () => {
        it('debe recargar contaminantes al cambiar fechas', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const inputInicio = screen.getByLabelText('Fecha Inicio');
                fireEvent.change(inputInicio, { target: { value: '2024-01-01' } });
            });

            await waitFor(() => {
                expect(mockObtenerContaminantesDosn).toHaveBeenCalledWith('Trigo', {
                    fechaInicio: '2024-01-01',
                    fechaFin: '',
                });
            });
        });

        it('debe pasar filtros correctos a obtenerContaminantesDosn', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                const inputInicio = screen.getByLabelText('Fecha Inicio');
                const inputFin = screen.getByLabelText('Fecha Fin');
                fireEvent.change(inputInicio, { target: { value: '2024-01-01' } });
                fireEvent.change(inputFin, { target: { value: '2024-12-31' } });
            });

            await waitFor(() => {
                expect(mockObtenerContaminantesDosn).toHaveBeenCalledWith('Trigo', {
                    fechaInicio: '2024-01-01',
                    fechaFin: '2024-12-31',
                });
            });
        });
    });

    describe('Componentes gráficos', () => {
        it('debe renderizar ResponsiveContainer', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
            });
        });

        it('debe renderizar componentes de CartesianGrid', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getAllByTestId('cartesian-grid').length).toBeGreaterThan(0);
            });
        });

        it('debe renderizar componentes de Tooltip', async () => {
            render(<ReporteDosnPage />);

            await waitFor(() => {
                expect(screen.getAllByTestId('tooltip').length).toBeGreaterThan(0);
            });
        });
    });

    describe('Iconos', () => {
        it('debe renderizar icono de Calendar en filtros', async () => {
            const { container } = render(<ReporteDosnPage />);

            await waitFor(() => {
                const calendarIcon = container.querySelector('.lucide-calendar');
                expect(calendarIcon).toBeInTheDocument();
            });
        });

        it('debe renderizar icono de ArrowLeft en botón volver', async () => {
            const { container } = render(<ReporteDosnPage />);

            await waitFor(() => {
                const arrowIcon = container.querySelector('.lucide-arrow-left');
                expect(arrowIcon).toBeInTheDocument();
            });
        });
    });
});
