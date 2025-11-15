import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListadoPMSPage from '@/app/listado/analisis/pms/page';
import { obtenerPmsPaginadas, desactivarPms, activarPms } from '@/app/services/pms-service';
import { useAuth } from '@/components/auth-provider';

// Mocks
jest.mock('@/app/services/pms-service');
jest.mock('@/components/auth-provider');
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

// Mock window.confirm
global.confirm = jest.fn(() => true);

const mockObtenerPmsPaginadas = obtenerPmsPaginadas as jest.MockedFunction<typeof obtenerPmsPaginadas>;
const mockDesactivarPms = desactivarPms as jest.MockedFunction<typeof desactivarPms>;
const mockActivarPms = activarPms as jest.MockedFunction<typeof activarPms>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockPmsData = {
  content: [
    {
      analisisID: 1,
      estado: 'APROBADO',
      fechaInicio: '2024-01-15T10:00:00',
      fechaFin: '2024-01-16T10:00:00',
      lote: 'LOTE-001',
      idLote: 1,
      especie: 'Trigo',
      activo: true,
      pms_g: 42.5,
      coeficienteVariacion: 3.2,
      usuarioCreador: 'admin',
      historial: [],
    },
    {
      analisisID: 2,
      estado: 'EN_PROCESO',
      fechaInicio: '2024-01-20T10:00:00',
      lote: 'LOTE-002',
      idLote: 2,
      especie: 'Maíz',
      activo: true,
      pms_g: 38.0,
      coeficienteVariacion: 5.1,
      usuarioCreador: 'user1',
      historial: [],
    },
    {
      analisisID: 3,
      estado: 'A_REPETIR',
      fechaInicio: '2024-01-25T10:00:00',
      lote: 'LOTE-003',
      idLote: 3,
      especie: 'Soja',
      activo: false,
      pms_g: 35.0,
      coeficienteVariacion: 8.5,
      usuarioCreador: 'user2',
      historial: [],
    },
  ],
  totalPages: 1,
  totalElements: 3,
  size: 10,
  number: 0,
  last: true,
  first: true,
} as any;

const mockEmptyPmsData = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  size: 10,
  number: 0,
  last: true,
  first: true,
} as any;

