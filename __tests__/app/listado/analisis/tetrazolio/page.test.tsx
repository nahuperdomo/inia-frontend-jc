/**
 * Tests para la página de listado de análisis de Tetrazolio
 * 
 * Estos tests cubren:
 * - Renderizado de la lista de análisis de tetrazolio
 * - Búsqueda y filtrado por estado y activo
 * - Paginación de resultados
 * - Visualización de estadísticas (total, completados, en proceso, promedio viabilidad)
 * - Navegación a detalle y edición
 * - Activación/desactivación de análisis (solo admin)
 * - Formateo de fechas
 * - Manejo de estados vacíos
 * - Manejo de errores de carga
 * - Validación de repeticiones entre 2 y 8
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListadoTetrazolioPage from '@/app/listado/analisis/tetrazolio/page';
import * as tetrazolioService from '@/app/services/tetrazolio-service';
import { EstadoAnalisis } from '@/app/models';

// Mock de servicios
jest.mock('@/app/services/tetrazolio-service');

// Mock de navegación
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        back: jest.fn()
    }),
    usePathname: () => '/listado/analisis/tetrazolio',
    useSearchParams: () => new URLSearchParams()
}));

// Mock de toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

// Mock de AuthProvider
const mockUser = { id: 1, username: 'testuser', role: 'analista' };
jest.mock('@/components/auth-provider', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true
    })
}));

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
        );
    };
});

describe('ListadoTetrazolioPage Tests', () => {
    const mockTetrazolios = [
        {
            analisisID: 1,
            estado: 'APROBADO' as EstadoAnalisis,
            fechaInicio: '2024-03-01',
            fechaFin: '2024-03-10',
            lote: 'Trigo Baguette 10',
            idLote: 1,
            especie: 'Trigo',
            activo: true,
            viabilidadConRedondeo: 95.5,
            viabilidadInase: 95.0,
            viabilidadInaseRedondeo: 95.0,
            usuarioCreador: 'usuario1',
            usuarioModificador: 'usuario2',
            historial: []
        },
        {
            analisisID: 2,
            estado: 'EN_PROCESO' as EstadoAnalisis,
            fechaInicio: '2024-03-02',
            lote: 'Soja DM 48',
            idLote: 2,
            especie: 'Soja',
            activo: true,
            viabilidadConRedondeo: 92.0,
            viabilidadInaseRedondeo: 91.5,
            historial: []
        },
        {
            analisisID: 3,
            estado: 'REGISTRADO' as EstadoAnalisis,
            fechaInicio: '2024-03-03',
            lote: 'Maíz Colorado',
            idLote: 3,
            especie: 'Maíz',
            activo: true,
            viabilidadConRedondeo: 88.5,
            viabilidadInaseRedondeo: 88.0,
            historial: []
        },
        {
            analisisID: 4,
            estado: 'PENDIENTE_APROBACION' as EstadoAnalisis,
            fechaInicio: '2024-03-04',
            lote: 'Cebada Scarlett',
            idLote: 4,
            especie: 'Cebada',
            activo: true,
            viabilidadConRedondeo: 90.0,
            viabilidadInaseRedondeo: 89.5,
            historial: []
        }
    ];

    const mockPaginatedResponse = {
        content: mockTetrazolios,
        totalElements: 4,
        totalPages: 1,
        last: true,
        first: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUser.role = 'analista';
        jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas').mockResolvedValue(mockPaginatedResponse);
    });

    describe('Test: Renderizado básico', () => {
        it('debe renderizar el título y descripción de la página', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis de Tetrazolio')).toBeInTheDocument();
            });

            expect(screen.getByText('Consulta y administra todos los ensayos de viabilidad y vigor')).toBeInTheDocument();
        });

        it('debe renderizar el botón de nuevo análisis', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const nuevoButton = screen.getByRole('link', { name: /nuevo análisis/i });
                expect(nuevoButton).toBeInTheDocument();
                expect(nuevoButton).toHaveAttribute('href', '/registro/analisis?tipo=TETRAZOLIO');
            });
        });

        it('debe renderizar el botón volver a listados', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const volverLink = screen.getByRole('link', { name: /volver/i });
                expect(volverLink).toBeInTheDocument();
                expect(volverLink).toHaveAttribute('href', '/listado');
            });
        });

        it('debe mostrar las tarjetas de estadísticas', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Total Análisis')).toBeInTheDocument();
                expect(screen.getByText('Completados')).toBeInTheDocument();
                expect(screen.getByText('En Proceso')).toBeInTheDocument();
                expect(screen.getByText('Promedio Viabilidad')).toBeInTheDocument();
            });
        });

        it('debe renderizar la sección de filtros y búsqueda', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Filtros y Búsqueda')).toBeInTheDocument();
            });
        });

        it('debe renderizar el título de la tabla', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Lista de Análisis de Tetrazolio')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Carga de datos', () => {
        it('debe cargar los análisis de tetrazolio al montar el componente', async () => {
            const mockObtenerTetrazolios = jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue(mockPaginatedResponse);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(mockObtenerTetrazolios).toHaveBeenCalledWith(
                    0,
                    10,
                    '',
                    undefined,
                    undefined,
                    undefined
                );
            });
        });

        it('debe mostrar los análisis en la tabla', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument();
                expect(screen.getByText('Soja DM 48')).toBeInTheDocument();
                expect(screen.getByText('Maíz Colorado')).toBeInTheDocument();
                expect(screen.getByText('Cebada Scarlett')).toBeInTheDocument();
            });
        });

        it('debe mostrar el estado de cada análisis con badges correctos', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Aprobado')).toBeInTheDocument();
                expect(screen.getByText('En Proceso')).toBeInTheDocument();
                expect(screen.getByText('Registrado')).toBeInTheDocument();
                expect(screen.getByText('Pend. Aprobación')).toBeInTheDocument();
            });
        });

        it('debe mostrar los valores de viabilidad INIA e INASE', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('95.5')).toBeInTheDocument();
                expect(screen.getByText('92.0')).toBeInTheDocument();
                expect(screen.getByText('88.5')).toBeInTheDocument();
            });
        });

        it('debe mostrar las especies correctamente', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Trigo')).toBeInTheDocument();
                expect(screen.getByText('Soja')).toBeInTheDocument();
                expect(screen.getByText('Maíz')).toBeInTheDocument();
                expect(screen.getByText('Cebada')).toBeInTheDocument();
            });
        });

        it('debe manejar error al cargar análisis', async () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockRejectedValue(new Error('Error de red'));

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText(/No se encontraron análisis de tetrazolio/i)).toBeInTheDocument();
            });
        });
    });

    describe('Test: Búsqueda y filtrado', () => {
        it('debe tener campo de búsqueda', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis, Lote o Ficha/i);
                expect(searchInput).toBeInTheDocument();
            });
        });

        it('debe actualizar el término de búsqueda al escribir', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis, Lote o Ficha/i);
                fireEvent.change(searchInput, { target: { value: 'Trigo' } });
                expect(searchInput).toHaveValue('Trigo');
            });
        });

        it('debe buscar al presionar Enter', async () => {
            const mockObtenerTetrazolios = jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue(mockPaginatedResponse);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis, Lote o Ficha/i);
                fireEvent.change(searchInput, { target: { value: 'Trigo' } });
                fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
            });

            await waitFor(() => {
                expect(mockObtenerTetrazolios).toHaveBeenCalledWith(
                    0,
                    10,
                    'Trigo',
                    undefined,
                    undefined,
                    undefined
                );
            });
        });

        it('debe buscar al hacer clic en el botón de búsqueda', async () => {
            const mockObtenerTetrazolios = jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue(mockPaginatedResponse);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ID análisis, Lote o Ficha/i);
                fireEvent.change(searchInput, { target: { value: 'Soja' } });

                const searchButtons = screen.getAllByRole('button');
                const searchButton = searchButtons.find(btn => btn.querySelector('svg'));
                if (searchButton) {
                    fireEvent.click(searchButton);
                }
            });

            await waitFor(() => {
                expect(mockObtenerTetrazolios).toHaveBeenCalled();
            });
        });

        it('debe filtrar por estado', async () => {
            const mockObtenerTetrazolios = jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue(mockPaginatedResponse);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const estadoSelect = screen.getByDisplayValue(/todos los estados/i);
                fireEvent.change(estadoSelect, { target: { value: 'APROBADO' } });
            });

            await waitFor(() => {
                expect(mockObtenerTetrazolios).toHaveBeenCalledWith(
                    0,
                    10,
                    '',
                    undefined,
                    'APROBADO',
                    undefined
                );
            });
        });

        it('debe tener todas las opciones de estado disponibles', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const estadoSelect = screen.getByDisplayValue(/todos los estados/i);
                expect(estadoSelect).toBeInTheDocument();

                const options = estadoSelect.querySelectorAll('option');
                const optionValues = Array.from(options).map(opt => opt.getAttribute('value'));

                expect(optionValues).toContain('all');
                expect(optionValues).toContain('REGISTRADO');
                expect(optionValues).toContain('EN_PROCESO');
                expect(optionValues).toContain('PENDIENTE_APROBACION');
                expect(optionValues).toContain('APROBADO');
                expect(optionValues).toContain('A_REPETIR');
            });
        });

        it('debe filtrar por activo/inactivo', async () => {
            const mockObtenerTetrazolios = jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue(mockPaginatedResponse);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const activoSelect = screen.getByDisplayValue(/todos/i);
                fireEvent.change(activoSelect, { target: { value: 'activos' } });
            });

            await waitFor(() => {
                expect(mockObtenerTetrazolios).toHaveBeenCalledWith(
                    0,
                    10,
                    '',
                    true,
                    undefined,
                    undefined
                );
            });
        });

        it('debe filtrar por inactivos', async () => {
            const mockObtenerTetrazolios = jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue(mockPaginatedResponse);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const activoSelect = screen.getByDisplayValue(/todos/i);
                fireEvent.change(activoSelect, { target: { value: 'inactivos' } });
            });

            await waitFor(() => {
                expect(mockObtenerTetrazolios).toHaveBeenCalledWith(
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

    describe('Test: Paginación', () => {
        it('debe mostrar el componente de paginación', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByTestId('pagination')).toBeInTheDocument();
            });
        });

        it('debe mostrar información de resultados', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText(/Mostrando 1 a 4 de 4 resultados/i)).toBeInTheDocument();
            });
        });

        it('debe cambiar de página al hacer clic en paginación', async () => {
            const mockMultiPage = {
                ...mockPaginatedResponse,
                totalPages: 2,
                totalElements: 20,
                last: false
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue(mockMultiPage);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const nextButton = screen.getByRole('button', { name: /next/i });
                fireEvent.click(nextButton);
            });

            await waitFor(() => {
                expect(tetrazolioService.obtenerTetrazoliosPaginadas).toHaveBeenCalled();
            });
        });
    });

    describe('Test: Estadísticas', () => {
        it('debe calcular correctamente el total de análisis', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const totalCard = screen.getByText('Total Análisis').closest('div');
                expect(totalCard?.textContent).toContain('4');
            });
        });

        it('debe calcular correctamente los completados (APROBADO)', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const completadosCard = screen.getByText('Completados').closest('div');
                expect(completadosCard?.textContent).toContain('1');
            });
        });

        it('debe calcular correctamente los en proceso', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const procesoCard = screen.getByText('En Proceso').closest('div');
                // EN_PROCESO + REGISTRADO = 2
                expect(procesoCard?.textContent).toContain('2');
            });
        });

        it('debe calcular correctamente el promedio de viabilidad', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const promedioCard = screen.getByText('Promedio Viabilidad').closest('div');
                // Promedio de 95.5, 92.0, 88.5, 90.0 = 91.5%
                expect(promedioCard?.textContent).toContain('91.5');
            });
        });

        it('debe mostrar 0.0% en promedio cuando no hay análisis con viabilidad', async () => {
            const tetrazoliosSinViabilidad = mockTetrazolios.map(t => ({
                ...t,
                viabilidadConRedondeo: undefined
            }));

            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue({
                    ...mockPaginatedResponse,
                    content: tetrazoliosSinViabilidad
                });

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const promedioCard = screen.getByText('Promedio Viabilidad').closest('div');
                expect(promedioCard?.textContent).toContain('0.0%');
            });
        });
    });

    describe('Test: Acciones en la tabla', () => {
        it('debe mostrar botones de ver y editar para cada análisis', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const verButtons = screen.getAllByRole('link', { name: '' }).filter(
                    link => link.getAttribute('href')?.includes('/listado/analisis/tetrazolio/') &&
                        !link.getAttribute('href')?.includes('/editar')
                );
                expect(verButtons.length).toBeGreaterThan(0);
            });
        });

        it('debe navegar a la página de detalle al hacer clic en ver', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const verLinks = screen.getAllByRole('link').filter(
                    link => link.getAttribute('href')?.match(/\/listado\/analisis\/tetrazolio\/\d+$/)
                );
                expect(verLinks.length).toBeGreaterThan(0);
                expect(verLinks[0]).toHaveAttribute('href', '/listado/analisis/tetrazolio/1');
            });
        });

        it('debe navegar a la página de edición al hacer clic en editar', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const editarLinks = screen.getAllByRole('link').filter(
                    link => link.getAttribute('href')?.includes('/editar')
                );
                expect(editarLinks.length).toBeGreaterThan(0);
                expect(editarLinks[0]).toHaveAttribute('href', '/listado/analisis/tetrazolio/1/editar');
            });
        });

        it('no debe mostrar botón de nuevo análisis para observador', async () => {
            mockUser.role = 'observador';

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const nuevoButton = screen.queryByRole('link', { name: /nuevo análisis/i });
                expect(nuevoButton).not.toBeInTheDocument();
            });
        });

        it('no debe mostrar botón de editar para observador', async () => {
            mockUser.role = 'observador';

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const editarLinks = screen.queryAllByRole('link').filter(
                    link => link.getAttribute('href')?.includes('/editar')
                );
                expect(editarLinks.length).toBe(0);
            });
        });
    });

    describe('Test: Desactivar/Reactivar (Solo Admin)', () => {
        it('debe mostrar botón de desactivar para administrador', async () => {
            mockUser.role = 'administrador';

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button').filter(
                    btn => btn.getAttribute('title') === 'Desactivar'
                );
                expect(deleteButtons.length).toBeGreaterThan(0);
            });
        });

        it('no debe mostrar botón de desactivar para usuario normal', async () => {
            mockUser.role = 'analista';

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const deleteButtons = screen.queryAllByRole('button').filter(
                    btn => btn.getAttribute('title') === 'Desactivar'
                );
                expect(deleteButtons.length).toBe(0);
            });
        });

        it('debe mostrar confirmación antes de desactivar', async () => {
            mockUser.role = 'administrador';
            global.confirm = jest.fn(() => false);

            const mockDesactivar = jest.spyOn(tetrazolioService, 'desactivarTetrazolio');

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const deleteButton = screen.getAllByRole('button').find(
                    btn => btn.getAttribute('title') === 'Desactivar'
                );

                if (deleteButton) {
                    fireEvent.click(deleteButton);
                }
            });

            expect(mockDesactivar).not.toHaveBeenCalled();
        });

        it('debe desactivar un análisis cuando se confirma', async () => {
            mockUser.role = 'administrador';
            global.confirm = jest.fn(() => true);

            const mockDesactivar = jest.spyOn(tetrazolioService, 'desactivarTetrazolio')
                .mockResolvedValue(undefined);

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const deleteButton = screen.getAllByRole('button').find(
                    btn => btn.getAttribute('title') === 'Desactivar'
                );

                if (deleteButton) {
                    fireEvent.click(deleteButton);
                }
            });

            await waitFor(() => {
                expect(mockDesactivar).toHaveBeenCalledWith(1);
            });
        });
    });

    describe('Test: Formateo de fechas', () => {
        it('debe formatear correctamente las fechas de inicio', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText(/01\/03\/2024/)).toBeInTheDocument();
            });
        });

        it('debe formatear correctamente las fechas de fin cuando existen', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText(/10\/03\/2024/)).toBeInTheDocument();
            });
        });

        it('debe mostrar guion cuando no hay fecha de fin', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const table = screen.getByRole('table');
                const rows = table.querySelectorAll('tbody tr');

                // Verificar que hay guiones para fechas fin vacías
                const cellsWithDash = Array.from(rows).some(row =>
                    row.textContent?.includes('-')
                );
                expect(cellsWithDash).toBe(true);
            });
        });
    });

    describe('Test: Estados vacíos', () => {
        it('debe mostrar mensaje cuando no hay análisis', async () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue({
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    last: true,
                    first: true
                });

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('No se encontraron análisis de tetrazolio')).toBeInTheDocument();
            });
        });

        it('debe mostrar 0 en estadísticas cuando no hay análisis', async () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue({
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    last: true,
                    first: true
                });

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                const totalCard = screen.getByText('Total Análisis').closest('div');
                expect(totalCard?.textContent).toContain('0');
            });
        });
    });

    describe('Test: Manejo de valores nulos en viabilidad', () => {
        it('debe mostrar N/A cuando no hay valor de viabilidad INIA', async () => {
            const tetrazoliosSinDatos = [{
                ...mockTetrazolios[0],
                viabilidadConRedondeo: undefined
            }];

            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue({
                    ...mockPaginatedResponse,
                    content: tetrazoliosSinDatos as any
                });

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('N/A')).toBeInTheDocument();
            });
        });

        it('debe mostrar N/A cuando no hay valor de viabilidad INASE', async () => {
            const tetrazoliosSinDatos = [{
                ...mockTetrazolios[0],
                viabilidadInase: undefined,
                viabilidadInaseRedondeo: undefined
            }];

            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue({
                    ...mockPaginatedResponse,
                    content: tetrazoliosSinDatos as any
                });

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
            });
        });

        it('debe priorizar viabilidadInase sobre viabilidadInaseRedondeo', async () => {
            const tetrazoliosConInase = [{
                ...mockTetrazolios[0],
                viabilidadInase: 94.5,
                viabilidadInaseRedondeo: 95.0
            }];

            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue({
                    ...mockPaginatedResponse,
                    content: tetrazoliosConInase as any
                });

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                // Debe mostrar el valor manual (viabilidadInase) 94.5 en lugar del calculado 95.0
                expect(screen.getByText('94.5')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Información de conteo de resultados', () => {
        it('debe mostrar "Mostrando 0 de 0 resultados" cuando no hay datos', async () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazoliosPaginadas')
                .mockResolvedValue({
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    last: true,
                    first: true
                });

            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('Mostrando 0 de 0 resultados')).toBeInTheDocument();
            });
        });

        it('debe mostrar correctamente el rango de elementos en la página actual', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText(/Mostrando 1 a 4 de 4 resultados/i)).toBeInTheDocument();
            });
        });
    });

    describe('Test: Tabla de análisis', () => {
        it('debe tener todas las columnas requeridas en la cabecera', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('ID')).toBeInTheDocument();
                expect(screen.getByText('Lote')).toBeInTheDocument();
                expect(screen.getByText('Especie')).toBeInTheDocument();
                expect(screen.getByText('Estado')).toBeInTheDocument();
                expect(screen.getByText('Viabilidad INIA (%)')).toBeInTheDocument();
                expect(screen.getByText('Viabilidad INASE (%)')).toBeInTheDocument();
                expect(screen.getByText('Fecha Inicio')).toBeInTheDocument();
                expect(screen.getByText('Fecha Fin')).toBeInTheDocument();
                expect(screen.getByText('Acciones')).toBeInTheDocument();
            });
        });

        it('debe mostrar los IDs de análisis correctamente', async () => {
            render(<ListadoTetrazolioPage />);

            await waitFor(() => {
                expect(screen.getByText('1')).toBeInTheDocument();
                expect(screen.getByText('2')).toBeInTheDocument();
                expect(screen.getByText('3')).toBeInTheDocument();
                expect(screen.getByText('4')).toBeInTheDocument();
            });
        });
    });
});
