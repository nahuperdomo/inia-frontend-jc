import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListadoDOSNPage from '@/app/listado/analisis/dosn/page';
import { obtenerDosnPaginadas, desactivarDosn, activarDosn } from '@/app/services/dosn-service';
import { toast } from 'sonner';

// Mocks
jest.mock('@/app/services/dosn-service');
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

const mockUseAuth = {
    user: { role: 'administrador', nombre: 'Test User' },
    logout: jest.fn(),
};

jest.mock('@/components/auth-provider', () => ({
    useAuth: () => mockUseAuth,
}));

jest.mock('@/components/pagination', () => ({
    __esModule: true,
    default: ({ currentPage, totalPages, onPageChange }: any) => (
        <div data-testid="pagination">
            <span>Page {currentPage + 1} of {totalPages}</span>
            <button onClick={() => onPageChange(0)}>First</button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
                Previous
            </button>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
                Next
            </button>
            <button onClick={() => onPageChange(totalPages - 1)}>Last</button>
        </div>
    ),
}));

const mockObtenerDosnPaginadas = obtenerDosnPaginadas as jest.MockedFunction<typeof obtenerDosnPaginadas>;
const mockDesactivarDosn = desactivarDosn as jest.MockedFunction<typeof desactivarDosn>;
const mockActivarDosn = activarDosn as jest.MockedFunction<typeof activarDosn>;

const mockDosnData = {
    content: [
        {
            analisisID: 1,
            estado: 'APROBADO' as const,
            fechaInicio: '2024-01-15',
            fechaFin: '2024-01-20',
            lote: 'LOTE-001',
            idLote: 1,
            especieNombre: 'Trigo',
            activo: true,
            cumpleEstandar: true,
            comentarios: 'Comentario 1',
            historial: [],
        },
        {
            analisisID: 2,
            estado: 'EN_PROCESO' as const,
            fechaInicio: '2024-02-01',
            lote: 'LOTE-002',
            idLote: 2,
            especieNombre: 'Maíz',
            activo: true,
            cumpleEstandar: false,
            historial: [],
        },
        {
            analisisID: 3,
            estado: 'REGISTRADO' as const,
            fechaInicio: '2024-03-10',
            lote: 'LOTE-003',
            idLote: 3,
            especieNombre: 'Soja',
            activo: false,
            cumpleEstandar: true,
            historial: [],
        },
    ],
    totalElements: 3,
    totalPages: 1,
    last: true,
    first: true,
}; global.confirm = jest.fn(() => true);

