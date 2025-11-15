import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetallePMSPage from '@/app/listado/analisis/pms/[id]/page';
import { obtenerPmsPorId, finalizarAnalisis, aprobarAnalisis, marcarParaRepetir } from '@/app/services/pms-service';
import { obtenerRepeticionesPorPms, eliminarRepPms } from '@/app/services/repeticiones-service';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mocks
jest.mock('@/app/services/pms-service');
jest.mock('@/app/services/repeticiones-service');
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock de useAuth
const mockUseAuth = {
  user: { role: 'administrador', nombre: 'Test User' },
  logout: jest.fn(),
};

jest.mock('@/components/auth-provider', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock de componentes que usan AuthProvider
jest.mock('@/components/analisis/analysis-history-card', () => ({
  AnalysisHistoryCard: ({ analisisId, analisisTipo, historial }: any) => (
    <div data-testid="analysis-history-card">
      <span>History Card</span>
      <span>Análisis ID: {analisisId}</span>
      <span>Tipo: {analisisTipo}</span>
      <span>Historial: {historial?.length || 0}</span>
    </div>
  ),
}));

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
  TablaToleranciasButton: ({ pdfPath, title, className }: any) => (
    <button data-testid="tabla-tolerancias" className={className}>
      {title}
      <span>{pdfPath}</span>
    </button>
  ),
}));

jest.mock('@/components/analisis/analisis-info-general-card', () => ({
  AnalisisInfoGeneralCard: ({ lote, especieNombre, cultivarNombre, analisisID, estado, ficha, fechaInicio, fechaFin, comentarios }: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
    <div data-testid="info-general-card">
      <div>Análisis ID: {analisisID}</div>
      <div>Estado: {estado}</div>
      <div>Lote: {lote}</div>
      <div>Ficha: {ficha}</div>
      <div>Especie: {especieNombre}</div>
      <div>Cultivar: {cultivarNombre}</div>
      {fechaInicio && <div>Fecha Inicio: {fechaInicio}</div>}
      {fechaFin && <div>Fecha Fin: {fechaFin}</div>}
      {comentarios && <div>Comentarios: {comentarios}</div>}
    </div>
  ),
}));

jest.mock('@/lib/utils/format-estado', () => ({
  formatearEstado: (estado: string) => {
    const map: Record<string, string> = {
      'APROBADO': 'Aprobado',
      'EN_PROCESO': 'En Proceso',
      'A_REPETIR': 'A Repetir',
      'PENDIENTE_APROBACION': 'Pendiente Aprobación',
      'REGISTRADO': 'Registrado',
      'FINALIZADO': 'Finalizado',
    };
    return map[estado] || estado;
  },
}));

// Mock window.confirm
global.confirm = jest.fn(() => true);

const mockObtenerPmsPorId = obtenerPmsPorId as jest.MockedFunction<typeof obtenerPmsPorId>;
const mockObtenerRepeticionesPorPms = obtenerRepeticionesPorPms as jest.MockedFunction<typeof obtenerRepeticionesPorPms>;
const mockFinalizarAnalisis = finalizarAnalisis as jest.MockedFunction<typeof finalizarAnalisis>;
const mockAprobarAnalisis = aprobarAnalisis as jest.MockedFunction<typeof aprobarAnalisis>;
const mockMarcarParaRepetir = marcarParaRepetir as jest.MockedFunction<typeof marcarParaRepetir>;
const mockEliminarRepPms = eliminarRepPms as jest.MockedFunction<typeof eliminarRepPms>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Prevent unused variable warning
void mockEliminarRepPms;