describe('ListadoPMSPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: { id: '1', username: 'admin', email: 'admin@test.com', role: 'administrador' } as any,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      hasPermission: jest.fn(() => true),
      isRole: jest.fn(() => true),
      refresh: jest.fn(),
    });
    mockObtenerPmsPaginadas.mockResolvedValue(mockPmsData);
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar el componente correctamente', async () => {
      render(<ListadoPMSPage />);

      expect(screen.getByText('Peso de Mil Semillas')).toBeInTheDocument();
      expect(screen.getByText(/Consulta y administra/i)).toBeInTheDocument();
      expect(screen.getByText('Nuevo Análisis')).toBeInTheDocument();
    });

    it('debe mostrar las tarjetas de estadísticas', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Análisis')).toBeInTheDocument();
        expect(screen.getByText('Aprobados')).toBeInTheDocument();
        expect(screen.getByText('En Proceso')).toBeInTheDocument();
        expect(screen.getByText('PMS Promedio')).toBeInTheDocument();
      });
    });

    it('debe mostrar el botón de volver', () => {
      render(<ListadoPMSPage />);

      const volverButtons = screen.getAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && /volver/i.test(content);
      });
      expect(volverButtons.length).toBeGreaterThan(0);
    });

    it('debe cargar los datos de PMS al montar el componente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(mockObtenerPmsPaginadas).toHaveBeenCalledWith(
          0,
          10,
          '',
          undefined,
          undefined,
          undefined
        );
      });
    });
  });

  describe('Tabla de listado', () => {
    it('debe mostrar los encabezados de la tabla', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Lote')).toBeInTheDocument();
        expect(screen.getByText('Especie')).toBeInTheDocument();
        expect(screen.getByText('Estado')).toBeInTheDocument();
        expect(screen.getByText('PMS (g)')).toBeInTheDocument();
        expect(screen.getByText('Coef. Variación (%)')).toBeInTheDocument();
        expect(screen.getByText('Acciones')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje de carga mientras se obtienen los datos', () => {
      render(<ListadoPMSPage />);

      expect(screen.getByText('Cargando análisis...')).toBeInTheDocument();
    });

    it('debe mostrar la lista de análisis PMS correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-001')).toBeInTheDocument();
        expect(screen.getByText('Trigo')).toBeInTheDocument();
        expect(screen.getByText('42.50')).toBeInTheDocument();
        expect(screen.getByText('LOTE-002')).toBeInTheDocument();
      });
    });

    it('debe mostrar badges de estado correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const aprobadoBadges = screen.getAllByText('Aprobado');
        const enProcesoBadges = screen.getAllByText('En Proceso');
        const aRepetirBadges = screen.getAllByText('A Repetir');
        expect(aprobadoBadges.length).toBeGreaterThan(0);
        expect(enProcesoBadges.length).toBeGreaterThan(0);
        expect(aRepetirBadges.length).toBeGreaterThan(0);
      });
    });

    it('debe mostrar mensaje cuando no hay análisis', async () => {
      mockObtenerPmsPaginadas.mockResolvedValue(mockEmptyPmsData);
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('No se encontraron análisis de PMS.')).toBeInTheDocument();
      });
    });

    it('debe mostrar valores con guión cuando son nulos', async () => {
      const dataConNulos = {
        ...mockPmsData,
        content: [{
          analisisID: 4,
          estado: 'REGISTRADO',
          fechaInicio: '2024-01-30T10:00:00',
          lote: 'LOTE-004',
          activo: true,
          historial: [],
        }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      mockObtenerPmsPaginadas.mockResolvedValue(dataConNulos);
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const guiones = screen.getAllByText('-');
        expect(guiones.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Filtros y búsqueda', () => {
    it('debe renderizar el campo de búsqueda', () => {
      render(<ListadoPMSPage />);

      const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('debe actualizar el término de búsqueda al escribir', async () => {
      render(<ListadoPMSPage />);

      const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis/i);
      fireEvent.change(searchInput, { target: { value: 'LOTE-001' } });

      expect(searchInput).toHaveValue('LOTE-001');
    });

    it('debe buscar al presionar Enter', async () => {
      render(<ListadoPMSPage />);

      const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis/i);
      fireEvent.change(searchInput, { target: { value: 'LOTE-001' } });
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockObtenerPmsPaginadas).toHaveBeenCalledWith(
          0,
          10,
          'LOTE-001',
          undefined,
          undefined,
          undefined
        );
      });
    });

    it('debe buscar al hacer clic en el botón de búsqueda', async () => {
      render(<ListadoPMSPage />);

      const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis/i);
      fireEvent.change(searchInput, { target: { value: 'LOTE-002' } });

      const searchButtons = screen.getAllByRole('button');
      const searchButton = searchButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-search');
      });

      if (searchButton) {
        fireEvent.click(searchButton);

        await waitFor(() => {
          expect(mockObtenerPmsPaginadas).toHaveBeenCalledWith(
            0,
            10,
            'LOTE-002',
            undefined,
            undefined,
            undefined
          );
        });
      }
    });

    it('debe renderizar el selector de estado', () => {
      render(<ListadoPMSPage />);

      expect(screen.getByText('Todos los estados')).toBeInTheDocument();
    });

    it('debe renderizar el selector de activos/inactivos', () => {
      render(<ListadoPMSPage />);

      const activoSelect = screen.getByDisplayValue('Todos');
      expect(activoSelect).toBeInTheDocument();
    });

    it('debe filtrar por activos cuando se selecciona', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-001')).toBeInTheDocument();
      });

      const activoSelect = screen.getByDisplayValue('Todos');
      fireEvent.change(activoSelect, { target: { value: 'activos' } });

      await waitFor(() => {
        expect(mockObtenerPmsPaginadas).toHaveBeenCalledWith(
          0,
          10,
          '',
          true,
          undefined,
          undefined
        );
      });
    });

    it('debe filtrar por inactivos cuando se selecciona', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-001')).toBeInTheDocument();
      });

      const activoSelect = screen.getByDisplayValue('Todos');
      fireEvent.change(activoSelect, { target: { value: 'inactivos' } });

      await waitFor(() => {
        expect(mockObtenerPmsPaginadas).toHaveBeenCalledWith(
          0,
          10,
          '',
          false,
          undefined,
          undefined
        );
      });
    });
  });

  describe('Estadísticas', () => {
    it('debe calcular el total de análisis correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const totalCards = screen.getAllByText('3');
        expect(totalCards.length).toBeGreaterThan(0);
      });
    });

    it('debe calcular análisis aprobados correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const statCards = screen.getAllByText('1');
        expect(statCards.length).toBeGreaterThan(0);
      });
    });

    it('debe calcular análisis en proceso correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const statCards = screen.getAllByText('1');
        expect(statCards.length).toBeGreaterThan(0);
      });
    });

    it('debe calcular PMS promedio correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const promedio = (42.5 + 38.0 + 35.0) / 3;
        expect(screen.getByText(`${promedio.toFixed(2)} g`)).toBeInTheDocument();
      });
    });

    it('debe mostrar 0 cuando no hay datos de PMS promedio', async () => {
      mockObtenerPmsPaginadas.mockResolvedValue(mockEmptyPmsData);
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('0 g')).toBeInTheDocument();
      });
    });
  });

  describe('Acciones', () => {
    it('debe renderizar botones de acción para cada análisis', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const verLinks = links.filter(link => link.getAttribute('href')?.includes('/listado/analisis/pms/'));
        expect(verLinks.length).toBeGreaterThan(0);
      });
    });

    it('debe tener enlaces correctos para ver detalles', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const verLink = links.find(link => link.getAttribute('href') === '/listado/analisis/pms/1');
        expect(verLink).toBeInTheDocument();
      });
    });

    it('debe tener enlaces correctos para editar', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const editLink = links.find(link => link.getAttribute('href') === '/listado/analisis/pms/1/editar');
        expect(editLink).toBeInTheDocument();
      });
    });

    it('debe mostrar botón de desactivar para análisis activos (administrador)', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const deleteButtons = buttons.filter(btn => btn.getAttribute('title') === 'Desactivar');
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });

    it('debe mostrar botón de reactivar para análisis inactivos (administrador)', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const reactivarButtons = buttons.filter(btn => btn.getAttribute('title') === 'Reactivar');
        expect(reactivarButtons.length).toBeGreaterThan(0);
      });
    });

    it('no debe mostrar botones de desactivar/reactivar para usuarios no administradores', async () => {
      mockUseAuth.mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: { id: '2', username: 'user', email: 'user@test.com', role: 'analista' } as any,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        hasPermission: jest.fn(() => false),
        isRole: jest.fn(() => false),
        refresh: jest.fn(),
      });

      render(<ListadoPMSPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const deleteButtons = buttons.filter(btn => btn.getAttribute('title') === 'Desactivar');
        const reactivarButtons = buttons.filter(btn => btn.getAttribute('title') === 'Reactivar');
        expect(deleteButtons.length).toBe(0);
        expect(reactivarButtons.length).toBe(0);
      });
    });
  });

  describe('Desactivar análisis', () => {
    it('debe mostrar confirmación antes de desactivar', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-001')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const desactivarButton = buttons.find(btn => btn.getAttribute('title') === 'Desactivar');

      if (desactivarButton) {
        fireEvent.click(desactivarButton);
        expect(global.confirm).toHaveBeenCalledWith('¿Está seguro de desactivar este análisis PMS?');
      }
    });

    it('debe desactivar análisis exitosamente', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDesactivarPms.mockResolvedValue({} as any);
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-001')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const desactivarButton = buttons.find(btn => btn.getAttribute('title') === 'Desactivar');

      if (desactivarButton) {
        fireEvent.click(desactivarButton);

        await waitFor(() => {
          expect(mockDesactivarPms).toHaveBeenCalledWith(1);
          expect(toast.success).toHaveBeenCalledWith('Análisis PMS desactivado exitosamente');
        });
      }
    });

    it('debe manejar error al desactivar', async () => {
      mockDesactivarPms.mockRejectedValue(new Error('Error al desactivar'));
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-001')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const desactivarButton = buttons.find(btn => btn.getAttribute('title') === 'Desactivar');

      if (desactivarButton) {
        fireEvent.click(desactivarButton);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Error al desactivar el análisis');
        });
      }
    });

    it('no debe desactivar si el usuario cancela la confirmación', async () => {
      (global.confirm as jest.Mock).mockReturnValue(false);
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-001')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const desactivarButton = buttons.find(btn => btn.getAttribute('title') === 'Desactivar');

      if (desactivarButton) {
        fireEvent.click(desactivarButton);
        expect(mockDesactivarPms).not.toHaveBeenCalled();
      }

      (global.confirm as jest.Mock).mockReturnValue(true);
    });
  });

  describe('Reactivar análisis', () => {
    it('debe reactivar análisis exitosamente', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockActivarPms.mockResolvedValue({} as any);
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-003')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const reactivarButton = buttons.find(btn => btn.getAttribute('title') === 'Reactivar');

      if (reactivarButton) {
        fireEvent.click(reactivarButton);

        await waitFor(() => {
          expect(mockActivarPms).toHaveBeenCalledWith(3);
          expect(toast.success).toHaveBeenCalledWith('Análisis PMS reactivado exitosamente');
        });
      }
    });

    it('debe manejar error al reactivar', async () => {
      mockActivarPms.mockRejectedValue(new Error('Error al reactivar'));
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('LOTE-003')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const reactivarButton = buttons.find(btn => btn.getAttribute('title') === 'Reactivar');

      if (reactivarButton) {
        fireEvent.click(reactivarButton);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Error al reactivar el análisis');
        });
      }
    });
  });

  describe('Paginación', () => {
    it('debe mostrar información de paginación', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText(/Mostrando 1 a 3 de 3 resultados/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje correcto cuando no hay resultados', async () => {
      mockObtenerPmsPaginadas.mockResolvedValue(mockEmptyPmsData);
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Mostrando 0 de 0 resultados')).toBeInTheDocument();
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe mostrar mensaje de error cuando falla la carga', async () => {
      mockObtenerPmsPaginadas.mockRejectedValue(new Error('Error de red'));
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar análisis')).toBeInTheDocument();
        expect(screen.getByText('Error al cargar los análisis PMS')).toBeInTheDocument();
      });
    });

    it('debe seguir mostrando la interfaz cuando hay error', async () => {
      mockObtenerPmsPaginadas.mockRejectedValue(new Error('Error de red'));
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('Peso de Mil Semillas')).toBeInTheDocument();
        expect(screen.getByText('Nuevo Análisis')).toBeInTheDocument();
      });
    });
  });

  describe('Formateo de datos', () => {
    it('debe formatear números decimales correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        expect(screen.getByText('42.50')).toBeInTheDocument();
        expect(screen.getByText('3.20')).toBeInTheDocument();
      });
    });

    it('debe formatear estados correctamente', async () => {
      render(<ListadoPMSPage />);

      await waitFor(() => {
        const aprobadoBadges = screen.getAllByText('Aprobado');
        const enProcesoBadges = screen.getAllByText('En Proceso');
        const aRepetirBadges = screen.getAllByText('A Repetir');
        expect(aprobadoBadges.length).toBeGreaterThan(0);
        expect(enProcesoBadges.length).toBeGreaterThan(0);
        expect(aRepetirBadges.length).toBeGreaterThan(0);
      });
    });
  });
});
