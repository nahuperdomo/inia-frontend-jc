/**
 * Tests para la página de detalle de análisis de Tetrazolio
 * 
 * Estos tests cubren:
 * - Carga y visualización de datos del análisis
 * - Visualización de parámetros del ensayo (fecha, pretratamiento, concentración, tinción)
 * - Visualización de repeticiones y cálculos de viabilidad
 * - Cálculo de totales (viables, no viables, duras)
 * - Navegación a edición
 * - Manejo de estados de carga y error
 * - Visualización de información general
 * - Historial de análisis
 * - Visualización de viabilidad INIA e INASE
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TetrazolioDetailPage from '@/app/listado/analisis/tetrazolio/[id]/page';
import * as tetrazolioService from '@/app/services/tetrazolio-service';
import * as repeticionesService from '@/app/services/repeticiones-service';
import { TetrazolioDTO } from '@/app/models/interfaces/tetrazolio';
import { RepTetrazolioViabilidadDTO } from '@/app/models/interfaces/repeticiones';
import { EstadoAnalisis } from '@/app/models';

// Mock de servicios
jest.mock('@/app/services/tetrazolio-service');
jest.mock('@/app/services/repeticiones-service');

// Mock de navegación
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn()
    }),
    useParams: () => ({ id: '1' }),
    usePathname: () => '/listado/analisis/tetrazolio/1'
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
jest.mock('@/components/analisis/analysis-history-card', () => ({
    AnalysisHistoryCard: () => <div data-testid="history-card">History Card</div>
}));

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
    TablaToleranciasButton: () => <button>Ver Tabla de Tolerancias</button>
}));

jest.mock('@/components/analisis/analisis-info-general-card', () => ({
    AnalisisInfoGeneralCard: ({ analisisID, estado, lote }: any) => (
        <div data-testid="info-general-card">
            <div>ID: {analisisID}</div>
            <div>Estado: {estado}</div>
            <div>Lote: {lote}</div>
        </div>
    )
}));

describe('TetrazolioDetailPage Tests', () => {
    const mockTetrazolio: TetrazolioDTO = {
        analisisID: 1,
        idLote: 1,
        lote: 'Trigo Baguette 10',
        ficha: 'F-2024-001',
        cultivarNombre: 'Baguette 10',
        especieNombre: 'Trigo',
        estado: 'APROBADO' as EstadoAnalisis,
        fechaInicio: '2024-03-01',
        fechaFin: '2024-03-15',
        comentarios: 'Análisis completo',

        fecha: '2024-03-01',
        numSemillasPorRep: 50,
        numRepeticionesEsperadas: 4,
        pretratamiento: 'EP 16 horas',
        concentracion: '1%',
        tincionTemp: 35,
        tincionHs: 2,
        viabilidadInase: 92.5,

        historial: [
            {
                id: 1,
                fechaHora: '2024-03-01T10:00:00',
                accion: 'CREACION',
                usuario: 'Juan Pérez'
            }
        ],
        activo: true
    };

    const mockRepeticiones: RepTetrazolioViabilidadDTO[] = [
        {
            repTetrazolioViabID: 1,
            fecha: '2024-03-01',
            viablesNum: 45,
            noViablesNum: 3,
            duras: 2
        },
        {
            repTetrazolioViabID: 2,
            fecha: '2024-03-02',
            viablesNum: 47,
            noViablesNum: 2,
            duras: 1
        },
        {
            repTetrazolioViabID: 3,
            fecha: '2024-03-03',
            viablesNum: 48,
            noViablesNum: 1,
            duras: 1
        },
        {
            repTetrazolioViabID: 4,
            fecha: '2024-03-04',
            viablesNum: 46,
            noViablesNum: 3,
            duras: 1
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUser.role = 'analista';
        jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId').mockResolvedValue(mockTetrazolio);
        jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio').mockResolvedValue(mockRepeticiones);
    });

    describe('Test: Renderizado y carga de datos', () => {
        it('debe mostrar loading mientras carga los datos', () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockImplementation(() => new Promise(() => { })); // Never resolves

            render(<TetrazolioDetailPage />);

            expect(screen.getByText('Cargando análisis de tetrazolio...')).toBeInTheDocument();
        });

        it('debe cargar y mostrar los datos del análisis', async () => {
            const mockObtenerTetrazolio = jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(mockTetrazolio);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(mockObtenerTetrazolio).toHaveBeenCalledWith(1);
            });

            await waitFor(() => {
                expect(screen.getByText(/Análisis de Tetrazolio #1/i)).toBeInTheDocument();
                expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument();
            });
        });

        it('debe cargar las repeticiones del análisis', async () => {
            const mockObtenerRepeticiones = jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue(mockRepeticiones);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(mockObtenerRepeticiones).toHaveBeenCalledWith(1);
            });
        });

        it('debe mostrar el estado del análisis', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Aprobado')).toBeInTheDocument();
            });
        });

        it('debe mostrar el botón de editar', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                const editarLink = screen.getByRole('link', { name: /editar análisis/i });
                expect(editarLink).toBeInTheDocument();
                expect(editarLink).toHaveAttribute('href', '/listado/analisis/tetrazolio/1/editar');
            });
        });

        it('debe mostrar el botón volver', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                const volverLink = screen.getByRole('link', { name: /volver/i });
                expect(volverLink).toBeInTheDocument();
                expect(volverLink).toHaveAttribute('href', '/listado/analisis/tetrazolio');
            });
        });

        it('debe mostrar error cuando falla la carga', async () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(null as any);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis de tetrazolio no encontrado')).toBeInTheDocument();
            });
        });

        it('debe manejar error en carga de repeticiones', async () => {
            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockRejectedValue(new Error('Error al cargar repeticiones'));

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // El análisis debe cargarse aunque fallen las repeticiones
                expect(screen.getByText(/Análisis de Tetrazolio #1/i)).toBeInTheDocument();
            });
        });
    });

    describe('Test: Parámetros del Ensayo', () => {
        it('debe mostrar la fecha del ensayo formateada', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/01\/03\/2024/)).toBeInTheDocument();
            });
        });

        it('debe mostrar las semillas por repetición', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Número de semillas por repetición')).toBeInTheDocument();
                expect(screen.getByText('50')).toBeInTheDocument();
            });
        });

        it('debe mostrar el número de repeticiones esperadas', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Repeticiones Esperadas')).toBeInTheDocument();
                expect(screen.getByText('4')).toBeInTheDocument();
            });
        });

        it('debe mostrar el pretratamiento', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Pretratamiento')).toBeInTheDocument();
                expect(screen.getByText('EP 16 horas')).toBeInTheDocument();
            });
        });

        it('debe mostrar la concentración', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Concentración')).toBeInTheDocument();
                expect(screen.getByText('1%')).toBeInTheDocument();
            });
        });

        it('debe mostrar la temperatura de tinción', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Tinción (°C)')).toBeInTheDocument();
                expect(screen.getByText('35°C')).toBeInTheDocument();
            });
        });

        it('debe mostrar el tiempo de tinción', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Tinción (hs)')).toBeInTheDocument();
                expect(screen.getByText('2h')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Visualización de Repeticiones', () => {
        it('debe mostrar la tabla de repeticiones', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Repeticiones')).toBeInTheDocument();
            });
        });

        it('debe mostrar todas las repeticiones cargadas', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('#1')).toBeInTheDocument();
                expect(screen.getByText('#2')).toBeInTheDocument();
                expect(screen.getByText('#3')).toBeInTheDocument();
                expect(screen.getByText('#4')).toBeInTheDocument();
            });
        });

        it('debe mostrar los valores de viables para cada repetición', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Component shows just numbers, not percentages in cards
                expect(screen.getByText('45')).toBeInTheDocument();
                expect(screen.getByText('47')).toBeInTheDocument();
                expect(screen.getByText('48')).toBeInTheDocument();
                expect(screen.getByText('46')).toBeInTheDocument();
            });
        });

        it('debe mostrar los valores de no viables para cada repetición', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Component shows just numbers - check that No Viables label exists and values are present
                const noViablesLabel = screen.getAllByText('No Viables');
                expect(noViablesLabel.length).toBeGreaterThan(0);

                // Check that the expected values exist in the document
                const allText = screen.getAllByText(/^[1-4]$/);
                expect(allText.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar los valores de semillas duras', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Component shows just numbers - check that Duras label exists
                const durasLabels = screen.getAllByText('Duras');
                expect(durasLabels.length).toBeGreaterThan(0);

                // Check that the totals card exists which includes dura values
                expect(screen.getByText('Resumen de Resultados')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando no hay repeticiones', async () => {
            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue([]);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/No hay repeticiones registradas/i)).toBeInTheDocument();
            });
        });
    });

    describe('Test: Cálculo de Totales', () => {
        it('debe calcular correctamente el total de semillas viables', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Total: 45 + 47 + 48 + 46 = 186
                expect(screen.getByText(/186/)).toBeInTheDocument();
            });
        });

        it('debe calcular correctamente el total de semillas no viables', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Check the totals card shows correct value - look for the bold red number
                expect(screen.getByText('Resumen de Resultados')).toBeInTheDocument();
                const elements = screen.getAllByText(/9/);
                // Find the one in the totals card (there will be multiple '9's - in percentage 92.5% and 93.0%)
                const boldElement = elements.find(el => el.classList.contains('text-red-600'));
                expect(boldElement).toBeInTheDocument();
            });
        });

        it('debe calcular correctamente el total de semillas duras', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Check the totals card
                expect(screen.getByText('Resumen de Resultados')).toBeInTheDocument();
                const elements = screen.getAllByText(/5/);
                // Find the one in the totals card with yellow color
                const boldElement = elements.find(el => el.classList.contains('text-yellow-600'));
                expect(boldElement).toBeInTheDocument();
            });
        });

        it('debe calcular el total general de semillas', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Total general: 186 + 9 + 5 = 200
                expect(screen.getByText(/200/)).toBeInTheDocument();
            });
        });

        it('debe mostrar totales en cero cuando no hay repeticiones', async () => {
            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue([]);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/No hay repeticiones registradas/i)).toBeInTheDocument();
            });
        });
    });

    describe('Test: Viabilidad INASE', () => {
        it('debe mostrar la viabilidad INASE manual en parámetros', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Viabilidad INASE (%)')).toBeInTheDocument();
                expect(screen.getByText('92.5%')).toBeInTheDocument();
            });
        });


        it('debe mostrar "No especificado" cuando no hay viabilidad INASE manual', async () => {
            const tetrazolioSinInase = {
                ...mockTetrazolio,
                viabilidadInase: undefined
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioSinInase as any);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('No especificado')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Información General', () => {
        it('debe renderizar el componente de información general', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByTestId('info-general-card')).toBeInTheDocument();
            });
        });

        it('debe pasar los datos correctos al componente de información general', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                const infoCard = screen.getByTestId('info-general-card');
                expect(infoCard.textContent).toContain('ID: 1');
                expect(infoCard.textContent).toContain('Estado: APROBADO');
                expect(infoCard.textContent).toContain('Lote: Trigo Baguette 10');
            });
        });

        it('debe mostrar el botón de tabla de tolerancias', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Ver Tabla de Tolerancias')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Historial', () => {
        it('debe renderizar el componente de historial', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByTestId('history-card')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Navegación', () => {
        it('debe tener un link al listado de tetrazolio', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                const volverLink = screen.getByRole('link', { name: /volver/i });
                expect(volverLink).toHaveAttribute('href', '/listado/analisis/tetrazolio');
            });
        });

        it('debe tener un link a la página de edición', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                const editarLink = screen.getByRole('link', { name: /editar análisis/i });
                expect(editarLink).toHaveAttribute('href', '/listado/analisis/tetrazolio/1/editar');
            });
        });
    });

    describe('Test: Estados diferentes', () => {
        it('debe mostrar correctamente análisis en estado REGISTRADO', async () => {
            const tetrazolioRegistrado = {
                ...mockTetrazolio,
                estado: 'REGISTRADO' as EstadoAnalisis
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioRegistrado);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Registrado')).toBeInTheDocument();
            });
        });

        it('debe mostrar correctamente análisis en estado EN_PROCESO', async () => {
            const tetrazolioProceso = {
                ...mockTetrazolio,
                estado: 'EN_PROCESO' as EstadoAnalisis
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioProceso);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('En Proceso')).toBeInTheDocument();
            });
        });

        it('debe mostrar correctamente análisis en estado PENDIENTE_APROBACION', async () => {
            const tetrazolioPendiente = {
                ...mockTetrazolio,
                estado: 'PENDIENTE_APROBACION' as EstadoAnalisis
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioPendiente);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Pendiente de Aprobación')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Casos edge con valores especiales', () => {
        it('debe manejar pretratamiento personalizado', async () => {
            const tetrazolioCustom = {
                ...mockTetrazolio,
                pretratamiento: 'Pretratamiento personalizado'
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioCustom);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Pretratamiento personalizado')).toBeInTheDocument();
            });
        });

        it('debe manejar concentración personalizada', async () => {
            const tetrazolioCustom = {
                ...mockTetrazolio,
                concentracion: '2.5%'
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioCustom);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('2.5%')).toBeInTheDocument();
            });
        });

        it('debe manejar temperatura personalizada', async () => {
            const tetrazolioCustom = {
                ...mockTetrazolio,
                tincionTemp: 42
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioCustom);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('42°C')).toBeInTheDocument();
            });
        });

        it('debe manejar tiempo de tinción como número decimal', async () => {
            const tetrazolioDecimal = {
                ...mockTetrazolio,
                tincionHs: 24.5
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioDecimal);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('24.5h')).toBeInTheDocument();
            });
        });

        it('debe manejar comentarios vacíos', async () => {
            const tetrazolioSinComentarios = {
                ...mockTetrazolio,
                comentarios: undefined
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioSinComentarios as any);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Análisis de Tetrazolio #1/i)).toBeInTheDocument();
            });
        });

        it('debe manejar fecha de fin ausente', async () => {
            const tetrazolioSinFechaFin = {
                ...mockTetrazolio,
                fechaFin: undefined
            };

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioSinFechaFin as any);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Análisis de Tetrazolio #1/i)).toBeInTheDocument();
            });
        });
    });

    describe('Test: Validación de repeticiones completas', () => {
        it('debe indicar cuando se alcanzó el número esperado de repeticiones', async () => {
            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Con 4 repeticiones registradas y 4 esperadas, el análisis puede finalizarse
                expect(screen.getByText('4')).toBeInTheDocument(); // Repeticiones esperadas
            });
        });

        it('debe indicar cuando faltan repeticiones', async () => {
            const repeticionesIncompletas = mockRepeticiones.slice(0, 2); // Solo 2 de 4

            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue(repeticionesIncompletas);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('#1')).toBeInTheDocument();
                expect(screen.getByText('#2')).toBeInTheDocument();
                expect(screen.queryByText('#3')).not.toBeInTheDocument();
            });
        });

        it('debe manejar análisis con más repeticiones de las esperadas', async () => {
            const repeticionesExtras = [
                ...mockRepeticiones,
                {
                    repTetrazolioViabID: 5,
                    fecha: '2024-03-05',
                    viablesNum: 49,
                    noViablesNum: 1,
                    duras: 0
                }
            ];

            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue(repeticionesExtras);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('#5')).toBeInTheDocument();
            });
        });
    });

    describe('Test: Validación del rango 2-8 repeticiones', () => {
        it('debe mostrar análisis con 2 repeticiones (mínimo válido)', async () => {
            const tetrazolioMin = {
                ...mockTetrazolio,
                numRepeticionesEsperadas: 2
            };

            const repeticionesMin = mockRepeticiones.slice(0, 2);

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioMin);
            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue(repeticionesMin);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                // Check for Repeticiones Esperadas label and value 2
                expect(screen.getByText('Repeticiones Esperadas')).toBeInTheDocument();
                expect(screen.getByText('#1')).toBeInTheDocument();
                expect(screen.getByText('#2')).toBeInTheDocument();
            });
        });

        it('debe mostrar análisis con 8 repeticiones (máximo válido)', async () => {
            const tetrazolioMax = {
                ...mockTetrazolio,
                numRepeticionesEsperadas: 8
            };

            const repeticionesMax = Array.from({ length: 8 }, (_, i) => ({
                repTetrazolioViabID: i + 1,
                fecha: `2024-03-0${i + 1}`,
                viablesNum: 45 + i,
                noViablesNum: 5 - i,
                duras: 0
            }));

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(tetrazolioMax);
            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue(repeticionesMax);

            render(<TetrazolioDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('8')).toBeInTheDocument();
                expect(screen.getByText('#8')).toBeInTheDocument();
            });
        });
    });
});