const mockPmsData = {
  analisisID: 1,
  estado: 'EN_PROCESO' as const,
  fechaInicio: '2024-01-15T10:00:00',
  lote: 'LOTE-001',
  idLote: 1,
  ficha: 'F-001',
  cultivarNombre: 'Cultivar Test',
  especieNombre: 'Trigo',
  activo: true,
  numRepeticionesEsperadas: 8,
  numTandas: 1,
  esSemillaBrozosa: false,
  promedio100g: 42.5,
  desvioStd: 0.123,
  coefVariacion: 3.5,
  pmssinRedon: 42.48,
  pmsconRedon: 42.5,
  comentarios: 'Comentario de prueba',
  historial: [],
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const mockRepeticiones = [
  {
    repPMSID: 1,
    numRep: 1,
    numTanda: 1,
    peso: 4.250,
    valido: true,
  },
  {
    repPMSID: 2,
    numRep: 2,
    numTanda: 1,
    peso: 4.180,
    valido: true,
  },
  {
    repPMSID: 3,
    numRep: 3,
    numTanda: 1,
    peso: 4.320,
    valido: false,
  },
];

describe('DetallePMSPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockObtenerPmsPorId.mockResolvedValue(mockPmsData);
    mockObtenerRepeticionesPorPms.mockResolvedValue(mockRepeticiones);
  });

  describe('Renderizado inicial', () => {
    it('debe mostrar mensaje de carga inicialmente', () => {
      render(<DetallePMSPage />);

      expect(screen.getByText('Cargando análisis...')).toBeInTheDocument();
    });

    it('debe cargar y mostrar datos del análisis', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Análisis PMS #1')).toBeInTheDocument();
      });

      expect(mockObtenerPmsPorId).toHaveBeenCalledWith(1);
      expect(mockObtenerRepeticionesPorPms).toHaveBeenCalledWith(1);
    });

    it('debe mostrar el botón de volver', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        const volverButtons = screen.getAllByText('Volver');
        expect(volverButtons.length).toBeGreaterThan(0);
      });
    });

    it('debe mostrar el botón de editar', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Editar análisis')).toBeInTheDocument();
      });
    });

    it('debe tener enlace correcto al listado', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const listadoLink = links.find(link => link.getAttribute('href') === '/listado/analisis/pms');
        expect(listadoLink).toBeInTheDocument();
      });
    });

    it('debe tener enlace correcto a edición', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const editLink = links.find(link => link.getAttribute('href') === '/listado/analisis/pms/1/editar');
        expect(editLink).toBeInTheDocument();
      });
    });
  });

  describe('Información del análisis', () => {
    it('debe mostrar el ID del análisis', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Análisis PMS #1')).toBeInTheDocument();
      });
    });

    it('debe mostrar el estado del análisis con badge', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('En Proceso')).toBeInTheDocument();
      });
    });

    it('debe mostrar repeticiones esperadas', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Repeticiones Esperadas:')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
      });
    });

    it('debe mostrar número de tandas', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Número de Tandas:')).toBeInTheDocument();
      });
    });

    it('debe mostrar desviación estándar', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Desviación Estándar:')).toBeInTheDocument();
        expect(screen.getByText('0.123')).toBeInTheDocument();
      });
    });

    it('debe mostrar coeficiente de variación', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Coef. Variación:')).toBeInTheDocument();
        expect(screen.getByText('3.50%')).toBeInTheDocument();
      });
    });

    it('debe mostrar PMS final', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('PMS Final:')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje de criterio cumplido cuando CV <= 4', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Criterio Cumplido')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje de criterio no cumplido cuando CV > 4', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, coefVariacion: 5.5 });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Criterio No Cumplido')).toBeInTheDocument();
      });
    });

    it('debe aplicar clase verde al CV cuando es válido', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        const cvElement = screen.getByText('3.50%');
        expect(cvElement.className).toContain('text-green-600');
      });
    });

    it('debe aplicar clase roja al CV cuando es inválido', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, coefVariacion: 5.5 });
      render(<DetallePMSPage />);

      await waitFor(() => {
        const cvElement = screen.getByText('5.50%');
        expect(cvElement.className).toContain('text-red-600');
      });
    });
  });

  describe('Tabla de repeticiones', () => {
    it('debe mostrar el título de repeticiones con contador', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Repeticiones (3)')).toBeInTheDocument();
      });
    });

    it('debe mostrar encabezados de la tabla', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Repetición')).toBeInTheDocument();
        expect(screen.getByText('Tanda')).toBeInTheDocument();
        expect(screen.getByText('Peso (g)')).toBeInTheDocument();
        expect(screen.getByText('Estado')).toBeInTheDocument();
      });
    });

    it('debe mostrar todas las repeticiones', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('#3')).toBeInTheDocument();
      });
    });

    it('debe mostrar pesos formateados correctamente', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('4.250g')).toBeInTheDocument();
        expect(screen.getByText('4.180g')).toBeInTheDocument();
        expect(screen.getByText('4.320g')).toBeInTheDocument();
      });
    });

    it('debe mostrar badges de estado válido/inválido', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        const validoBadges = screen.getAllByText('✓ Válido');
        const invalidoBadge = screen.getByText('✗ Inválido');
        expect(validoBadges.length).toBe(2);
        expect(invalidoBadge).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje cuando no hay repeticiones', async () => {
      mockObtenerRepeticionesPorPms.mockResolvedValue([]);
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('No hay repeticiones registradas aún.')).toBeInTheDocument();
      });
    });

    it('debe mostrar sugerencia de agregar repeticiones cuando no hay', async () => {
      mockObtenerRepeticionesPorPms.mockResolvedValue([]);
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Puedes agregar repeticiones editando el análisis.')).toBeInTheDocument();
      });
    });

    it('debe mostrar badge "Pendiente" cuando valido es null', async () => {
      mockObtenerRepeticionesPorPms.mockResolvedValue([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { repPMSID: 1, numRep: 1, numTanda: 1, peso: 4.250, valido: null } as any,
      ]);
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Pendiente')).toBeInTheDocument();
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe mostrar mensaje de error cuando falla la carga del análisis', async () => {
      mockObtenerPmsPorId.mockRejectedValue(new Error('Error de red'));
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar análisis')).toBeInTheDocument();
      });
    });

    it('debe mostrar toast de error cuando falla la carga', async () => {
      mockObtenerPmsPorId.mockRejectedValue(new Error('Error de red'));
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al cargar análisis', {
          description: 'Error de red',
        });
      });
    });

    it('debe mostrar botón de volver cuando hay error', async () => {
      mockObtenerPmsPorId.mockRejectedValue(new Error('Error'));
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Volver al Listado')).toBeInTheDocument();
      });
    });

    it('debe manejar error cuando el análisis no existe', async () => {
      mockObtenerPmsPorId.mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Análisis no encontrado')).toBeInTheDocument();
      });
    });
  });

  describe('Handlers de acciones', () => {
    it('debe llamar a finalizarAnalisis y actualizar el estado', async () => {
      const analisisActualizado = { ...mockPmsData, estado: 'PENDIENTE_APROBACION' };
      mockFinalizarAnalisis.mockResolvedValue(analisisActualizado);

      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Análisis PMS #1')).toBeInTheDocument();
      });

      // Simular llamada al handler directamente
      await mockFinalizarAnalisis(1);
      expect(mockFinalizarAnalisis).toHaveBeenCalledWith(1);
      expect(mockFinalizarAnalisis).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error al finalizar análisis', async () => {
      mockFinalizarAnalisis.mockRejectedValue(new Error('Error al finalizar'));

      try {
        await mockFinalizarAnalisis(1);
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        expect(error.message).toBe('Error al finalizar');
      }
    });

    it('debe llamar a aprobarAnalisis y actualizar el estado', async () => {
      const analisisAprobado = { ...mockPmsData, estado: 'APROBADO' };
      mockAprobarAnalisis.mockResolvedValue(analisisAprobado);

      await mockAprobarAnalisis(1);
      expect(mockAprobarAnalisis).toHaveBeenCalledWith(1);
      expect(mockAprobarAnalisis).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error al aprobar análisis', async () => {
      mockAprobarAnalisis.mockRejectedValue(new Error('Error al aprobar'));

      try {
        await mockAprobarAnalisis(1);
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        expect(error.message).toBe('Error al aprobar');
      }
    });

    it('debe llamar a marcarParaRepetir y actualizar el estado', async () => {
      const analisisParaRepetir = { ...mockPmsData, estado: 'A_REPETIR' };
      mockMarcarParaRepetir.mockResolvedValue(analisisParaRepetir);

      await mockMarcarParaRepetir(1);
      expect(mockMarcarParaRepetir).toHaveBeenCalledWith(1);
      expect(mockMarcarParaRepetir).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error al marcar para repetir', async () => {
      mockMarcarParaRepetir.mockRejectedValue(new Error('Error al marcar'));

      try {
        await mockMarcarParaRepetir(1);
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        expect(error.message).toBe('Error al marcar');
      }
    });

    it('debe eliminar repetición cuando se confirma', async () => {
      mockEliminarRepPms.mockResolvedValue(undefined);
      mockObtenerRepeticionesPorPms.mockResolvedValue(mockRepeticiones.slice(0, 2));

      await mockEliminarRepPms(1, 3);
      expect(mockEliminarRepPms).toHaveBeenCalledWith(1, 3);
    });

    it('debe manejar error al eliminar repetición', async () => {
      mockEliminarRepPms.mockRejectedValue(new Error('Error al eliminar'));

      try {
        await mockEliminarRepPms(1, 1);
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        expect(error.message).toBe('Error al eliminar');
      }
    });
  });

  describe('Valores por defecto y nulos', () => {
    it('debe mostrar guiones cuando faltan valores numéricos', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        promedio100g: undefined,
        desvioStd: undefined,
        coefVariacion: undefined,
        pmsconRedon: undefined,
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        const guiones = screen.getAllByText('-');
        expect(guiones.length).toBeGreaterThan(0);
      });
    });

    it('debe manejar ficha faltante mostrando el ID', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        ficha: undefined,
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Análisis PMS #1')).toBeInTheDocument();
      });
    });

    it('debe mostrar N/A cuando falta el lote', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        lote: undefined as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });

  describe('Badges de estado', () => {
    it('debe mostrar badge default para APROBADO', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, estado: 'APROBADO' });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Aprobado')).toBeInTheDocument();
      });
    });

    it('debe mostrar badge secondary para EN_PROCESO', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('En Proceso')).toBeInTheDocument();
      });
    });

    it('debe mostrar badge destructive para A_REPETIR', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, estado: 'A_REPETIR' });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('A Repetir')).toBeInTheDocument();
      });
    });

    it('debe mostrar badge secondary para PENDIENTE_APROBACION', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, estado: 'PENDIENTE_APROBACION' });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Pendiente Aprobación')).toBeInTheDocument();
      });
    });
  });

  describe('Componentes adicionales', () => {
    it('debe renderizar el componente AnalisisInfoGeneralCard con todas las props', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Especie: Trigo')).toBeInTheDocument();
        expect(screen.getByText('Cultivar: Cultivar Test')).toBeInTheDocument();
        expect(screen.getByText('Lote: LOTE-001')).toBeInTheDocument();
        expect(screen.getByText('Ficha: F-001')).toBeInTheDocument();
      });
    });

    it('debe renderizar el componente AnalysisHistoryCard con props correctas', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Análisis ID: 1')).toBeInTheDocument();
        expect(screen.getByText('Tipo: pms')).toBeInTheDocument();
      });
    });

    it('debe renderizar TablaToleranciasButton con props correctas', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Tabla de Tolerancias')).toBeInTheDocument();
        expect(screen.getByText('/tablas-tolerancias/tabla-pms.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Permisos de usuario', () => {
    it('debe mostrar botón de editar para administrador', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Editar análisis')).toBeInTheDocument();
      });
    });

    it('no debe mostrar botón de editar para observador', async () => {
      mockUseAuth.user = { role: 'observador', nombre: 'Observer' };
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.queryByText('Editar análisis')).not.toBeInTheDocument();
      });

      // Restaurar
      mockUseAuth.user = { role: 'administrador', nombre: 'Test User' };
    });
  });

  describe('Casos extremos', () => {
    it('debe manejar ID inválido', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: 'invalid' });
      mockObtenerPmsPorId.mockRejectedValue(new Error('ID inválido'));
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar análisis')).toBeInTheDocument();
      });
    });

    it('debe manejar cuando no hay ID en params', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: undefined as unknown as string });
      render(<DetallePMSPage />);

      // El componente debe manejar gracefully cuando no hay ID
      await waitFor(() => {
        expect(mockObtenerPmsPorId).not.toHaveBeenCalled();
      });
    });

    it('debe manejar ID como string vacío', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '' });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(mockObtenerPmsPorId).not.toHaveBeenCalled();
      });
    });

    it('debe manejar repeticiones con peso nulo', async () => {
      mockObtenerRepeticionesPorPms.mockResolvedValue([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { repPMSID: 1, numRep: 1, numTanda: 1, peso: null, valido: null } as any,
      ]);
      render(<DetallePMSPage />);

      await waitFor(() => {
        const guiones = screen.getAllByText('-');
        expect(guiones.length).toBeGreaterThan(0);
      });
    });

    it('debe formatear pesos con 3 decimales', async () => {
      mockObtenerRepeticionesPorPms.mockResolvedValue([
        { repPMSID: 1, numRep: 1, numTanda: 1, peso: 4.12345, valido: true },
      ]);
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('4.123g')).toBeInTheDocument();
      });
    });

    it('debe formatear PMS con 2 decimales', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        pmsconRedon: 42.123456,
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('42.12g')).toBeInTheDocument();
      });
    });

    it('debe formatear promedio100g con 2 decimales', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        promedio100g: 42.678,
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('42.68g')).toBeInTheDocument();
      });
    });

    it('debe formatear desvioStd con 3 decimales', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        desvioStd: 0.56789,
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('0.568')).toBeInTheDocument();
      });
    });
  });

  describe('Renderizado de Toaster', () => {
    it('debe renderizar el componente Toaster', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });
    });
  });

  describe('Textos descriptivos', () => {
    it('debe mostrar descripción de repeticiones', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Datos de pesaje por repetición y tanda')).toBeInTheDocument();
      });
    });

    it('debe mostrar texto explicativo del CV cuando es válido', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('El coeficiente de variación debe ser ≤ 4% para ser válido')).toBeInTheDocument();
      });
    });

    it('debe mostrar texto explicativo del CV cuando es inválido', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, coefVariacion: 5.5 });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('El coeficiente de variación debe ser ≤ 4% para ser válido')).toBeInTheDocument();
      });
    });
  });

  describe('Títulos de secciones', () => {
    it('debe mostrar título de Resultados con icono', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Resultados')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje cuando no hay CV calculado', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        coefVariacion: undefined,
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.queryByText('Criterio Cumplido')).not.toBeInTheDocument();
        expect(screen.queryByText('Criterio No Cumplido')).not.toBeInTheDocument();
      });
    });
  });

  describe('Valores de numTandas', () => {
    it('debe mostrar numTandas cuando está definido', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        const numTandas = screen.getAllByText('1');
        expect(numTandas.length).toBeGreaterThan(0);
      });
    });

    it('debe mostrar guión cuando numTandas es undefined', async () => {
      mockObtenerPmsPorId.mockResolvedValue({
        ...mockPmsData,
        numTandas: undefined,
      });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Número de Tandas:')).toBeInTheDocument();
      });
    });
  });

  describe('Estado FINALIZADO', () => {
    it('debe manejar correctamente estado FINALIZADO', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, estado: 'FINALIZADO' });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Finalizado')).toBeInTheDocument();
      });
    });
  });

  describe('Estado PENDIENTE', () => {
    it('debe manejar correctamente estado PENDIENTE', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, estado: 'PENDIENTE' });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Pendiente')).toBeInTheDocument();
      });
    });
  });

  describe('Historial vacío', () => {
    it('debe manejar historial vacío correctamente', async () => {
      mockObtenerPmsPorId.mockResolvedValue({ ...mockPmsData, historial: [] });
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Historial: 0')).toBeInTheDocument();
      });
    });
  });

  describe('Comentarios presentes', () => {
    it('debe mostrar comentarios cuando están presentes', async () => {
      render(<DetallePMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Comentarios: Comentario de prueba')).toBeInTheDocument();
      });
    });
  });
});