describe('ListadoDOSNPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockObtenerDosnPaginadas.mockResolvedValue(mockDosnData);
        mockUseAuth.user = { role: 'administrador', nombre: 'Test User' };
    });

    describe('Renderizado inicial', () => {
        it('debe renderizar el componente correctamente', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis DOSN')).toBeInTheDocument();
            });
        });

        it('debe mostrar el título y descripción', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis DOSN')).toBeInTheDocument();
                expect(screen.getByText('Consulta la determinación de otras semillas en número')).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de volver', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Volver a Listados')).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de nuevo análisis para administrador', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Nuevo Análisis')).toBeInTheDocument();
            });
        });

        it('no debe mostrar botón de nuevo análisis para observador', async () => {
            mockUseAuth.user = { role: 'observador', nombre: 'Observer' };
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.queryByText('Nuevo Análisis')).not.toBeInTheDocument();
            });
        });

        it('debe renderizar el componente Toaster', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByTestId('toaster')).toBeInTheDocument();
            });
        });
    });

    describe('Estadísticas', () => {
        it('debe mostrar tarjetas de estadísticas', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Total Análisis')).toBeInTheDocument();
                expect(screen.getByText('Completados')).toBeInTheDocument();
                expect(screen.getByText('En Proceso')).toBeInTheDocument();
                expect(screen.getByText('Cumplen Norma')).toBeInTheDocument();
            });
        });

        it('debe calcular correctamente el total de análisis', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const totalElements = screen.getAllByText('3');
                expect(totalElements.length).toBeGreaterThan(0);
            });
        });

        it('debe calcular correctamente análisis completados', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getAllByText('1').length).toBeGreaterThan(0); // 1 APROBADO
            });
        });

        it('debe calcular correctamente análisis en proceso', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const enProcesoCount = screen.getAllByText('2'); // 1 EN_PROCESO + 1 REGISTRADO
                expect(enProcesoCount.length).toBeGreaterThan(0);
            });
        });

        it('debe calcular correctamente el porcentaje de cumplimiento', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('67%')).toBeInTheDocument(); // 2 de 3 cumplen
            });
        });

        it('debe mostrar 0% cuando no hay análisis', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('0%')).toBeInTheDocument();
            });
        });
    });

    describe('Filtros y búsqueda', () => {
        it('debe mostrar campo de búsqueda', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Buscar por ID análisis, Lote o Ficha...')).toBeInTheDocument();
            });
        });

        it('debe permitir escribir en el campo de búsqueda', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText('Buscar por ID análisis, Lote o Ficha...');
                fireEvent.change(searchInput, { target: { value: 'LOTE-001' } });
                expect(searchInput).toHaveValue('LOTE-001');
            });
        });

        it('debe buscar al presionar Enter', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText('Buscar por ID análisis, Lote o Ficha...');
                fireEvent.change(searchInput, { target: { value: 'LOTE-001' } });
                fireEvent.keyDown(searchInput, { key: 'Enter' });
            });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledWith(0, 10, 'LOTE-001', undefined, undefined, undefined);
            });
        });

        it('debe buscar al hacer clic en el botón de búsqueda', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText('Buscar por ID análisis, Lote o Ficha...');
                fireEvent.change(searchInput, { target: { value: 'TEST' } });
            });

            const searchButtons = screen.getAllByRole('button');
            const searchButton = searchButtons.find(btn => {
                const svg = btn.querySelector('svg');
                return svg && svg.classList.contains('lucide-search');
            });

            if (searchButton) {
                fireEvent.click(searchButton);
            }

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalled();
            });
        });

        it('debe mostrar selector de estado', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Todos los estados')).toBeInTheDocument();
            });
        });

        it('debe filtrar por estado', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const selectTrigger = screen.getByText('Todos los estados');
                fireEvent.click(selectTrigger);
            });

            await waitFor(() => {
                const aprobadoOptions = screen.getAllByText('Aprobado');
                fireEvent.click(aprobadoOptions[0]);
            });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledWith(0, 10, '', undefined, 'APROBADO', undefined);
            });
        });

        it('debe mostrar selector de activos/inactivos', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const select = screen.getByDisplayValue('Todos');
                expect(select).toBeInTheDocument();
            });
        });

        it('debe filtrar por activos', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const select = screen.getByDisplayValue('Todos');
                fireEvent.change(select, { target: { value: 'activos' } });
            });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledWith(0, 10, '', true, undefined, undefined);
            });
        });

        it('debe filtrar por inactivos', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const select = screen.getByDisplayValue('Todos');
                fireEvent.change(select, { target: { value: 'inactivos' } });
            });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledWith(0, 10, '', false, undefined, undefined);
            });
        });
    });

    describe('Tabla de análisis', () => {
        it('debe mostrar encabezados de tabla', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('ID')).toBeInTheDocument();
                expect(screen.getByText('Lote')).toBeInTheDocument();
                expect(screen.getByText('Especie')).toBeInTheDocument();
                expect(screen.getByText('Estado')).toBeInTheDocument();
                expect(screen.getByText('Cumple Estándar')).toBeInTheDocument();
                expect(screen.getByText('Acciones')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje de carga', () => {
            mockObtenerDosnPaginadas.mockImplementation(() => new Promise(() => { }));
            render(<ListadoDOSNPage />);

            expect(screen.getByText('Cargando análisis...')).toBeInTheDocument();
        });

        it('debe mostrar los análisis en la tabla', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getAllByText('1').length).toBeGreaterThan(0);
                expect(screen.getByText('LOTE-001')).toBeInTheDocument();
                expect(screen.getByText('Trigo')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando no hay análisis', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('No se encontraron análisis DOSN')).toBeInTheDocument();
            });
        });

        it('debe mostrar badges de estado correctamente', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Aprobado')).toBeInTheDocument();
                expect(screen.getByText('En Proceso')).toBeInTheDocument();
                expect(screen.getByText('Registrado')).toBeInTheDocument();
            });
        });

        it('debe mostrar badges de cumplimiento de estándar', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const siBadges = screen.getAllByText('Sí');
                const noBadges = screen.getAllByText('No');
                expect(siBadges.length).toBe(2);
                expect(noBadges.length).toBe(1);
            });
        });

        it('debe mostrar guion cuando cumpleEstandar es undefined', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: [{
                    analisisID: 1,
                    estado: 'REGISTRADO' as const,
                    fechaInicio: '2024-01-15',
                    lote: 'LOTE-001',
                    activo: true,
                    cumpleEstandar: undefined,
                    historial: [],
                }],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                const cells = screen.getAllByText('-');
                expect(cells.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Acciones', () => {
        it('debe mostrar botón de ver detalles', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const eyeButtons = screen.getAllByRole('button', { name: /Ver detalles/i });
                expect(eyeButtons.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar botón de editar para administrador', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button', { name: /Editar/i });
                expect(editButtons.length).toBeGreaterThan(0);
            });
        });

        it('no debe mostrar botón de editar para observador', async () => {
            mockUseAuth.user = { role: 'observador', nombre: 'Observer' };
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /Editar/i })).not.toBeInTheDocument();
            });
        });

        it('debe mostrar botón de desactivar para análisis activo', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const desactivarButtons = screen.getAllByRole('button', { name: /Desactivar/i });
                expect(desactivarButtons.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar botón de reactivar para análisis inactivo', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Reactivar/i })).toBeInTheDocument();
            });
        });

        it('debe desactivar análisis al hacer clic en desactivar', async () => {
            mockDesactivarDosn.mockResolvedValue(undefined);
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const desactivarButton = screen.getAllByRole('button', { name: /Desactivar/i })[0];
                fireEvent.click(desactivarButton);
            });

            await waitFor(() => {
                expect(global.confirm).toHaveBeenCalled();
                expect(mockDesactivarDosn).toHaveBeenCalledWith(1);
                expect(toast.success).toHaveBeenCalledWith('Análisis DOSN desactivado exitosamente');
            });
        });

        it('debe reactivar análisis al hacer clic en reactivar', async () => {
            mockActivarDosn.mockResolvedValue({} as any);
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const reactivarButton = screen.getByRole('button', { name: /Reactivar/i });
                fireEvent.click(reactivarButton);
            });

            await waitFor(() => {
                expect(mockActivarDosn).toHaveBeenCalledWith(3);
                expect(toast.success).toHaveBeenCalledWith('Análisis DOSN reactivado exitosamente');
            });
        });

        it('debe cancelar desactivación si usuario cancela confirmación', async () => {
            (global.confirm as jest.Mock).mockReturnValue(false);
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const desactivarButton = screen.getAllByRole('button', { name: /Desactivar/i })[0];
                fireEvent.click(desactivarButton);
            });

            await waitFor(() => {
                expect(mockDesactivarDosn).not.toHaveBeenCalled();
            });
        });

        it('debe manejar error al desactivar', async () => {
            mockDesactivarDosn.mockRejectedValue(new Error('Error de red'));
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const desactivarButton = screen.getAllByRole('button', { name: /Desactivar/i })[0];
                fireEvent.click(desactivarButton);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error al desactivar el análisis');
            });
        });

        it('debe manejar error al reactivar', async () => {
            mockActivarDosn.mockRejectedValue(new Error('Error de red'));
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const reactivarButton = screen.getByRole('button', { name: /Reactivar/i });
                fireEvent.click(reactivarButton);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error al reactivar el análisis');
            });
        });

        it('no debe mostrar botones de desactivar/reactivar para observador', async () => {
            mockUseAuth.user = { role: 'observador', nombre: 'Observer' };
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /Desactivar/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /Reactivar/i })).not.toBeInTheDocument();
            });
        });
    });

    describe('Paginación', () => {
        it('debe mostrar componente de paginación', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByTestId('pagination')).toBeInTheDocument();
            });
        });

        it('debe mostrar información de paginación', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText(/Mostrando 1 a 3 de 3 resultados/)).toBeInTheDocument();
            });
        });

        it('debe cambiar de página al hacer clic en Next', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: mockDosnData.content,
                totalElements: mockDosnData.totalElements,
                totalPages: 2,
                last: false,
                first: mockDosnData.first,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                const nextButton = screen.getByText('Next');
                fireEvent.click(nextButton);
            });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledWith(1, 10, '', undefined, undefined, undefined);
            });
        });

        it('debe mostrar "0 de 0" cuando no hay resultados', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Mostrando 0 de 0 resultados')).toBeInTheDocument();
            });
        });
    });

    describe('Formateo de datos', () => {
        it('debe formatear fechas correctamente', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalled();
            });
        });

        it('debe mostrar guion cuando no hay especie', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: [{
                    analisisID: 1,
                    estado: 'REGISTRADO' as const,
                    fechaInicio: '2024-01-15',
                    lote: 'LOTE-001',
                    activo: true,
                    especieNombre: undefined,
                    historial: [],
                }],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                const guiones = screen.getAllByText('-');
                expect(guiones.length).toBeGreaterThan(0);
            });
        });

        it('debe formatear estados correctamente', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: [
                    {
                        analisisID: 1,
                        estado: 'PENDIENTE_APROBACION' as const,
                        fechaInicio: '2024-01-15',
                        lote: 'LOTE-001',
                        activo: true,
                        historial: [],
                    },
                    {
                        analisisID: 2,
                        estado: 'A_REPETIR' as const,
                        fechaInicio: '2024-01-15',
                        lote: 'LOTE-002',
                        activo: true,
                        historial: [],
                    },
                ],
                totalElements: 2,
                totalPages: 1,
                last: true,
                first: true,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Pendiente Aprobación')).toBeInTheDocument();
                expect(screen.getByText('A Repetir')).toBeInTheDocument();
            });
        });
    });

    describe('Manejo de errores', () => {
        it('debe manejar error al cargar análisis', async () => {
            mockObtenerDosnPaginadas.mockRejectedValue(new Error('Error de red'));
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalled();
            });
        });

        it('debe mostrar tabla vacía en caso de error', async () => {
            mockObtenerDosnPaginadas.mockRejectedValue(new Error('Error'));
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('No se encontraron análisis DOSN')).toBeInTheDocument();
            });
        });
    });

    describe('Enlaces de navegación', () => {
        it('debe tener enlace correcto para ver detalles', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const detailLink = links.find(link =>
                    link.getAttribute('href') === '/listado/analisis/dosn/1'
                );
                expect(detailLink).toBeInTheDocument();
            });
        });

        it('debe tener enlace correcto para editar', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const editLink = links.find(link =>
                    link.getAttribute('href') === '/listado/analisis/dosn/1/editar'
                );
                expect(editLink).toBeInTheDocument();
            });
        });

        it('debe tener enlace correcto para nuevo análisis', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const newLink = links.find(link =>
                    link.getAttribute('href') === '/registro/analisis?tipo=DOSN'
                );
                expect(newLink).toBeInTheDocument();
            });
        });

        it('debe tener enlace correcto para volver', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const backLink = links.find(link =>
                    link.getAttribute('href') === '/listado'
                );
                expect(backLink).toBeInTheDocument();
            });
        });
    });

    describe('Efectos secundarios', () => {
        it('debe recargar datos al cambiar filtro de activos', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledTimes(1);
            });

            const select = screen.getByDisplayValue('Todos');
            fireEvent.change(select, { target: { value: 'activos' } });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledTimes(2);
            });
        });

        it('debe recargar datos al cambiar estado', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledTimes(1);
            });

            const selectTrigger = screen.getByText('Todos los estados');
            fireEvent.click(selectTrigger);

            await waitFor(() => {
                const aprobadoOption = screen.getByText('Aprobado');
                fireEvent.click(aprobadoOption);
            });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledTimes(2);
            });
        });

        it('debe resetear página a 0 al cambiar filtros', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const select = screen.getByDisplayValue('Todos');
                fireEvent.change(select, { target: { value: 'activos' } });
            });

            await waitFor(() => {
                expect(mockObtenerDosnPaginadas).toHaveBeenCalledWith(0, 10, '', true, undefined, undefined);
            });
        });
    });

    describe('Variantes de badges', () => {
        it('debe aplicar variante correcta para estado APROBADO', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const aprobadoBadge = screen.getByText('Aprobado');
                expect(aprobadoBadge).toBeInTheDocument();
            });
        });

        it('debe aplicar variante correcta para estado EN_PROCESO', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                const enProcesoBadge = screen.getByText('En Proceso');
                expect(enProcesoBadge).toBeInTheDocument();
            });
        });

        it('debe aplicar variante correcta para estado A_REPETIR', async () => {
            mockObtenerDosnPaginadas.mockResolvedValue({
                content: [{
                    analisisID: 1,
                    estado: 'A_REPETIR' as const,
                    fechaInicio: '2024-01-15',
                    lote: 'LOTE-001',
                    activo: true,
                    historial: [],
                }],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true,
            }); render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('A Repetir')).toBeInTheDocument();
            });
        });
    });

    describe('Iconos', () => {
        it('debe renderizar iconos en las tarjetas de estadísticas', async () => {
            const { container } = render(<ListadoDOSNPage />);

            await waitFor(() => {
                const activityIcons = container.querySelectorAll('.lucide-activity');
                expect(activityIcons.length).toBeGreaterThan(0);
            });
        });

        it('debe renderizar icono de alerta en tarjeta de cumplimiento', async () => {
            const { container } = render(<ListadoDOSNPage />);

            await waitFor(() => {
                const alertIcons = container.querySelectorAll('.lucide-alert-triangle');
                expect(alertIcons.length).toBeGreaterThan(0);
            });
        });

        it('debe renderizar icono de búsqueda', async () => {
            const { container } = render(<ListadoDOSNPage />);

            await waitFor(() => {
                const searchIcons = container.querySelectorAll('.lucide-search');
                expect(searchIcons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Información del título de la tabla', () => {
        it('debe mostrar el título "Lista de Análisis DOSN"', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('Lista de Análisis DOSN')).toBeInTheDocument();
            });
        });

        it('debe mostrar el conteo de análisis en la descripción', async () => {
            render(<ListadoDOSNPage />);

            await waitFor(() => {
                expect(screen.getByText('3 análisis')).toBeInTheDocument();
            });
        });
    });
});
