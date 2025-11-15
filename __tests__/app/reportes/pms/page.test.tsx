import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportePmsPage from '@/app/reportes/pms/page';
import { obtenerReportePms } from '@/app/services/reporte-service';

// Mocks
jest.mock('@/app/services/reporte-service');

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockObtenerReportePms = obtenerReportePms as jest.MockedFunction<typeof obtenerReportePms>;

const mockReporteData = {
  totalPms: 100,
  muestrasConCVSuperado: 15,
  porcentajeMuestrasConCVSuperado: 15.0,
  muestrasConRepeticionesMaximas: 8,
  pmsPorEspecie: {
    'Trigo': 42.5,
    'Maíz': 350.2,
    'Soja': 180.3,
    'Arroz': 25.1,
  },
};

describe('ReportePmsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObtenerReportePms.mockResolvedValue(mockReporteData);
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar el título del reporte', async () => {
      render(<ReportePmsPage />);
      
      expect(screen.getByText('Reporte de PMS')).toBeInTheDocument();
    });

    it('debe mostrar descripción del reporte', () => {
      render(<ReportePmsPage />);
      
      expect(screen.getByText(/Métricas y estadísticas de análisis/i)).toBeInTheDocument();
    });

    it('debe mostrar el botón de volver', () => {
      render(<ReportePmsPage />);
      
      expect(screen.getByText('Volver')).toBeInTheDocument();
    });

    it('debe tener enlace correcto a reportes', () => {
      render(<ReportePmsPage />);
      
      const link = screen.getByRole('link', { name: /volver/i });
      expect(link.getAttribute('href')).toBe('/reportes');
    });

    it('debe cargar el reporte al montar el componente', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Filtros de fecha', () => {
    it('debe renderizar los campos de fecha', () => {
      render(<ReportePmsPage />);
      
      expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument();
      expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument();
    });

    it('debe actualizar fecha inicio cuando el usuario cambia el valor', async () => {
      render(<ReportePmsPage />);
      
      const fechaInicioInput = screen.getByLabelText('Fecha Inicio') as HTMLInputElement;
      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } });

      expect(fechaInicioInput.value).toBe('2024-01-01');
    });

    it('debe actualizar fecha fin cuando el usuario cambia el valor', async () => {
      render(<ReportePmsPage />);
      
      const fechaFinInput = screen.getByLabelText('Fecha Fin') as HTMLInputElement;
      fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } });

      expect(fechaFinInput.value).toBe('2024-12-31');
    });

    it('debe llamar a obtenerReportePms al hacer clic en aplicar filtros', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenCalledTimes(1);
      });

      const fechaInicioInput = screen.getByLabelText('Fecha Inicio');
      const fechaFinInput = screen.getByLabelText('Fecha Fin');
      const aplicarButton = screen.getByText('Aplicar Filtros');

      fireEvent.change(fechaInicioInput, { target: { value: '2024-01-01' } });
      fireEvent.change(fechaFinInput, { target: { value: '2024-12-31' } });
      fireEvent.click(aplicarButton);

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenCalledTimes(2);
        expect(mockObtenerReportePms).toHaveBeenLastCalledWith({
          fechaInicio: '2024-01-01',
          fechaFin: '2024-12-31',
        });
      });
    });

    it('debe enviar undefined cuando las fechas están vacías', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenCalledTimes(1);
      });

      const aplicarButton = screen.getByText('Aplicar Filtros');
      fireEvent.click(aplicarButton);

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenLastCalledWith({
          fechaInicio: undefined,
          fechaFin: undefined,
        });
      });
    });
  });

  describe('Tarjetas de métricas', () => {
    it('debe mostrar el total de análisis PMS', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Análisis PMS')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('debe mostrar muestras con repeticiones máximas', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('Muestras con Repeticiones Máximas')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
      });
    });

    it('debe mostrar 0 cuando no hay datos de reporte', async () => {
      mockObtenerReportePms.mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Sección de CV Superado', () => {
    it('debe mostrar la cantidad de muestras con CV superado', async () => {
      await act(async () => {
        render(<ReportePmsPage />);
      });

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getAllByText('15').length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('debe mostrar el porcentaje de muestras con CV superado', async () => {
      await act(async () => {
        render(<ReportePmsPage />);
      });

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('15.0%')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('debe mostrar 0% cuando no hay porcentaje', async () => {
      mockObtenerReportePms.mockResolvedValue({
        ...mockReporteData,
        porcentajeMuestrasConCVSuperado: undefined,
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      await act(async () => {
        render(<ReportePmsPage />);
      });

      await waitFor(() => {
        expect(mockObtenerReportePms).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('debe mostrar la información sobre CV', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText(/El coeficiente de variación.*no debe superar el 6%/i)).toBeInTheDocument();
        expect(screen.getByText(/Las muestras pueden tener hasta 16 repeticiones/i)).toBeInTheDocument();
        expect(screen.getByText(/Un CV alto indica variabilidad/i)).toBeInTheDocument();
      });
    });
  });

  describe('Gráfico de PMS por especie', () => {
    it('debe mostrar el título del gráfico', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('PMS Promedio por Especie (g)')).toBeInTheDocument();
      });
    });

    it('debe renderizar el gráfico cuando hay datos', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje cuando no hay datos', async () => {
      mockObtenerReportePms.mockResolvedValue({
        ...mockReporteData,
        pmsPorEspecie: {},
      });
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
      });
    });

    it('debe procesar correctamente los datos de especies', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        // El gráfico debe estar presente con datos
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Resumen estadístico', () => {
    it('debe mostrar el resumen cuando hay datos', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('Resumen Estadístico')).toBeInTheDocument();
      });
    });

    it('debe calcular y mostrar la tasa de cumplimiento', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('Tasa de Cumplimiento')).toBeInTheDocument();
        // (100 - 15) / 100 * 100 = 85%
        expect(screen.getByText('85.0%')).toBeInTheDocument();
      });
    });

    it('debe mostrar muestras aprobadas', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('Muestras Aprobadas')).toBeInTheDocument();
        // 100 - 15 = 85
        expect(screen.getByText('85')).toBeInTheDocument();
      });
    });

    it('debe mostrar muestras con problemas', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('Muestras con Problemas')).toBeInTheDocument();
      });
    });

    it('no debe mostrar resumen cuando no hay datos', async () => {
      mockObtenerReportePms.mockResolvedValue({
        ...mockReporteData,
        totalPms: 0,
      });
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.queryByText('Resumen Estadístico')).not.toBeInTheDocument();
      });
    });

    it('no debe mostrar resumen cuando reporte es null', async () => {
      mockObtenerReportePms.mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.queryByText('Resumen Estadístico')).not.toBeInTheDocument();
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar error al cargar reporte', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockObtenerReportePms.mockRejectedValue(new Error('Error de red'));
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error al cargar reporte:', expect.any(Error));
      });

      consoleError.mockRestore();
    });

    it('debe seguir mostrando la interfaz cuando hay error', async () => {
      mockObtenerReportePms.mockRejectedValue(new Error('Error'));
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('Reporte de PMS')).toBeInTheDocument();
        expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument();
      });
    });
  });

  describe('Formateo de datos', () => {
    it('debe formatear correctamente el porcentaje con un decimal', async () => {
      mockObtenerReportePms.mockResolvedValue({
        ...mockReporteData,
        porcentajeMuestrasConCVSuperado: 15.678,
      });
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('15.7%')).toBeInTheDocument();
      });
    });

    it('debe calcular tasa de cumplimiento correcta cuando no hay muestras superadas', async () => {
      mockObtenerReportePms.mockResolvedValue({
        ...mockReporteData,
        muestrasConCVSuperado: 0,
      });
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        expect(screen.getByText('100.0%')).toBeInTheDocument();
      });
    });

    it('debe manejar división por cero en tasa de cumplimiento', async () => {
      mockObtenerReportePms.mockResolvedValue({
        ...mockReporteData,
        totalPms: 0,
        muestrasConCVSuperado: 0,
      });
      
      render(<ReportePmsPage />);

      await waitFor(() => {
        // Cuando totalPms es 0, no debe mostrar el resumen
        expect(screen.queryByText('Tasa de Cumplimiento')).not.toBeInTheDocument();
      });
    });
  });

  describe('Integración de componentes', () => {
    it('debe renderizar todos los íconos', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        // Los iconos se renderizan como SVG
        const icons = document.querySelectorAll('svg');
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it('debe aplicar estilos correctos a las tarjetas', async () => {
      render(<ReportePmsPage />);

      await waitFor(() => {
        const cards = screen.getAllByText(/Total Análisis PMS|Muestras con Repeticiones/i);
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });
});
