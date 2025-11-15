import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DosnDetailPage from '@/app/listado/analisis/dosn/[id]/page';
import { obtenerDosnPorId } from '@/app/services/dosn-service';
import type { DosnDTO } from '@/app/models';

// Mocks
jest.mock('@/app/services/dosn-service');
jest.mock('@/lib/hooks/useConfirm', () => ({
    useConfirm: () => ({
        confirm: jest.fn(),
    }),
}));

const mockUseAuth = {
    user: { role: 'administrador', nombre: 'Test User' },
    logout: jest.fn(),
};

jest.mock('@/components/auth-provider', () => ({
    useAuth: () => mockUseAuth,
}));

const mockParams = { id: '1' };
jest.mock('next/navigation', () => ({
    useParams: () => mockParams,
}));

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

jest.mock('@/components/analisis/analysis-history-card', () => ({
    AnalysisHistoryCard: ({ analisisId, analisisTipo, historial }: any) => (
        <div data-testid="analysis-history-card">
            <span>Historial Analysis ID: {analisisId}</span>
            <span>Tipo: {analisisTipo}</span>
            <span>Items: {historial?.length || 0}</span>
        </div>
    ),
}));

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
    TablaToleranciasButton: ({ pdfPath, title, variant, size }: any) => (
        <button data-testid="tabla-tolerancias-button">
            {title}
            <span data-pdfpath={pdfPath}></span>
            <span data-variant={variant}></span>
            <span data-size={size}></span>
        </button>
    ),
}));

jest.mock('@/components/analisis/analisis-info-general-card', () => ({
    AnalisisInfoGeneralCard: (props: any) => (
        <div data-testid="analisis-info-general-card">
            <span>ID: {props.analisisID}</span>
            <span>Estado: {props.estado}</span>
            <span>Lote: {props.lote}</span>
            <span>Ficha: {props.ficha}</span>
            <span>Cultivar: {props.cultivarNombre}</span>
            <span>Especie: {props.especieNombre}</span>
            <span>Fecha Inicio: {props.fechaInicio}</span>
            <span>Fecha Fin: {props.fechaFin}</span>
            <span>Cumple: {props.cumpleEstandar?.toString()}</span>
            <span>Comentarios: {props.comentarios}</span>
        </div>
    ),
}));

const mockObtenerDosnPorId = obtenerDosnPorId as jest.MockedFunction<typeof obtenerDosnPorId>;

const mockDosnData: DosnDTO = {
    analisisID: 1,
    estado: 'APROBADO',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-01-20',
    lote: 'LOTE-001',
    idLote: 1,
    ficha: 'FICHA-001',
    cultivarNombre: 'Cultivar Test',
    especieNombre: 'Trigo',
    activo: true,
    cumpleEstandar: true,
    comentarios: 'Comentario de prueba',
    historial: [
        {
            id: 1,
            fechaHora: '2024-01-15T10:00:00',
            accion: 'CREACION',
            usuario: 'admin',
            estadoNuevo: 'REGISTRADO',
        },
    ],
    fechaINIA: '2024-01-16',
    gramosAnalizadosINIA: 500,
    tipoINIA: ['COMPLETO'],
    fechaINASE: '2024-01-17',
    gramosAnalizadosINASE: 300,
    tipoINASE: ['REDUCIDO'],
    cuscutaRegistros: [
        {
            id: 1,
            instituto: 'INIA',
            cuscuta_g: 5,
            cuscutaNum: 10,
            fechaCuscuta: '2024-01-18',
        },
    ],
    listados: [
        {
            listadoID: 1,
            listadoTipo: 'MAL_TOLERANCIA_CERO',
            listadoInsti: 'INIA',
            listadoNum: 5,
            catalogo: {
                catalogoID: 1,
                nombreComun: 'Maleza Test',
                nombreCientifico: 'Maleza scientifica',
                activo: true,
            },
        },
    ],
};

describe('DosnDetailPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockObtenerDosnPorId.mockResolvedValue(mockDosnData);
        mockUseAuth.user = { role: 'administrador', nombre: 'Test User' };
    });

    describe('Estado de carga', () => {
        it('debe mostrar loader mientras carga', () => {
            mockObtenerDosnPorId.mockImplementation(() => new Promise(() => { }));
            render(<DosnDetailPage />);

            expect(screen.getByText('Cargando análisis')).toBeInTheDocument();
            expect(screen.getByText('Obteniendo detalles del DOSN...')).toBeInTheDocument();
        });

        it('debe mostrar spinner en estado de carga', () => {
            mockObtenerDosnPorId.mockImplementation(() => new Promise(() => { }));
            const { container } = render(<DosnDetailPage />);

            const spinner = container.querySelector('.lucide-loader-2');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Manejo de errores', () => {
        it('debe mostrar mensaje de error cuando falla la carga', async () => {
            mockObtenerDosnPorId.mockRejectedValue(new Error('Error de red'));
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('No se pudo cargar el análisis')).toBeInTheDocument();
                expect(screen.getByText('Error al cargar los detalles del análisis DOSN')).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de volver cuando hay error', async () => {
            mockObtenerDosnPorId.mockRejectedValue(new Error('Error'));
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Volver al listado')).toBeInTheDocument();
            });
        });

        it('debe mostrar icono de alerta en error', async () => {
            mockObtenerDosnPorId.mockRejectedValue(new Error('Error'));
            const { container } = render(<DosnDetailPage />);

            await waitFor(() => {
                const alertIcon = container.querySelector('.lucide-alert-triangle');
                expect(alertIcon).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando el análisis no existe', async () => {
            mockObtenerDosnPorId.mockResolvedValue(null as any);
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('El análisis solicitado no existe')).toBeInTheDocument();
            });
        });
    });

    describe('Renderizado del header', () => {
        it('debe mostrar título con ID del análisis', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis DOSN #1')).toBeInTheDocument();
            });
        });

        it('debe mostrar badge de estado', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Aprobado')).toBeInTheDocument();
            });
        });

        it('debe mostrar información de ficha y lote', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Ficha:')).toBeInTheDocument();
                expect(screen.getByText('1')).toBeInTheDocument();
                expect(screen.getByText('Lote:')).toBeInTheDocument();
                expect(screen.getByText('LOTE-001')).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de volver', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                const volverButton = screen.getAllByText('Volver')[0];
                expect(volverButton).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de editar para administrador', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Editar análisis')).toBeInTheDocument();
            });
        });

        it('no debe mostrar botón de editar para observador', async () => {
            mockUseAuth.user = { role: 'observador', nombre: 'Observer' };
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.queryByText('Editar análisis')).not.toBeInTheDocument();
            });
        });

        it('debe tener enlace correcto para editar', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const editLink = links.find(link =>
                    link.getAttribute('href') === '/listado/analisis/dosn/1/editar'
                );
                expect(editLink).toBeInTheDocument();
            });
        });
    });

    describe('Botón de tabla de tolerancias', () => {
        it('debe renderizar botón de tabla de tolerancias', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByTestId('tabla-tolerancias-button')).toBeInTheDocument();
            });
        });

        it('debe tener título correcto', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Ver Tabla de Tolerancias')).toBeInTheDocument();
            });
        });

        it('debe tener ruta PDF correcta', async () => {
            const { container } = render(<DosnDetailPage />);

            await waitFor(() => {
                const pdfPathElement = container.querySelector('[data-pdfpath="/tablas-tolerancias/tabla-dosn.pdf"]');
                expect(pdfPathElement).toBeInTheDocument();
            });
        });
    });

    describe('Componente de información general', () => {
        it('debe renderizar AnalisisInfoGeneralCard', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByTestId('analisis-info-general-card')).toBeInTheDocument();
            });
        });

        it('debe pasar todas las props correctamente', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('ID: 1')).toBeInTheDocument();
                expect(screen.getByText('Estado: APROBADO')).toBeInTheDocument();
                expect(screen.getByText('Lote: LOTE-001')).toBeInTheDocument();
                expect(screen.getByText('Ficha: FICHA-001')).toBeInTheDocument();
                expect(screen.getByText('Cultivar: Cultivar Test')).toBeInTheDocument();
                expect(screen.getByText('Especie: Trigo')).toBeInTheDocument();
                expect(screen.getByText('Cumple: true')).toBeInTheDocument();
                expect(screen.getByText('Comentarios: Comentario de prueba')).toBeInTheDocument();
            });
        });
    });

    describe('Sección Análisis INIA', () => {
        it('debe mostrar card de análisis INIA cuando hay datos', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis INIA')).toBeInTheDocument();
            });
        });

        it('debe mostrar fecha INIA', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('16 de enero de 2024')).toBeInTheDocument();
            });
        });

        it('debe mostrar gramos analizados INIA', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('500 g')).toBeInTheDocument();
            });
        });

        it('debe mostrar tipo INIA', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Completo')).toBeInTheDocument();
            });
        });

        it('no debe mostrar card INIA cuando no hay datos', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                fechaINIA: undefined,
                gramosAnalizadosINIA: undefined,
                tipoINIA: undefined,
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                const iniaCards = screen.queryAllByText('Análisis INIA');
                expect(iniaCards.length).toBe(0);
            });
        });

        it('debe formatear correctamente tipos INIA múltiples', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                tipoINIA: ['COMPLETO', 'REDUCIDO'],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Completo, Reducido')).toBeInTheDocument();
            });
        });

        it('debe formatear tipo REDUCIDO_LIMITADO', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                tipoINIA: ['REDUCIDO_LIMITADO'],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Reducido Limitado')).toBeInTheDocument();
            });
        });
    });

    describe('Sección Análisis INASE', () => {
        it('debe mostrar card de análisis INASE siempre', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis INASE')).toBeInTheDocument();
            });
        });

        it('debe mostrar fecha INASE', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('17 de enero de 2024')).toBeInTheDocument();
            });
        });

        it('debe mostrar gramos analizados INASE', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('300 g')).toBeInTheDocument();
            });
        });

        it('debe mostrar tipo INASE', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Reducido')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando no hay datos INASE', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                fechaINASE: undefined,
                gramosAnalizadosINASE: undefined,
                tipoINASE: undefined,
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Aún no se han ingresado valores para INASE')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando tipoINASE está vacío', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                fechaINASE: undefined,
                gramosAnalizadosINASE: undefined,
                tipoINASE: [],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Aún no se han ingresado valores para INASE')).toBeInTheDocument();
            });
        });
    });

    describe('Sección Análisis de Cuscuta', () => {
        it('debe mostrar card de cuscuta cuando hay registros', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis de Cuscuta')).toBeInTheDocument();
            });
        });

        it('debe mostrar badge con cantidad de registros', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('1 registro')).toBeInTheDocument();
            });
        });

        it('debe mostrar badge plural cuando hay múltiples registros', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                cuscutaRegistros: [
                    {
                        id: 1,
                        instituto: 'INIA',
                        cuscuta_g: 5,
                        cuscutaNum: 10,
                    },
                    {
                        id: 2,
                        instituto: 'INASE',
                        cuscuta_g: 3,
                        cuscutaNum: 7,
                    },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('2 registros')).toBeInTheDocument();
            });
        });

        it('debe mostrar instituto en badge', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('INIA')).toBeInTheDocument();
            });
        });

        it('debe mostrar gramos de cuscuta', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Gramos de Cuscuta')).toBeInTheDocument();
            });
        });

        it('debe mostrar número de semillas', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Número de Semillas')).toBeInTheDocument();
            });
        });

        it('debe mostrar badge "No contiene" cuando no hay cuscuta', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                cuscutaRegistros: [
                    {
                        id: 1,
                        instituto: 'INIA',
                        cuscuta_g: 0,
                        cuscutaNum: 0,
                    },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('No contiene')).toBeInTheDocument();
                expect(screen.getByText('No se detectó Cuscuta en la muestra')).toBeInTheDocument();
            });
        });

        it('debe mostrar badge "No contiene" cuando valores son undefined', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                cuscutaRegistros: [
                    {
                        id: 1,
                        instituto: 'INIA',
                        cuscuta_g: undefined,
                        cuscutaNum: undefined,
                    },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('No contiene')).toBeInTheDocument();
            });
        });

        it('no debe mostrar card de cuscuta cuando no hay registros', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                cuscutaRegistros: undefined,
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.queryByText('Análisis de Cuscuta')).not.toBeInTheDocument();
            });
        });

        it('debe mostrar número de registro', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Registro #1')).toBeInTheDocument();
            });
        });
    });

    describe('Sección Listados', () => {
        it('debe mostrar card de listados cuando hay datos', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Listados')).toBeInTheDocument();
            });
        });

        it('debe mostrar badge con cantidad de listados', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                const badge = screen.getByText('1');
                expect(badge).toBeInTheDocument();
            });
        });

        it('debe mostrar nombre común de especie', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Maleza Test')).toBeInTheDocument();
            });
        });

        it('debe mostrar nombre científico de especie', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Maleza scientifica')).toBeInTheDocument();
            });
        });

        it('debe mostrar tipo de listado', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Maleza Tolerancia Cero')).toBeInTheDocument();
            });
        });

        it('debe mostrar instituto del listado', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                const iniaLabels = screen.getAllByText('INIA');
                expect(iniaLabels.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar número del listado', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                const numero = screen.getByText('5');
                expect(numero).toBeInTheDocument();
            });
        });

        it('debe mostrar badge "No contiene" para tipo NO_CONTIENE', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                listados: [
                    {
                        listadoID: 1,
                        listadoTipo: 'NO_CONTIENE',
                        listadoInsti: 'INIA',
                        listadoNum: 0,
                    },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('No contiene')).toBeInTheDocument();
                expect(screen.getByText('Malezas en general')).toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje para BRASSICA sin especificación', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                listados: [
                    {
                        listadoID: 1,
                        listadoTipo: 'BRASSICA',
                        listadoInsti: 'INIA',
                        listadoNum: 0,
                        catalogo: undefined,
                        especie: undefined,
                    },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Sin especificación')).toBeInTheDocument();
                expect(screen.getByText('Las brassicas no requieren especificación de catálogo')).toBeInTheDocument();
            });
        });

        it('debe mostrar guion para OTROS sin especificación', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                listados: [
                    {
                        listadoID: 1,
                        listadoTipo: 'OTROS',
                        listadoInsti: 'INIA',
                        listadoNum: 0,
                        catalogo: undefined,
                        especie: undefined,
                    },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                const guiones = screen.getAllByText('--');
                expect(guiones.length).toBeGreaterThan(0);
            });
        });

        it('debe formatear correctamente tipos de listado', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                listados: [
                    { listadoID: 1, listadoTipo: 'MAL_TOLERANCIA', listadoInsti: 'INIA', listadoNum: 1 },
                    { listadoID: 2, listadoTipo: 'MAL_COMUNES', listadoInsti: 'INIA', listadoNum: 2 },
                    { listadoID: 3, listadoTipo: 'BRASSICA', listadoInsti: 'INIA', listadoNum: 3 },
                    { listadoID: 4, listadoTipo: 'OTROS', listadoInsti: 'INIA', listadoNum: 4 },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Maleza Tolerancia')).toBeInTheDocument();
                expect(screen.getByText('Malezas Comunes')).toBeInTheDocument();
                expect(screen.getByText('Brassica')).toBeInTheDocument();
                expect(screen.getByText('Otros Cultivos')).toBeInTheDocument();
            });
        });

        it('no debe mostrar card de listados cuando no hay datos', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                listados: undefined,
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.queryByText('Listados')).not.toBeInTheDocument();
            });
        });
    });

    describe('Componente de historial', () => {
        it('debe renderizar AnalysisHistoryCard', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByTestId('analysis-history-card')).toBeInTheDocument();
            });
        });

        it('debe pasar props correctamente al historial', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Historial Analysis ID: 1')).toBeInTheDocument();
                expect(screen.getByText('Tipo: dosn')).toBeInTheDocument();
                expect(screen.getByText('Items: 1')).toBeInTheDocument();
            });
        });
    });

    describe('Variantes de badge de estado', () => {
        it('debe aplicar variante default para REGISTRADO', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                estado: 'REGISTRADO',
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Registrado')).toBeInTheDocument();
            });
        });

        it('debe aplicar variante secondary para EN_PROCESO', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                estado: 'EN_PROCESO',
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('En Proceso')).toBeInTheDocument();
            });
        });

        it('debe aplicar variante destructive para PENDIENTE_APROBACION', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                estado: 'PENDIENTE_APROBACION',
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Pendiente Aprobación')).toBeInTheDocument();
            });
        });

        it('debe aplicar variante outline para A_REPETIR', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                estado: 'A_REPETIR',
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('A Repetir')).toBeInTheDocument();
            });
        });
    });

    describe('Formateo de fechas', () => {
        it('debe formatear fecha en formato YYYY-MM-DD', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('16 de enero de 2024')).toBeInTheDocument();
            });
        });

        it('debe manejar fecha vacía', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                fechaINIA: '',
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                const card = screen.queryByText('16 de enero de 2024');
                expect(card).not.toBeInTheDocument();
            });
        });
    });

    describe('Llamada al servicio', () => {
        it('debe llamar a obtenerDosnPorId con el ID correcto', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(mockObtenerDosnPorId).toHaveBeenCalledWith(1);
            });
        });

        it('debe llamar al servicio solo una vez', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(mockObtenerDosnPorId).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Enlaces de navegación', () => {
        it('debe tener enlace correcto para volver al listado', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const backLinks = links.filter(link =>
                    link.getAttribute('href') === '/listado/analisis/dosn'
                );
                expect(backLinks.length).toBeGreaterThan(0);
            });
        });

        it('debe tener enlace correcto para editar análisis', async () => {
            render(<DosnDetailPage />);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                const editLink = links.find(link =>
                    link.getAttribute('href') === '/listado/analisis/dosn/1/editar'
                );
                expect(editLink).toBeInTheDocument();
            });
        });
    });

    describe('Casos especiales de valores', () => {
        it('debe mostrar "No especificado" cuando tipoINIA está vacío', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                tipoINIA: [],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('No especificado')).toBeInTheDocument();
            });
        });

        it('debe mostrar guion cuando listadoNum es null', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                listados: [
                    {
                        listadoID: 1,
                        listadoTipo: 'MAL_TOLERANCIA',
                        listadoInsti: 'INIA',
                        listadoNum: null as any,
                    },
                ],
            });

            render(<DosnDetailPage />);

            await waitFor(() => {
                const guiones = screen.getAllByText('--');
                expect(guiones.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Iconos', () => {
        it('debe renderizar iconos en las cards', async () => {
            const { container } = render(<DosnDetailPage />);

            await waitFor(() => {
                const barChartIcons = container.querySelectorAll('.lucide-bar-chart-3');
                expect(barChartIcons.length).toBeGreaterThan(0);
            });
        });

        it('debe renderizar icono de FileText en listados', async () => {
            const { container } = render(<DosnDetailPage />);

            await waitFor(() => {
                const fileTextIcon = container.querySelector('.lucide-file-text');
                expect(fileTextIcon).toBeInTheDocument();
            });
        });

        it('debe renderizar icono de Edit en botón editar', async () => {
            const { container } = render(<DosnDetailPage />);

            await waitFor(() => {
                const editIcon = container.querySelector('.lucide-edit');
                expect(editIcon).toBeInTheDocument();
            });
        });

        it('debe renderizar icono de ArrowLeft en botón volver', async () => {
            const { container } = render(<DosnDetailPage />);

            await waitFor(() => {
                const arrowIcons = container.querySelectorAll('.lucide-arrow-left');
                expect(arrowIcons.length).toBeGreaterThan(0);
            });
        });
    });
});
